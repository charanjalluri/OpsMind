from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(tags=["Health"])


class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "opsmind"


@router.get("/health", response_model=HealthResponse)
def get_health() -> HealthResponse:
    """Return OpsMind service health status."""
    return HealthResponse(status="ok", service="opsmind")
