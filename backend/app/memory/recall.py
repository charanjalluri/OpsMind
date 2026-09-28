import logging
from typing import Optional, List, Dict, Any
from hindsight_client import RecallResponse
from backend.app.memory.hindsight import HindsightMemory
from backend.app.schemas.incident import (
    MemoryRecallResponse,
    MemoryRecallResultItem,
)

logger = logging.getLogger(__name__)


def construct_incident_query(
    service: str,
    symptoms: List[str],
    deployment_version: Optional[str] = None,
    environment: str = "production",
) -> str:
    """
    Construct a focused query for Hindsight to retrieve relevant engineering experience.
    """
    symptoms_text = "; ".join(symptoms) if symptoms else "service degradation"
    parts = [
        f"Service: {service}",
        f"Environment: {environment}",
        f"Symptoms: {symptoms_text}",
    ]
    if deployment_version:
        parts.append(f"Deployment: {deployment_version}")

    return " | ".join(parts)


def recall_engineering_memories(
    query: str,
    hindsight_memory: HindsightMemory,
    bank_id: Optional[str] = None,
    max_tokens: int = 4096,
    tags: Optional[List[str]] = None,
) -> MemoryRecallResponse:
    """
    Execute recall query against Hindsight and package into structured API response.
    """
    target_bank = bank_id or hindsight_memory.default_bank_id
    raw_response: RecallResponse = hindsight_memory.recall(
        query=query,
        bank_id=target_bank,
        max_tokens=max_tokens,
        tags=tags,
    )

    items: List[MemoryRecallResultItem] = []
    if raw_response and raw_response.results:
        for res in raw_response.results:
            items.append(
                MemoryRecallResultItem(
                    id=getattr(res, "id", None),
                    text=getattr(res, "text", ""),
                    type=getattr(res, "type", None),
                    context=getattr(res, "context", None),
                    tags=getattr(res, "tags", []) or [],
                    metadata=getattr(res, "metadata", {}) or {},
                )
            )

    prompt_rep: Optional[str] = None
    if hasattr(raw_response, "to_prompt_string"):
        try:
            prompt_rep = raw_response.to_prompt_string()
        except Exception as e:
            logger.warning(f"Failed to generate to_prompt_string: {e}")
            prompt_rep = "\n\n".join([f"- {it.text}" for it in items])
    elif items:
        prompt_rep = "\n\n".join([f"- {it.text}" for it in items])

    return MemoryRecallResponse(
        query=query,
        bank_id=target_bank,
        count=len(items),
        results=items,
        prompt_representation=prompt_rep,
    )
