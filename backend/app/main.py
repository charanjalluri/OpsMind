import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import get_settings
from backend.app.api.health import router as health_router
from backend.app.api.memory import router as memory_router
from backend.app.api.investigations import router as investigations_router
from backend.app.api.incidents import router as incidents_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("opsmind")

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle management."""
    logger.info("Starting OpsMind backend engine...")
    logger.info(f"Environment: {settings.environment}")
    logger.info(f"Hindsight Bank ID: {settings.hindsight_bank_id}")
    logger.info(f"Hindsight configured: {settings.is_hindsight_configured}")
    logger.info(f"Meta Model Name: {settings.meta_model_name}")
    logger.info(f"Meta Model configured: {settings.is_meta_configured}")
    yield
    logger.info("Shutting down OpsMind backend engine...")


app = FastAPI(
    title="OpsMind API",
    description=(
        "OpsMind — an AI incident-response agent with persistent Hindsight engineering memory "
        "and Meta Muse Spark 1.3 reasoning."
    ),
    version="0.1.0",
    lifespan=lifespan,
)

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(health_router)
app.include_router(memory_router)
app.include_router(investigations_router)
app.include_router(incidents_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
