import logging
from fastapi import APIRouter, Depends, HTTPException, status
from backend.app.config import Settings, get_settings
from backend.app.memory.hindsight import HindsightMemory
from backend.app.llm.muse import (
    MuseClient,
    MetaModelConfigurationError,
    MetaModelServiceError,
)
from backend.app.agent.investigator import OpsMindInvestigator
from backend.app.schemas.incident import (
    IncidentInvestigationRequest,
    InvestigationResult,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/investigations", tags=["Investigations"])


def get_investigator(settings: Settings = Depends(get_settings)) -> OpsMindInvestigator:
    """Dependency provider for OpsMindInvestigator."""
    hindsight_memory = HindsightMemory(settings=settings)
    muse_client = MuseClient(settings=settings)
    return OpsMindInvestigator(
        hindsight_memory=hindsight_memory,
        muse_client=muse_client,
        settings=settings,
    )


@router.post(
    "",
    response_model=InvestigationResult,
    summary="Investigate production incident grounded in persistent Hindsight memory",
)
def investigate_incident(
    request: IncidentInvestigationRequest,
    investigator: OpsMindInvestigator = Depends(get_investigator),
) -> InvestigationResult:
    """
    Execute full incident investigation flow:
    Incident -> Recall Hindsight Memory -> Evidence -> Muse Spark 1.3 Reasoning -> Structured Result.
    """
    try:
        return investigator.investigate(request)
    except MetaModelConfigurationError as e:
        logger.error(f"Meta Model configuration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e),
        )
    except MetaModelServiceError as e:
        logger.error(f"Meta Model service error: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Meta Muse Spark service failure: {e}",
        )
    except Exception as e:
        logger.error(f"Unexpected investigation error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Investigation execution failed: {e}",
        )
