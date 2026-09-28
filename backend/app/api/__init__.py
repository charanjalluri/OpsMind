"""OpsMind API Routers Package."""
from backend.app.api.health import router as health_router
from backend.app.api.memory import router as memory_router
from backend.app.api.investigations import router as investigations_router

__all__ = [
    "health_router",
    "memory_router",
    "investigations_router",
]
