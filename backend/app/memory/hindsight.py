import logging
from typing import Optional, List, Dict, Any
from hindsight_client import Hindsight, RecallResponse, RetainResponse
from backend.app.config import Settings, get_settings

logger = logging.getLogger(__name__)


class HindsightConfigurationError(Exception):
    """Raised when Hindsight credentials or configuration is missing."""
    pass


class HindsightServiceError(Exception):
    """Raised when an operation with the Hindsight service fails."""
    pass


class HindsightMemory:
    """Service abstraction around the official Hindsight SDK."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        bank_id: Optional[str] = None,
        settings: Optional[Settings] = None,
    ):
        self._settings = settings or get_settings()
        self.api_key = api_key if api_key is not None else self._settings.hindsight_api_key
        self.base_url = (base_url or self._settings.hindsight_api_url).rstrip("/")
        self.default_bank_id = bank_id or self._settings.hindsight_bank_id
        self._client: Optional[Hindsight] = None

    @property
    def is_configured(self) -> bool:
        """Check whether valid Hindsight credentials are configured."""
        return bool(self.api_key and self.api_key.strip())

    def _get_client(self) -> Hindsight:
        """Initialize or return the cached official Hindsight client."""
        if not self.is_configured:
            raise HindsightConfigurationError(
                "HINDSIGHT_API_KEY is not configured. "
                "Please configure HINDSIGHT_API_KEY in your .env file or environment variables."
            )

        if self._client is None:
            try:
                self._client = Hindsight(
                    base_url=self.base_url,
                    api_key=self.api_key,
                )
            except Exception as e:
                logger.error(f"Failed to initialize Hindsight client: {e}")
                raise HindsightServiceError(f"Failed to initialize Hindsight client: {e}") from e

        return self._client

    def retain(
        self,
        content: str | List[Dict[str, Any]],
        bank_id: Optional[str] = None,
        document_id: Optional[str] = None,
        context: Optional[str] = None,
        metadata: Optional[Dict[str, str]] = None,
        tags: Optional[List[str]] = None,
    ) -> RetainResponse:
        """
        Retain new engineering experience into Hindsight.

        Args:
            content: Natural language text or structured message list representing engineering experience.
            bank_id: Target memory bank ID (defaults to configured HINDSIGHT_BANK_ID).
            document_id: Optional unique identifier for the document/incident.
            context: Contextual notes surrounding the memory.
            metadata: Key-value string pairs metadata.
            tags: Category tags for retrieval and filtering.

        Returns:
            RetainResponse from official Hindsight client.
        """
        target_bank = bank_id or self.default_bank_id
        client = self._get_client()

        try:
            logger.info(f"Retaining experience to Hindsight bank '{target_bank}' (doc_id={document_id})")
            response = client.retain(
                bank_id=target_bank,
                content=content,
                document_id=document_id,
                context=context,
                metadata=metadata,
                tags=tags,
            )
            return response
        except Exception as e:
            logger.error(f"Hindsight retain failed: {e}")
            raise HindsightServiceError(f"Hindsight retain failed: {e}") from e

    def recall(
        self,
        query: str,
        bank_id: Optional[str] = None,
        max_tokens: int = 4096,
        tags: Optional[List[str]] = None,
    ) -> RecallResponse:
        """
        Recall relevant historical engineering memories from Hindsight.

        Args:
            query: Natural language incident query.
            bank_id: Target memory bank ID (defaults to configured HINDSIGHT_BANK_ID).
            max_tokens: Maximum tokens budget for recalled facts.
            tags: Optional tags to filter memory retrieval.

        Returns:
            RecallResponse containing matched memory results, entities, and facts.
        """
        target_bank = bank_id or self.default_bank_id
        client = self._get_client()

        try:
            logger.info(f"Recalling memories from Hindsight bank '{target_bank}' for query: '{query[:80]}...'")
            response = client.recall(
                bank_id=target_bank,
                query=query,
                max_tokens=max_tokens,
                tags=tags,
            )
            return response
        except Exception as e:
            logger.error(f"Hindsight recall failed: {e}")
            raise HindsightServiceError(f"Hindsight recall failed: {e}") from e
