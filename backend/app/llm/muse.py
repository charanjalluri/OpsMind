import json
import logging
import re
from typing import Optional, Dict, Any, List, Union
from openai import OpenAI
from backend.app.config import Settings, get_settings, unwrap_api_key

logger = logging.getLogger(__name__)


class MetaModelConfigurationError(Exception):
    """Raised when Meta Model API credentials or configuration are missing."""
    pass


class MetaModelServiceError(Exception):
    """Raised when an error occurs during Meta Model API invocation."""
    pass


class MuseClient:
    """Client for Meta Muse Spark 1.3 via the OpenAI-compatible Meta Model API."""

    def __init__(
        self,
        api_key: Optional[Union[str, Any]] = None,
        model_name: Optional[str] = None,
        base_url: Optional[str] = None,
        settings: Optional[Settings] = None,
    ):
        self._settings = settings or get_settings()
        raw_key = api_key if api_key is not None else self._settings.meta_model_api_key
        self.api_key: Optional[str] = unwrap_api_key(raw_key)

        chosen_model = (model_name or self._settings.meta_model_name or "muse-spark-1.3").strip()
        if "Contributor" in chosen_model or not chosen_model:
            chosen_model = "muse-spark-1.3"
        self.model_name = chosen_model

        self.base_url = (base_url or self._settings.meta_model_base_url or "https://api.meta.ai/v1").rstrip("/")
        self._client: Optional[OpenAI] = None

    @property
    def is_configured(self) -> bool:
        """Check if valid credentials exist for Meta Model API."""
        return bool(self.api_key and isinstance(self.api_key, str) and self.api_key.strip())

    def get_safe_diagnostics(self) -> Dict[str, Any]:
        """
        Return safe diagnostic metadata without ever exposing secret keys.
        Used to verify configuration integrity in logs and tests.
        """
        return {
            "is_configured": self.is_configured,
            "key_present": bool(self.api_key),
            "key_type": type(self.api_key).__name__ if self.api_key else "NoneType",
            "key_length": len(self.api_key) if self.api_key else 0,
            "starts_with_expected_prefix": bool(self.api_key and self.api_key.startswith("LLM_")),
            "base_url": self.base_url,
            "model_name": self.model_name,
        }

    def _get_client(self) -> OpenAI:
        """Get or initialize OpenAI client targeting Meta Model API endpoint."""
        if not self.is_configured:
            raise MetaModelConfigurationError(
                "META_MODEL_API_KEY is not configured. "
                "Please configure META_MODEL_API_KEY in your .env file or environment variables."
            )

        if not isinstance(self.api_key, str):
            raise MetaModelConfigurationError(
                f"API key must be a plain string, received {type(self.api_key).__name__}"
            )

        if self._client is None:
            self._client = OpenAI(
                api_key=self.api_key,
                base_url=self.base_url,
            )
        return self._client

    def generate(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.2,
        max_tokens: int = 8192,
        json_mode: bool = True,
    ) -> str:
        """
        Execute completion with Meta Muse Spark 1.3 model.

        Args:
            messages: List of chat messages (system, user, assistant).
            temperature: Sampling temperature (default 0.2 for analytical precision).
            max_tokens: Maximum token limit for output.
            json_mode: Whether to enforce json_object format.

        Returns:
            Model response content string.
        """
        client = self._get_client()

        sanitized_messages: List[Dict[str, str]] = []
        for msg in messages:
            if isinstance(msg, dict):
                sanitized_messages.append({str(k): str(v) for k, v in msg.items()})
            else:
                sanitized_messages.append(msg)

        kwargs: Dict[str, Any] = {
            "model": self.model_name,
            "messages": sanitized_messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }

        if json_mode:
            kwargs["response_format"] = {"type": "json_object"}

        try:
            logger.info(f"Invoking Meta model '{self.model_name}' at {self.base_url}")
            completion = client.chat.completions.create(**kwargs)
            choice = completion.choices[0]
            content = choice.message.content or ""
            return content
        except Exception as e:
            logger.error(f"Meta Model API request failed: {e}")
            raise MetaModelServiceError(f"Meta Model API request failed: {e}") from e

    def generate_json(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.2,
        max_tokens: int = 8192,
    ) -> Dict[str, Any]:
        """Generate and parse structured JSON dictionary from Meta Muse Spark 1.3."""
        raw_text = self.generate(
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            json_mode=True,
        )

        try:
            return json.loads(raw_text)
        except json.JSONDecodeError:
            # Fallback cleanup for code block wrappers like ```json ... ```
            match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", raw_text, re.DOTALL)
            if match:
                return json.loads(match.group(1))
            raise MetaModelServiceError(
                f"Failed to parse JSON response from Meta Muse Spark: {raw_text[:200]}"
            )
