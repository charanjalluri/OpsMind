from unittest.mock import MagicMock, patch
import json
import pytest
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.config import Settings, get_settings
from backend.app.schemas.incident import (
    IncidentInvestigationRequest,
    InvestigationResult,
    HistoricalEvidenceItem,
)
from backend.app.llm.muse import (
    MuseClient,
    MetaModelConfigurationError,
    MetaModelServiceError,
)
from backend.app.agent.investigator import OpsMindInvestigator
from backend.app.agent.prompts import build_investigation_user_prompt
from backend.app.memory.hindsight import HindsightMemory


def test_incident_investigation_request_schema():
    """Verify incident investigation request model validation."""
    req = IncidentInvestigationRequest(
        incident_id="INC-DEMO-001",
        service="payment-api",
        environment="production",
        symptoms=["HTTP 502 errors increased", "started immediately after deployment"],
        deployment_version="v2.9.1",
    )
    assert req.incident_id == "INC-DEMO-001"
    assert req.service == "payment-api"
    assert len(req.symptoms) == 2
    assert req.deployment_version == "v2.9.1"


def test_investigation_result_schema():
    """Verify investigation result structured schema validation."""
    evidence = HistoricalEvidenceItem(
        incident_id="INC-1042",
        service="payment-api",
        summary="Database connection pool regression in v2.9.0",
        relevance_to_current="Same service experiencing 502s immediately after deployment",
        past_root_cause="pool_max reduced from 50 to 5",
        effective_actions=["Rolled back to v2.8.4 and restored pool_max=50"],
        dangerous_actions=["Blind pod restart without checking pool"],
        lessons_learned=["Check connection pool before restarting infrastructure"],
    )

    res = InvestigationResult(
        incident_id="INC-DEMO-001",
        service="payment-api",
        incident_summary="Payment-api suffering 502 spike following v2.9.1 deployment",
        historical_evidence=[evidence],
        possible_root_causes=["Database connection pool regression", "Environment misconfiguration"],
        recommended_steps=["Compare pool config with v2.9.0", "Check DB active connections"],
        warnings=["Do NOT blindly restart payment-api (risks duplicate payments per INC-1091)"],
        confidence="High - Directly Supported by Historical Precedents",
        memory_used=True,
        memory_bank_id="opsmind-engineering",
        raw_evidence_count=3,
    )

    assert res.memory_used is True
    assert len(res.historical_evidence) == 1
    assert res.historical_evidence[0].incident_id == "INC-1042"
    assert len(res.warnings) == 1


def test_muse_unconfigured_error():
    """Verify MuseClient raises MetaModelConfigurationError if API key missing."""
    empty_settings = Settings(meta_model_api_key=None)
    client = MuseClient(settings=empty_settings)
    assert client.is_configured is False

    with pytest.raises(MetaModelConfigurationError) as exc_info:
        client.generate([{"role": "user", "content": "hello"}])
    assert "META_MODEL_API_KEY is not configured" in str(exc_info.value)


def test_muse_json_parsing_clean():
    """Test MuseClient JSON parsing with clean JSON string."""
    client = MuseClient(api_key="mock-key")
    expected_data = {"incident_summary": "Test summary", "possible_root_causes": ["Config issue"]}

    with patch.object(client, "generate", return_value=json.dumps(expected_data)):
        data = client.generate_json([{"role": "user", "content": "test"}])
        assert data == expected_data


def test_muse_json_parsing_markdown_wrapped():
    """Test MuseClient JSON parsing when model wraps in markdown fences."""
    client = MuseClient(api_key="mock-key")
    expected_data = {"incident_summary": "Markdown wrapped", "possible_root_causes": ["Regression"]}
    wrapped_text = f"```json\n{json.dumps(expected_data)}\n```"

    with patch.object(client, "generate", return_value=wrapped_text):
        data = client.generate_json([{"role": "user", "content": "test"}])
        assert data == expected_data


def test_investigation_pipeline_with_historical_memory():
    """Test full investigator flow when historical memory is retrieved."""
    mock_hindsight = MagicMock(spec=HindsightMemory)
    mock_hindsight.is_configured = True
    mock_hindsight.default_bank_id = "opsmind-engineering"

    mock_fact = MagicMock()
    mock_fact.id = "INC-1042"
    mock_fact.text = "INC-1042: Database connection pool regression causing 502s"
    mock_recall_resp = MagicMock()
    mock_recall_resp.results = [mock_fact]
    mock_recall_resp.to_prompt_string.return_value = "FACTS: INC-1042 connection pool exhaustion"
    mock_hindsight.recall.return_value = mock_recall_resp

    mock_muse = MagicMock(spec=MuseClient)
    mock_muse.is_configured = True
    mock_muse.generate_json.return_value = {
        "incident_id": "INC-TEST-001",
        "service": "payment-api",
        "incident_summary": "payment-api 502 errors after deployment",
        "historical_evidence": [
            {
                "incident_id": "INC-1042",
                "service": "payment-api",
                "summary": "Connection pool regression in v2.9.0",
                "relevance_to_current": "Identical symptoms and deployment timing",
                "past_root_cause": "pool_max was decreased from 50 to 5",
                "effective_actions": ["Rollback deployment to previous release"],
                "dangerous_actions": ["Restarting pods while connection pool is exhausted"],
                "lessons_learned": ["Check connection pool before restarting"],
            }
        ],
        "possible_root_causes": ["Database connection pool exhaustion"],
        "recommended_steps": ["Inspect connection pool metrics", "Rollback to v2.9.0 if confirmed"],
        "warnings": ["Do not restart payment-api without queue drain"],
        "confidence": "High - Directly Supported by Historical Precedents",
        "memory_used": True,
    }

    investigator = OpsMindInvestigator(
        hindsight_memory=mock_hindsight,
        muse_client=mock_muse,
    )

    request = IncidentInvestigationRequest(
        incident_id="INC-TEST-001",
        service="payment-api",
        symptoms=["HTTP 502 errors immediately after deployment"],
        deployment_version="v2.9.1",
    )

    result = investigator.investigate(request)

    assert result.incident_id == "INC-TEST-001"
    assert result.service == "payment-api"
    assert result.memory_used is True
    assert len(result.historical_evidence) == 1
    assert result.historical_evidence[0].incident_id == "INC-1042"
    assert result.raw_evidence_count == 1
    mock_hindsight.recall.assert_called_once()
    mock_muse.generate_json.assert_called_once()


def test_investigation_pipeline_without_historical_memory():
    """Test investigator flow when no historical memories exist in Hindsight."""
    mock_hindsight = MagicMock(spec=HindsightMemory)
    mock_hindsight.is_configured = True
    mock_hindsight.default_bank_id = "opsmind-empty"

    mock_recall_resp = MagicMock()
    mock_recall_resp.results = []
    mock_recall_resp.to_prompt_string.return_value = ""
    mock_hindsight.recall.return_value = mock_recall_resp

    mock_muse = MagicMock(spec=MuseClient)
    mock_muse.is_configured = True
    mock_muse.generate_json.return_value = {
        "incident_id": "INC-NEW-001",
        "service": "analytics-worker",
        "incident_summary": "Unprecedented failure in analytics-worker",
        "historical_evidence": [],
        "possible_root_causes": ["Unknown resource leak", "Network partition"],
        "recommended_steps": ["Inspect stdout logs", "Check CPU/Memory metrics"],
        "warnings": ["No historical precedent found in memory"],
        "confidence": "Low - Insufficient Historical Evidence",
        "memory_used": False,
    }

    investigator = OpsMindInvestigator(
        hindsight_memory=mock_hindsight,
        muse_client=mock_muse,
    )

    request = IncidentInvestigationRequest(
        incident_id="INC-NEW-001",
        service="analytics-worker",
        symptoms=["Worker memory spiked to 100%"],
    )

    result = investigator.investigate(request)

    assert result.memory_used is False
    assert result.confidence == "Low - Insufficient Historical Evidence"
    assert len(result.historical_evidence) == 0
    assert result.raw_evidence_count == 0


def test_api_investigations_unconfigured_error():
    """Test that POST /api/investigations returns 503 when Meta Model API is not configured."""
    app.dependency_overrides[get_settings] = lambda: Settings(
        meta_model_api_key="",
        hindsight_api_key="mock-hs",
    )
    try:
        client = TestClient(app)
        payload = {
            "incident_id": "INC-TEST",
            "service": "payment-api",
            "symptoms": ["502 errors"],
        }
        resp = client.post("/api/investigations", json=payload)
        assert resp.status_code == 503
        assert "META_MODEL_API_KEY is not configured" in resp.json()["detail"]
    finally:
        app.dependency_overrides.pop(get_settings, None)


@pytest.mark.integration
def test_real_investigation_integration():
    """Live end-to-end integration test against Meta Muse Spark (skipped if real credentials missing)."""
    settings = Settings()
    if not settings.is_meta_configured:
        pytest.skip("Skipping live Meta Model integration test: META_MODEL_API_KEY not configured")

    try:
        investigator = OpsMindInvestigator(settings=settings)
        req = IncidentInvestigationRequest(
            incident_id="INC-INTEGRATION-TEST",
            service="payment-api",
            symptoms=["HTTP 502 errors after deployment"],
        )
        result = investigator.investigate(req)
        assert result.incident_id == "INC-INTEGRATION-TEST"
        assert isinstance(result.recommended_steps, list)
    except MetaModelServiceError as e:
        pytest.skip(f"Live Meta Model endpoint unreachable: {e}")
