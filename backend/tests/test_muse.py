import os
from unittest.mock import patch, MagicMock
import pytest
from pydantic import SecretStr

from backend.app.config import Settings, get_settings, unwrap_api_key
from backend.app.llm.muse import (
    MuseClient,
    MetaModelConfigurationError,
)


def test_unwrap_api_key_plain_string():
    """Verify plain string is trimmed and preserved."""
    assert unwrap_api_key("  LLM_plain_12345  ") == "LLM_plain_12345"


def test_unwrap_api_key_secret_str():
    """Verify Pydantic SecretStr is unwrapped to plain Python str via get_secret_value."""
    secret = SecretStr("LLM_secret_value_12345")
    unwrapped = unwrap_api_key(secret)
    assert unwrapped == "LLM_secret_value_12345"
    assert isinstance(unwrapped, str)


def test_unwrap_api_key_dict():
    """Verify dictionary configurations are unwrapped to plain string."""
    d = {"api_key": "LLM_dict_key_12345"}
    unwrapped = unwrap_api_key(d)
    assert unwrapped == "LLM_dict_key_12345"
    assert isinstance(unwrapped, str)


def test_unwrap_api_key_json_string():
    """Verify serialized JSON dictionary string is parsed and unwrapped to plain string."""
    json_str = '{"api_key": "LLM_json_key_12345"}'
    unwrapped = unwrap_api_key(json_str)
    assert unwrapped == "LLM_json_key_12345"
    assert isinstance(unwrapped, str)


def test_unwrap_api_key_quoted_string():
    """Verify quoted strings are stripped cleanly."""
    assert unwrap_api_key('"LLM_quoted_key"') == "LLM_quoted_key"
    assert unwrap_api_key("'LLM_single_quoted'") == "LLM_single_quoted"


def test_muse_client_initialization_guarantees_string():
    """Verify MuseClient.api_key is always a pure string when initialized."""
    client_from_str = MuseClient(api_key="LLM_mock_123")
    assert isinstance(client_from_str.api_key, str)
    assert client_from_str.api_key == "LLM_mock_123"

    client_from_secret = MuseClient(api_key=SecretStr("LLM_secret_456"))
    assert isinstance(client_from_secret.api_key, str)
    assert client_from_secret.api_key == "LLM_secret_456"

    client_from_dict = MuseClient(api_key={"MODEL_API_KEY": "LLM_dict_789"})
    assert isinstance(client_from_dict.api_key, str)
    assert client_from_dict.api_key == "LLM_dict_789"


def test_muse_client_safe_diagnostics_never_exposes_key():
    """Verify get_safe_diagnostics reports metadata without leaking the key."""
    client = MuseClient(api_key="LLM_confidential_key_123456789")
    diag = client.get_safe_diagnostics()

    assert diag["is_configured"] is True
    assert diag["key_present"] is True
    assert diag["key_type"] == "str"
    assert diag["key_length"] == len("LLM_confidential_key_123456789")
    assert diag["starts_with_expected_prefix"] is True
    assert diag["base_url"] == "https://api.meta.ai/v1"
    assert diag["model_name"] == "muse-spark-1.3"

    # Crucial safety check: ensure actual key string does NOT appear anywhere in the diagnostics output
    diag_str = str(diag)
    assert "LLM_confidential_key_123456789" not in diag_str


def test_openai_client_called_with_plain_string_and_base_url():
    """Verify the OpenAI client constructor receives pure str and expected base_url."""
    with patch("backend.app.llm.muse.OpenAI") as mock_openai_cls:
        client = MuseClient(api_key="LLM_mock_key_for_test")
        client._get_client()

        mock_openai_cls.assert_called_once()
        call_kwargs = mock_openai_cls.call_args.kwargs
        assert isinstance(call_kwargs["api_key"], str)
        assert call_kwargs["api_key"] == "LLM_mock_key_for_test"
        assert call_kwargs["base_url"] == "https://api.meta.ai/v1"


def test_muse_client_unconfigured_raises_error():
    """Verify MetaModelConfigurationError is raised when unconfigured."""
    client = MuseClient(api_key=None, settings=Settings(meta_model_api_key=None))
    assert client.is_configured is False
    with pytest.raises(MetaModelConfigurationError):
        client._get_client()


@pytest.mark.integration
def test_meta_muse_spark_live_minimal_completion():
    """
    Live integration test for Meta Muse Spark 1.3 minimal request.
    Verifies:
      model: muse-spark-1.3
      messages: [{"role": "user", "content": "Reply with exactly: OPSMIND READY"}]
    The test NEVER prints or leaks the API key.
    """
    settings = get_settings()
    key = settings.meta_model_api_key or os.environ.get("META_MODEL_API_KEY") or os.environ.get("MODEL_API_KEY")

    if not key or not str(key).strip():
        pytest.skip("META_MODEL_API_KEY / MODEL_API_KEY not configured. Skipping live Meta API integration test.")

    client = MuseClient(
        api_key=key,
        model_name="muse-spark-1.3",
        base_url="https://api.meta.ai/v1",
    )

    diagnostics = client.get_safe_diagnostics()
    assert diagnostics["is_configured"] is True
    assert diagnostics["key_type"] == "str"
    assert diagnostics["model_name"] == "muse-spark-1.3"

    messages = [
        {
            "role": "user",
            "content": "Reply with exactly: OPSMIND READY",
        }
    ]

    response = client.generate(messages=messages, json_mode=False)
    assert response is not None
    assert "OPSMIND READY" in response.strip().upper()
