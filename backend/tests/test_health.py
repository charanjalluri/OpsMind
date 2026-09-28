from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.config import Settings, get_settings


def test_health_endpoint():
    """Test that GET /health returns status ok and service opsmind."""
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "opsmind"


def test_configuration_loading():
    """Test configuration loading and default properties."""
    settings = Settings(
        hindsight_api_key=None,
        meta_model_api_key=None,
        hindsight_bank_id="test-bank",
        meta_model_name="muse-spark-1.3",
        environment="test",
    )

    assert settings.environment == "test"
    assert settings.hindsight_bank_id == "test-bank"
    assert settings.meta_model_name == "muse-spark-1.3"
    assert settings.is_hindsight_configured is False
    assert settings.is_meta_configured is False


def test_configuration_with_keys():
    """Test configuration property when keys are provided."""
    settings = Settings(
        hindsight_api_key="hs_test_key_123",
        meta_model_api_key="meta_test_key_456",
        hindsight_bank_id="opsmind-engineering",
    )

    assert settings.is_hindsight_configured is True
    assert settings.is_meta_configured is True
    assert settings.hindsight_api_key == "hs_test_key_123"
    assert settings.meta_model_api_key == "meta_test_key_456"
