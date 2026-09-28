import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from pydantic import ValidationError

from backend.app.main import app
from backend.app.config import Settings, get_settings
from backend.app.schemas.incident import (
    IncidentResolutionRequest,
    IncidentResolutionResponse,
    MemoryRetainRequest,
)
from backend.app.memory.hindsight import HindsightMemory, HindsightServiceError
from backend.app.api.incidents import ACTIVE_INCIDENTS, mark_incident_resolved


def test_postmortem_schema_validation():
    """Verify validation rules: root_cause, resolution, outcome cannot be empty."""
    # Valid postmortem
    req = IncidentResolutionRequest(
        incident_id="INC-1127",
        service="payment-api",
        root_cause="Database connection pool configuration regression in v2.9.1.",
        resolution="Rolled back v2.9.1 and restored pool configuration.",
        outcome="Errors returned to baseline.",
        lessons_learned="Check pool config before restart.",
        successful_actions=["Rollback", "Config diff"],
        failed_actions=["Emergency restart"],
        warnings=["Do not restart payment-api without draining"],
    )
    assert req.incident_id == "INC-1127"
    assert req.root_cause == "Database connection pool configuration regression in v2.9.1."

    # Blank root_cause must fail validation
    with pytest.raises(ValidationError):
        IncidentResolutionRequest(
            incident_id="INC-1127",
            service="payment-api",
            root_cause="   ",
            resolution="Rolled back",
            outcome="Successful",
        )

    # Blank resolution must fail validation
    with pytest.raises(ValidationError):
        IncidentResolutionRequest(
            incident_id="INC-1127",
            service="payment-api",
            root_cause="Bug in code",
            resolution="",
            outcome="Successful",
        )


def test_memory_retain_request_validation():
    """Verify validation rules on MemoryRetainRequest."""
    with pytest.raises(ValidationError):
        MemoryRetainRequest(
            service="",
            resolution="Done",
        )

    with pytest.raises(ValidationError):
        MemoryRetainRequest(
            service="payment-api",
            resolution="   ",
        )


def test_incident_resolution_state_update():
    """Test in-memory incident resolution status update."""
    target_id = "INC-1127"
    res = mark_incident_resolved(
        incident_id=target_id,
        root_cause="Pool exhaustion",
        resolution="Reverted pool max to 50",
        outcome="Restored",
    )
    assert res is not None
    assert res.status == "Resolved"
    assert res.root_cause == "Pool exhaustion"
    assert res.resolution == "Reverted pool max to 50"
    assert res.resolved_at is not None
    assert len(res.timeline_events) > 0


def test_resolve_incident_api_unconfigured_error():
    """Test 503 response when Hindsight is unconfigured."""
    app.dependency_overrides[get_settings] = lambda: Settings(
        hindsight_api_key="",
    )
    try:
        client = TestClient(app)
        payload = {
            "incident_id": "INC-1127",
            "service": "payment-api",
            "root_cause": "Regression in connection pool config",
            "resolution": "Rollback deployment",
            "outcome": "Successful",
        }
        resp = client.post("/api/incidents/INC-1127/resolve", json=payload)
        assert resp.status_code == 503
        assert "Memory service unavailable" in resp.json()["detail"]
    finally:
        app.dependency_overrides.pop(get_settings, None)


def test_resolve_incident_api_success():
    """Test successful incident resolution and experience retention."""
    mock_retain_resp = MagicMock()
    mock_retain_resp.success = True
    mock_retain_resp.items_count = 1

    with patch.object(HindsightMemory, "is_configured", True):
        with patch.object(HindsightMemory, "retain", return_value=mock_retain_resp):
            client = TestClient(app)
            payload = {
                "incident_id": "INC-1127",
                "service": "payment-api",
                "severity": "SEV-1",
                "root_cause": "Connection pool max decreased from 50 to 5",
                "resolution": "Rolled back to previous version v2.9.0",
                "outcome": "Successful - 502 error rate dropped to 0%",
                "lessons_learned": "Compare pool configs on release",
                "successful_actions": ["Rollback deployment v2.9.1"],
                "failed_actions": ["Emergency pod restart"],
                "warnings": ["Do not restart payment-api blindly"],
            }
            resp = client.post("/api/incidents/INC-1127/resolve", json=payload)
            assert resp.status_code == 200
            data = resp.json()
            assert data["success"] is True
            assert data["status"] == "Resolved"
            assert data["incident_id"] == "INC-1127"
            assert data["retained_memory"]["success"] is True

            # Verify GET /api/incidents/INC-1127 now reflects Resolved
            get_resp = client.get("/api/incidents/INC-1127")
            assert get_resp.status_code == 200
            inc = get_resp.json()
            assert inc["status"] == "Resolved"
            assert inc["root_cause"] == "Connection pool max decreased from 50 to 5"
            assert len(inc["timeline_events"]) > 0


def test_duplicate_submission_handling():
    """Test that submitting postmortem multiple times handles idempotently."""
    mock_retain_resp = MagicMock()
    mock_retain_resp.success = True
    mock_retain_resp.items_count = 1

    with patch.object(HindsightMemory, "is_configured", True):
        with patch.object(HindsightMemory, "retain", return_value=mock_retain_resp):
            client = TestClient(app)
            payload = {
                "incident_id": "INC-1127",
                "service": "payment-api",
                "root_cause": "Idempotent test cause",
                "resolution": "Idempotent test resolution",
                "outcome": "Successful",
            }
            # First submit
            resp1 = client.post("/api/incidents/INC-1127/resolve", json=payload)
            assert resp1.status_code == 200
            # Second submit (duplicate click)
            resp2 = client.post("/api/incidents/INC-1127/resolve", json=payload)
            assert resp2.status_code == 200
            assert resp2.json()["success"] is True
            assert resp2.json()["status"] == "Resolved"
