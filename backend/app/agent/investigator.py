import logging
from typing import Optional
from backend.app.config import Settings, get_settings
from backend.app.memory.hindsight import HindsightMemory, HindsightConfigurationError, HindsightServiceError
from backend.app.memory.recall import construct_incident_query
from backend.app.llm.muse import MuseClient, MetaModelConfigurationError, MetaModelServiceError
from backend.app.agent.prompts import SYSTEM_PROMPT, build_investigation_user_prompt
from backend.app.schemas.incident import (
    IncidentInvestigationRequest,
    InvestigationResult,
    HistoricalEvidenceItem,
)

logger = logging.getLogger(__name__)


class OpsMindInvestigator:
    """
    Core investigation pipeline orchestrator.
    Combines Hindsight persistent memory retrieval with Meta Muse Spark 1.3 reasoning.
    """

    def __init__(
        self,
        hindsight_memory: Optional[HindsightMemory] = None,
        muse_client: Optional[MuseClient] = None,
        settings: Optional[Settings] = None,
    ):
        self._settings = settings or get_settings()
        self.hindsight_memory = hindsight_memory or HindsightMemory(settings=self._settings)
        self.muse_client = muse_client or MuseClient(settings=self._settings)

    def investigate(self, request: IncidentInvestigationRequest) -> InvestigationResult:
        """
        Execute full incident investigation:
        1. Construct recall query from incident telemetry.
        2. Retrieve matching memories from Hindsight.
        3. Build evidence package.
        4. Invoke Meta Muse Spark 1.3 for evidence-grounded reasoning.
        5. Return structured InvestigationResult.
        """
        logger.info(f"Starting investigation for incident {request.incident_id} on service {request.service}")

        # Step 1: Construct recall query
        recall_query = construct_incident_query(
            service=request.service,
            symptoms=request.symptoms,
            deployment_version=request.deployment_version,
            environment=request.environment,
        )

        # Step 2: Hindsight Recall
        historical_context: Optional[str] = None
        raw_evidence_count = 0
        hindsight_available = False

        if self.hindsight_memory.is_configured:
            try:
                recall_response = self.hindsight_memory.recall(
                    query=recall_query,
                    bank_id=self.hindsight_memory.default_bank_id,
                    max_tokens=1500,
                )
                hindsight_available = True
                if recall_response and recall_response.results:
                    raw_evidence_count = len(recall_response.results)
                    if hasattr(recall_response, "to_prompt_string"):
                        historical_context = recall_response.to_prompt_string()
                    else:
                        historical_context = "\n\n".join(
                            [f"- [{r.id or 'FACT'}] {r.text}" for r in recall_response.results]
                        )
                logger.info(f"Hindsight recall returned {raw_evidence_count} results for incident {request.incident_id}")
            except (HindsightConfigurationError, HindsightServiceError) as e:
                logger.warning(f"Hindsight recall was not completed: {e}")
                historical_context = None
                raw_evidence_count = 0
        else:
            logger.info("Hindsight is not configured. Proceeding with empty historical memory context.")

        # Step 3: Build prompts for Muse Spark 1.3
        user_prompt = build_investigation_user_prompt(
            incident_id=request.incident_id,
            service=request.service,
            environment=request.environment,
            symptoms=request.symptoms,
            deployment_version=request.deployment_version,
            description=request.description,
            historical_memory_context=historical_context,
            raw_memory_count=raw_evidence_count,
        )

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ]

        # Step 4: Invoke Muse Spark 1.3
        if not self.muse_client.is_configured:
            raise MetaModelConfigurationError(
                "META_MODEL_API_KEY is not configured. "
                "Please configure META_MODEL_API_KEY in your .env file to enable Muse Spark 1.3 reasoning."
            )

        data = self.muse_client.generate_json(messages=messages)

        # Step 5: Parse and map into structured schema
        historical_evidence_items: list[HistoricalEvidenceItem] = []
        for raw_item in data.get("historical_evidence", []):
            if isinstance(raw_item, dict):
                historical_evidence_items.append(
                    HistoricalEvidenceItem(
                        incident_id=raw_item.get("incident_id"),
                        service=raw_item.get("service") or request.service,
                        summary=raw_item.get("summary", ""),
                        relevance_to_current=raw_item.get("relevance_to_current", ""),
                        past_root_cause=raw_item.get("past_root_cause"),
                        effective_actions=raw_item.get("effective_actions", []),
                        dangerous_actions=raw_item.get("dangerous_actions", []),
                        lessons_learned=raw_item.get("lessons_learned", []),
                    )
                )

        has_memories = bool(historical_evidence_items and raw_evidence_count > 0)

        result = InvestigationResult(
            incident_id=request.incident_id,
            service=request.service,
            incident_summary=data.get("incident_summary", f"Investigation of {request.service} incident"),
            historical_evidence=historical_evidence_items,
            possible_root_causes=data.get("possible_root_causes", []),
            recommended_steps=data.get("recommended_steps", []),
            warnings=data.get("warnings", []),
            confidence=data.get("confidence", "Moderate" if has_memories else "Low - Insufficient Historical Evidence"),
            memory_used=data.get("memory_used", has_memories),
            memory_bank_id=self.hindsight_memory.default_bank_id if hindsight_available else None,
            raw_evidence_count=raw_evidence_count,
        )

        return result
