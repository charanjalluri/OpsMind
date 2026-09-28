import logging
from typing import Optional, Set
from backend.app.memory.hindsight import HindsightMemory
from backend.app.memory.memory_types import EngineeringMemory
from backend.app.schemas.incident import (
    MemoryRetainRequest,
    MemoryRetainResponse,
    IncidentResolutionRequest,
)

logger = logging.getLogger(__name__)

# In-memory tracking of retained document IDs for idempotency
RETAINED_DOCUMENT_IDS: Set[str] = set()


def retain_engineering_memory(
    memory: EngineeringMemory,
    hindsight_memory: HindsightMemory,
    bank_id: Optional[str] = None,
) -> MemoryRetainResponse:
    """
    Retain a structured EngineeringMemory object into Hindsight.

    Converts the domain model into a structured experience document,
    extracts metadata and tags, and stores it in Hindsight.
    Uses deterministic document_id for idempotency.
    """
    target_bank = bank_id or hindsight_memory.default_bank_id
    doc_id = memory.incident_id or f"MEM-{memory.service}-{memory.memory_type}"
    content = memory.to_experience_document()
    metadata = memory.extract_metadata()
    tags = memory.extract_tags()

    is_duplicate = doc_id in RETAINED_DOCUMENT_IDS
    if is_duplicate:
        logger.info(f"Document '{doc_id}' was already retained; updating existing memory in Hindsight bank '{target_bank}'")

    logger.info(f"Retaining memory {doc_id} to Hindsight bank {target_bank}")
    response = hindsight_memory.retain(
        bank_id=target_bank,
        content=content,
        document_id=doc_id,
        context=f"Engineering experience record for {memory.service} ({memory.memory_type})",
        metadata=metadata,
        tags=tags,
    )

    RETAINED_DOCUMENT_IDS.add(doc_id)

    return MemoryRetainResponse(
        success=getattr(response, "success", True),
        incident_id=memory.incident_id,
        bank_id=target_bank,
        items_count=getattr(response, "items_count", 1),
        message=f"Memory '{doc_id}' successfully retained in Hindsight bank '{target_bank}'",
    )


def retain_from_request(
    request: MemoryRetainRequest,
    hindsight_memory: HindsightMemory,
    bank_id: Optional[str] = None,
) -> MemoryRetainResponse:
    """Retain memory from an API MemoryRetainRequest."""
    root_cause = request.get_effective_root_cause()
    successful = request.get_effective_successful_actions()
    failed = request.get_effective_failed_actions()
    lessons = request.get_effective_lessons_learned()

    memory = EngineeringMemory(
        incident_id=request.incident_id,
        memory_type=request.memory_type or "incident_postmortem",
        title=request.title or (f"{request.service} - {root_cause[:60]}" if root_cause else f"{request.service} incident"),
        service=request.service,
        environment=request.environment,
        severity=request.severity,
        deployment_version=request.deployment_version,
        symptoms=request.symptoms,
        suspected_cause=request.suspected_cause,
        confirmed_root_cause=root_cause,
        investigation_steps=request.investigation_steps,
        actions_taken=request.actions_taken,
        resolution=request.resolution,
        outcome=request.outcome,
        impact=request.impact,
        duration=request.duration,
        failed_approaches=failed,
        successful_approaches=successful,
        engineering_decisions=request.engineering_decisions,
        warnings=request.warnings,
        lessons_learned=lessons,
        tags=request.tags,
    )
    return retain_engineering_memory(memory, hindsight_memory, bank_id=bank_id)


def retain_from_resolution_request(
    request: IncidentResolutionRequest,
    hindsight_memory: HindsightMemory,
    bank_id: Optional[str] = None,
) -> MemoryRetainResponse:
    """Retain memory from an SRE postmortem IncidentResolutionRequest."""
    lessons: list[str] = []
    if isinstance(request.lessons_learned, str) and request.lessons_learned.strip():
        lessons = [request.lessons_learned.strip()]
    elif isinstance(request.lessons_learned, list):
        lessons = [str(l).strip() for l in request.lessons_learned if str(l).strip()]

    title = f"{request.service} Postmortem: {request.root_cause[:60]}"

    memory = EngineeringMemory(
        incident_id=request.incident_id,
        memory_type="incident_postmortem",
        title=title,
        service=request.service,
        environment=request.environment,
        severity=request.severity,
        deployment_version=request.deployment_version,
        symptoms=request.symptoms,
        suspected_cause=None,
        confirmed_root_cause=request.root_cause,
        investigation_steps=request.investigation_steps,
        actions_taken=request.actions_taken,
        resolution=request.resolution,
        outcome=request.outcome,
        failed_approaches=request.failed_actions,
        successful_approaches=request.successful_actions,
        warnings=request.warnings,
        lessons_learned=lessons,
        tags=["postmortem", request.service, request.severity.lower() if request.severity else "sev"],
    )
    return retain_engineering_memory(memory, hindsight_memory, bank_id=bank_id)
