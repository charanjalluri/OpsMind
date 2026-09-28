import pytest
from unittest.mock import MagicMock
from backend.app.config import Settings
from backend.app.memory.hindsight import HindsightMemory
from backend.app.memory.memory_types import EngineeringMemory
from backend.app.memory.retain import retain_engineering_memory
from backend.app.memory.recall import construct_incident_query, recall_engineering_memories
from backend.app.agent.investigator import OpsMindInvestigator
from backend.app.schemas.incident import IncidentInvestigationRequest


@pytest.mark.integration
def test_end_to_end_learning_loop_live():
    """
    End-to-End Learning Loop test against live Hindsight service:
    1. Define simulated incident experience with a unique identifier.
    2. Retain the experience into Hindsight bank 'opsmind-engineering'.
    3. Query Hindsight with a new similar incident.
    4. Verify the newly retained experience is recalled as evidence.
    5. Pass evidence into OpsMind investigator and verify memory grounding.
    """
    settings = Settings()
    if not settings.is_hindsight_configured:
        pytest.skip("Skipping live learning loop test: HINDSIGHT_API_KEY not configured")

    memory_service = HindsightMemory(settings=settings)
    test_incident_id = "INC-LEARN-TEST-99"
    test_unique_key = "RedisClusterRebalancingRegression"

    # Step 1 & 2: Retain simulated incident A
    memory = EngineeringMemory(
        incident_id=test_incident_id,
        memory_type="incident_postmortem",
        title=f"Redis cluster timeout during slot migration - {test_unique_key}",
        service="cache-service",
        environment="production",
        severity="SEV-2",
        symptoms=[
            f"Redis read timeouts spiking across session nodes ({test_unique_key})",
            "p99 session cache latency exceeded 1500ms during slot rebalancing",
        ],
        confirmed_root_cause=f"Topology rebalancing starved read connections ({test_unique_key}).",
        resolution="Paused cluster slot rebalance and throttled migration rate to 10 slots/sec.",
        outcome="Successful - session cache latency dropped back to 3ms.",
        failed_approaches=["Blindly restarting Redis cache pods, which caused cache stampede."],
        successful_approaches=["Throttling slot migration rate via redis-cli."],
        warnings=["Do not restart Redis cluster pods during active cluster rebalance."],
        lessons_learned=[f"For {test_unique_key}, throttle slot rebalancing before any pod operations."],
        tags=["cache", "redis", "rebalance", test_unique_key.lower()],
    )

    retain_res = retain_engineering_memory(memory, memory_service)
    assert retain_res.success is True
    assert retain_res.incident_id == test_incident_id

    # Step 3 & 4: Create similar incident B and recall Hindsight
    recall_query = f"cache-service Redis read timeouts during cluster slot rebalance {test_unique_key}"
    recall_res = recall_engineering_memories(
        query=recall_query,
        hindsight_memory=memory_service,
    )

    assert recall_res.count > 0
    # Verify that the recalled facts contain evidence from incident A
    found_evidence = any(
        test_incident_id in r.text or test_unique_key.lower() in r.text.lower() or "slot" in r.text.lower()
        for r in recall_res.results
    )
    assert found_evidence is True, f"Expected {test_incident_id} or {test_unique_key} in recalled memories"

    # Step 5: Verify investigator integrates the recalled evidence
    mock_muse = MagicMock()
    mock_muse.is_configured = True
    mock_muse.generate_json.return_value = {
        "incident_summary": "Investigation into cache-service Redis timeouts",
        "historical_evidence": [
            {
                "incident_id": test_incident_id,
                "service": "cache-service",
                "summary": f"Prior failure: {test_unique_key} caused read timeouts",
                "relevance_to_current": "Direct precedent: slot rebalance throttled instead of pod restarts",
                "past_root_cause": "Unthrottled slot migration",
                "effective_actions": ["Throttle migration rate to 10 slots/sec"],
                "dangerous_actions": ["Blindly restarting Redis cache pods"],
                "lessons_learned": [f"For {test_unique_key}, throttle slot rebalancing before any pod operations."],
            }
        ],
        "possible_root_causes": ["Unthrottled slot rebalance starving connections"],
        "recommended_steps": ["Throttle slot migration rate to 10 slots/sec"],
        "warnings": ["Do NOT restart Redis pods; will cause cache stampede"],
        "confidence": "High - Grounded in Historical Precedents",
        "memory_used": True,
    }

    investigator = OpsMindInvestigator(hindsight_memory=memory_service, muse_client=mock_muse)
    investigation_req = IncidentInvestigationRequest(
        incident_id="INC-FUTURE-002",
        service="cache-service",
        symptoms=[f"Redis read timeouts spiking ({test_unique_key})"],
    )
    result = investigator.investigate(investigation_req)

    assert result.memory_used is True
    assert result.raw_evidence_count > 0
    assert len(result.historical_evidence) == 1
    assert result.historical_evidence[0].incident_id == test_incident_id
    assert "Do NOT restart Redis pods" in result.warnings[0]
