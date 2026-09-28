from unittest.mock import MagicMock, patch
import pytest
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.config import Settings
from backend.app.memory.memory_types import EngineeringMemory
from backend.app.memory.hindsight import (
    HindsightMemory,
    HindsightConfigurationError,
)
from backend.app.memory.retain import retain_engineering_memory
from backend.app.memory.recall import construct_incident_query, recall_engineering_memories
from backend.app.schemas.incident import MemoryRetainRequest, MemoryRecallRequest


def test_engineering_memory_to_document():
    """Verify EngineeringMemory serializes to rich experience text."""
    mem = EngineeringMemory(
        incident_id="INC-1042",
        memory_type="incident",
        title="Database connection pool regression",
        service="payment-api",
        environment="production",
        deployment_version="v2.9.0",
        symptoms=["HTTP 502 responses increased immediately after deployment v2.9.0"],
        suspected_cause="Database bottleneck",
        confirmed_root_cause="Connection pool configuration regression (pool_max=5)",
        investigation_steps=["Compared pool config between v2.8.4 and v2.9.0"],
        actions_taken=["Rolled back to v2.8.4 and restored pool_max=50"],
        resolution="Rolled back v2.9.0 and restored pool configuration",
        outcome="Successful",
        warnings=["Do not attempt pod restarts before checking connection pools"],
        lessons_learned=["For payment-api 502 errors, compare database connection pool config"],
    )

    doc = mem.to_experience_document()
    assert "INC-1042" in doc
    assert "payment-api" in doc
    assert "v2.9.0" in doc
    assert "Confirmed Root Cause" in doc
    assert "Warnings & Pitfalls" in doc
    assert "Do not attempt pod restarts" in doc

    metadata = mem.extract_metadata()
    assert metadata["service"] == "payment-api"
    assert metadata["incident_id"] == "INC-1042"
    assert metadata["environment"] == "production"

    tags = mem.extract_tags()
    assert "payment-api" in tags
    assert "inc-1042" in tags
    assert "incident" in tags


def test_decision_memory_to_document():
    """Verify decision type memory serializes appropriately."""
    mem = EngineeringMemory(
        incident_id="DECISION-PAYMENT-RESTART",
        memory_type="decision",
        title="payment-api restart policy",
        service="payment-api",
        environment="production",
        engineering_decisions=["Do not automatically restart payment-api during production incidents."],
        warnings=["AUTOMATIC RESTART PROHIBITED: Can cause duplicate charges."],
        resolution="Prohibit reflexive restarts without queue drain validation.",
        outcome="Zero duplicate charge incidents.",
    )

    doc = mem.to_experience_document()
    assert "ENGINEERING DECISION RECORD" in doc
    assert "Do not automatically restart payment-api" in doc
    assert "Warnings & Operational Risks" in doc


def test_hindsight_unconfigured_error():
    """Verify that accessing unconfigured HindsightMemory raises HindsightConfigurationError."""
    empty_settings = Settings(hindsight_api_key=None)
    hindsight = HindsightMemory(settings=empty_settings)

    assert hindsight.is_configured is False
    with pytest.raises(HindsightConfigurationError) as exc_info:
        hindsight.retain(content="Test content")
    assert "HINDSIGHT_API_KEY is not configured" in str(exc_info.value)

    with pytest.raises(HindsightConfigurationError) as exc_info:
        hindsight.recall(query="Test query")
    assert "HINDSIGHT_API_KEY is not configured" in str(exc_info.value)


def test_construct_incident_query():
    """Verify query construction from incident telemetry."""
    q = construct_incident_query(
        service="payment-api",
        symptoms=["HTTP 502 spike", "gateway timeout"],
        deployment_version="v2.9.1",
        environment="production",
    )
    assert "Service: payment-api" in q
    assert "Symptoms: HTTP 502 spike; gateway timeout" in q
    assert "Deployment: v2.9.1" in q


def test_retain_and_recall_with_mock():
    """Verify retain and recall functions with mocked Hindsight client."""
    mock_hindsight = MagicMock(spec=HindsightMemory)
    mock_hindsight.default_bank_id = "opsmind-engineering"
    mock_hindsight.is_configured = True

    mock_retain_resp = MagicMock()
    mock_retain_resp.success = True
    mock_retain_resp.items_count = 1
    mock_hindsight.retain.return_value = mock_retain_resp

    mem = EngineeringMemory(
        incident_id="INC-TEST",
        service="orders-api",
        resolution="Fixed config",
        outcome="Successful",
    )

    resp = retain_engineering_memory(mem, mock_hindsight)
    assert resp.success is True
    assert resp.incident_id == "INC-TEST"
    assert resp.bank_id == "opsmind-engineering"
    mock_hindsight.retain.assert_called_once()

    # Mock recall
    mock_recall_result = MagicMock()
    mock_recall_result.id = "INC-1042"
    mock_recall_result.text = "Database connection pool regression"
    mock_recall_result.type = "incident"
    mock_recall_result.context = "production"
    mock_recall_result.tags = ["payment-api"]
    mock_recall_result.metadata = {"service": "payment-api"}

    mock_recall_resp = MagicMock()
    mock_recall_resp.results = [mock_recall_result]
    mock_recall_resp.to_prompt_string.return_value = "FACTS: INC-1042 connection pool regression"
    mock_hindsight.recall.return_value = mock_recall_resp

    recall_out = recall_engineering_memories("payment 502", mock_hindsight)
    assert recall_out.count == 1
    assert recall_out.results[0].id == "INC-1042"
    assert "INC-1042" in recall_out.prompt_representation


def test_memory_api_unconfigured_error():
    """Verify memory endpoints return HTTP 503 when unconfigured."""
    from backend.app.config import get_settings
    app.dependency_overrides[get_settings] = lambda: Settings(hindsight_api_key=None)
    try:
        client = TestClient(app)
        recall_resp = client.post("/api/memory/recall", json={"query": "payment 502"})
        assert recall_resp.status_code == 503
        assert "HINDSIGHT_API_KEY is not configured" in recall_resp.json()["detail"]
    finally:
        app.dependency_overrides.pop(get_settings, None)


@pytest.mark.integration
def test_real_hindsight_integration():
    """Live integration test against Hindsight API (skipped if no credentials)."""
    settings = Settings()
    if not settings.is_hindsight_configured:
        pytest.skip("Skipping live Hindsight integration test: HINDSIGHT_API_KEY not configured")

    hindsight = HindsightMemory(settings=settings)
    # Perform test recall
    response = hindsight.recall(
        query="payment 502 errors after deployment",
        bank_id=settings.hindsight_bank_id,
    )
    assert response is not None
