from fastapi.testclient import TestClient
from backend.app.main import app


def test_get_incidents():
    """Test retrieving active incidents list."""
    client = TestClient(app)
    response = client.get("/api/incidents")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 3
    ids = [inc["incident_id"] for inc in data]
    assert "INC-1127" in ids
    assert "INC-1126" in ids


def test_get_incident_detail():
    """Test retrieving individual incident details."""
    client = TestClient(app)
    response = client.get("/api/incidents/INC-1127")
    assert response.status_code == 200
    data = response.json()
    assert data["incident_id"] == "INC-1127"
    assert data["service"] == "payment-api"
    assert data["severity"] == "SEV-1"
    assert len(data["symptoms"]) > 0


def test_get_dashboard_stats():
    """Test retrieving dashboard statistics."""
    client = TestClient(app)
    response = client.get("/api/dashboard/stats")
    assert response.status_code == 200
    data = response.json()
    assert "active_incidents" in data
    assert "critical_incidents" in data
    assert "memory_signal" in data
    assert data["memory_signal"]["relevant_experiences"] > 0


def test_get_memory_knowledge():
    """Test retrieving memory knowledge base catalog."""
    client = TestClient(app)
    response = client.get("/api/memory/knowledge")
    assert response.status_code == 200
    data = response.json()
    assert data["total_memories"] >= 5
    assert "categories" in data
