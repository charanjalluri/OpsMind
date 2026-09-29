import json
from functools import lru_cache
from typing import Optional, Any
from pydantic import field_validator, AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


def unwrap_api_key(raw_key: Any) -> Optional[str]:
    """
    Safely extract a plain, stripped Python string API key from any input type.
    Ensures the OpenAI-compatible client strictly receives a pure `str`.

    Handles:
    - plain str
    - SecretStr (calls .get_secret_value())
    - dict or Mapping (extracts 'api_key', 'key', 'token', or 'MODEL_API_KEY')
    - JSON string representing a dict
    - Pydantic models / settings objects
    Returns a plain Python str or None.
    """
    if raw_key is None:
        return None

    # Handle SecretStr or objects with get_secret_value
    if hasattr(raw_key, "get_secret_value") and callable(raw_key.get_secret_value):
        raw_key = raw_key.get_secret_value()

    # Handle Pydantic models or objects with meta_model_api_key attribute
    if hasattr(raw_key, "meta_model_api_key"):
        raw_key = getattr(raw_key, "meta_model_api_key")
        if hasattr(raw_key, "get_secret_value") and callable(raw_key.get_secret_value):
            raw_key = raw_key.get_secret_value()

    # Handle dict / mapping
    if isinstance(raw_key, dict):
        for candidate in (
            "api_key",
            "meta_model_api_key",
            "MODEL_API_KEY",
            "META_MODEL_API_KEY",
            "key",
            "token",
            "value",
        ):
            if candidate in raw_key:
                val = raw_key[candidate]
                if hasattr(val, "get_secret_value") and callable(val.get_secret_value):
                    val = val.get_secret_value()
                if isinstance(val, str):
                    raw_key = val
                    break

    # If it's a string, strip quotes and check for JSON serialization
    if isinstance(raw_key, str):
        cleaned = raw_key.strip()
        if (cleaned.startswith('"') and cleaned.endswith('"')) or (
            cleaned.startswith("'") and cleaned.endswith("'")
        ):
            cleaned = cleaned[1:-1].strip()

        if cleaned.startswith("{") and cleaned.endswith("}"):
            try:
                parsed = json.loads(cleaned)
                if isinstance(parsed, dict):
                    return unwrap_api_key(parsed)
            except Exception:
                pass

        return str(cleaned) if cleaned else None

    # Fallback string conversion
    try:
        s = str(raw_key).strip()
        return s if s else None
    except Exception:
        return None


class Settings(BaseSettings):
    """OpsMind Configuration Settings loaded from environment or .env file."""

    model_config = SettingsConfigDict(
        env_file=(".env", "backend/.env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Hindsight Memory Configuration
    hindsight_api_key: Optional[str] = None
    hindsight_api_url: str = "https://api.hindsight.vectorize.io"
    hindsight_bank_id: str = "opsmind-engineering"

    # Meta Model (Muse Spark 1.3) Configuration
    meta_model_api_key: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices(
            "META_MODEL_API_KEY", "MODEL_API_KEY", "meta_model_api_key"
        ),
    )
    meta_model_name: str = "muse-spark-1.3"
    meta_model_base_url: str = "https://api.meta.ai/v1"

    # Application Environment
    environment: str = "development"

    @field_validator("meta_model_api_key", mode="before")
    @classmethod
    def validate_meta_key(cls, v: Any) -> Optional[str]:
        return unwrap_api_key(v)

    @field_validator("hindsight_api_key", mode="before")
    @classmethod
    def validate_hindsight_key(cls, v: Any) -> Optional[str]:
        return unwrap_api_key(v)

    @field_validator("meta_model_name", mode="before")
    @classmethod
    def validate_meta_model_name(cls, v: Optional[str]) -> str:
        if v is not None and isinstance(v, str) and v.strip():
            cleaned = v.strip()
            if "Contributor" in cleaned or not cleaned:
                return "muse-spark-1.3"
            return cleaned
        return "muse-spark-1.3"

    @field_validator("hindsight_api_url", mode="before")
    @classmethod
    def validate_hindsight_url(cls, v: Optional[str]) -> str:
        if v is not None and isinstance(v, str) and v.strip():
            return v.strip().rstrip("/")
        return "https://api.hindsight.vectorize.io"

    @field_validator("meta_model_base_url", mode="before")
    @classmethod
    def validate_meta_url(cls, v: Optional[str]) -> str:
        if v is not None and isinstance(v, str) and v.strip():
            return v.strip().rstrip("/")
        return "https://api.meta.ai/v1"

    @property
    def is_hindsight_configured(self) -> bool:
        """Check if Hindsight has credentials configured."""
        return bool(self.hindsight_api_key and self.hindsight_api_key.strip())

    @property
    def is_meta_configured(self) -> bool:
        """Check if Meta Model API has credentials configured."""
        return bool(self.meta_model_api_key and self.meta_model_api_key.strip())


@lru_cache()
def get_settings() -> Settings:
    """Return cached instance of application settings."""
    return Settings()
