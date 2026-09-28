import json
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from backend.app.config import Settings, get_settings
from backend.app.memory.hindsight import (
    HindsightMemory,
    HindsightConfigurationError,
    HindsightServiceError,
)
from backend.app.memory.retain import retain_from_request
from backend.app.memory.recall import recall_engineering_memories
from backend.app.schemas.incident import (
    MemoryRetainRequest,
    MemoryRetainResponse,
    MemoryRecallRequest,
    MemoryRecallResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/memory", tags=["Memory"])

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
SEED_FILE = BASE_DIR / "data" / "seed" / "incidents.json"


class MemoryKnowledgeBase(BaseModel):
    bank_id: str
    total_memories: int
    categories: Dict[str, int]
    memories: List[Dict[str, Any]]


def get_hindsight_memory(settings: Settings = Depends(get_settings)) -> HindsightMemory:
    """Dependency provider for HindsightMemory service."""
    return HindsightMemory(settings=settings)


DYNAMIC_MEMORIES: List[Dict[str, Any]] = []


def add_retained_memory(record: Dict[str, Any]) -> None:
    """Store dynamically retained memory into knowledge catalog so it appears in Memory Explorer."""
    inc_id = record.get("incident_id")
    if inc_id:
        # Deduplicate if this incident was previously stored
        for i, existing in enumerate(DYNAMIC_MEMORIES):
            if existing.get("incident_id", "").upper() == inc_id.upper():
                DYNAMIC_MEMORIES[i] = record
                return
    DYNAMIC_MEMORIES.insert(0, record)


@router.get(
    "/knowledge",
    response_model=MemoryKnowledgeBase,
    summary="Retrieve curated engineering memories stored in persistent knowledge base",
)
def get_memory_knowledge(settings: Settings = Depends(get_settings)) -> MemoryKnowledgeBase:
    """Retrieve full catalog of engineering memories, policies, and lessons learned (seed + dynamically learned)."""
    seed_memories: List[Dict[str, Any]] = []
    if SEED_FILE.exists():
        try:
            with open(SEED_FILE, "r", encoding="utf-8") as f:
                seed_memories = json.load(f)
        except Exception as e:
            logger.error(f"Failed to read seed incidents: {e}")

    # Merge dynamic learned memories with seed catalog (dynamic first, deduplicated by incident_id)
    known_ids = {m.get("incident_id") for m in DYNAMIC_MEMORIES if m.get("incident_id")}
    filtered_seeds = [s for s in seed_memories if s.get("incident_id") not in known_ids]
    all_memories = DYNAMIC_MEMORIES + filtered_seeds

    categories: Dict[str, int] = {
        "incidents": len([m for m in all_memories if m.get("memory_type") in ("incident", "incident_postmortem")]),
        "decisions": len([m for m in all_memories if m.get("memory_type") == "decision"]),
        "lessons": sum(len(m.get("lessons_learned", [])) for m in all_memories),
        "warnings": sum(len(m.get("warnings", [])) for m in all_memories),
    }

    return MemoryKnowledgeBase(
        bank_id=settings.hindsight_bank_id,
        total_memories=len(all_memories),
        categories=categories,
        memories=all_memories,
    )


@router.post(
    "/retain",
    response_model=MemoryRetainResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Store engineering experience into Hindsight",
)
def retain_memory(
    request: MemoryRetainRequest,
    memory_service: HindsightMemory = Depends(get_hindsight_memory),
) -> MemoryRetainResponse:
    """Store new incident resolution, postmortem, or engineering decision into Hindsight."""
    try:
        response = retain_from_request(request, memory_service)

        # Store in dynamic knowledge catalog
        root_cause = request.get_effective_root_cause()
        lessons = request.get_effective_lessons_learned()
        successful = request.get_effective_successful_actions()
        failed = request.get_effective_failed_actions()

        add_retained_memory({
            "incident_id": request.incident_id,
            "memory_type": request.memory_type or "incident_postmortem",
            "title": request.title or (f"Postmortem: {request.service} - {root_cause[:60]}" if root_cause else f"{request.service} experience"),
            "service": request.service,
            "environment": request.environment,
            "severity": request.severity or "SEV-1",
            "deployment_version": request.deployment_version,
            "symptoms": request.symptoms,
            "confirmed_root_cause": root_cause,
            "resolution": request.resolution,
            "outcome": request.outcome,
            "failed_approaches": failed,
            "successful_approaches": successful,
            "warnings": request.warnings,
            "lessons_learned": lessons,
            "tags": list(dict.fromkeys(["postmortem", request.service] + request.tags)),
            "retained_at": "Just now",
        })

        # Update in-memory incident if incident_id matches
        if request.incident_id:
            try:
                from backend.app.api.incidents import mark_incident_resolved
                mark_incident_resolved(
                    incident_id=request.incident_id,
                    root_cause=root_cause or "Diagnosed root cause",
                    resolution=request.resolution,
                    outcome=request.outcome,
                    retained_memory_id=request.incident_id,
                )
            except Exception as ex:
                logger.warning(f"Could not auto-mark incident as resolved: {ex}")

        return response
    except HindsightConfigurationError as e:
        logger.error(f"Hindsight configuration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Memory service unavailable: {e}. The incident has NOT been marked as learned.",
        )
    except HindsightServiceError as e:
        logger.error(f"Hindsight service error during retain: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Hindsight service failure: {e}. The incident has NOT been marked as learned.",
        )


@router.post(
    "/recall",
    response_model=MemoryRecallResponse,
    summary="Recall historical engineering experience from Hindsight",
)
def recall_memory(
    request: MemoryRecallRequest,
    memory_service: HindsightMemory = Depends(get_hindsight_memory),
) -> MemoryRecallResponse:
    """Query Hindsight persistent memory for past incidents and decisions."""
    try:
        return recall_engineering_memories(
            query=request.query,
            hindsight_memory=memory_service,
            bank_id=request.bank_id,
            max_tokens=request.max_tokens,
        )
    except HindsightConfigurationError as e:
        logger.error(f"Hindsight configuration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e),
        )
    except HindsightServiceError as e:
        logger.error(f"Hindsight service error during recall: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Hindsight service failure: {e}",
        )
