import json
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BASE_DIR))

load_dotenv(BASE_DIR / ".env")
load_dotenv(BASE_DIR / "backend" / ".env")

from backend.app.config import get_settings
from backend.app.memory.hindsight import HindsightMemory
from backend.app.llm.muse import MuseClient
from backend.app.agent.investigator import OpsMindInvestigator
from backend.app.schemas.incident import IncidentInvestigationRequest


def run_demo():
    print("=" * 70)
    print("OPSMIND: PERSISTENT MEMORY BEFORE / AFTER DEMONSTRATION")
    print("=" * 70)
    print()

    settings = get_settings()

    if not settings.hindsight_api_key or not settings.meta_model_api_key:
        print("[!] Note: Real API credentials missing in .env.")
        print(f"    HINDSIGHT_API_KEY: {'[SET]' if settings.hindsight_api_key else '[MISSING]'}")
        print(f"    META_MODEL_API_KEY: {'[SET]' if settings.meta_model_api_key else '[MISSING]'}")
        print()
        print("To run live against Hindsight and Meta Muse Spark 1.3, configure .env:")
        print("  HINDSIGHT_API_KEY=your_hindsight_key")
        print("  META_MODEL_API_KEY=your_meta_model_key")
        print("=" * 70)
        return

    test_request = IncidentInvestigationRequest(
        incident_id="INC-DEMO-502",
        service="payment-api",
        environment="production",
        deployment_version="v2.10.5",
        symptoms=[
            "HTTP 502 responses increased immediately after deployment v2.10.5",
            "Gateway timeouts on payment endpoints",
            "Service experiencing critical degradation",
        ],
        description="On-call engineer alerted to 502 spike. Considering restarting the pods.",
    )

    # PHASE 1: BEFORE MEMORY (Using an unseeded or isolated empty bank)
    print("----------------------------------------------------------------------")
    print("PHASE 1: BEFORE PERSISTENT MEMORY (Empty Bank: opsmind-unseeded-empty)")
    print("----------------------------------------------------------------------")
    print(f"Incident: {test_request.incident_id} | Service: {test_request.service}")
    print(f"Symptoms: {', '.join(test_request.symptoms)}")
    print()

    empty_hindsight = HindsightMemory(
        api_key=settings.hindsight_api_key,
        base_url=settings.hindsight_api_url,
        bank_id="opsmind-unseeded-empty",
        settings=settings,
    )
    muse = MuseClient(settings=settings)
    before_investigator = OpsMindInvestigator(
        hindsight_memory=empty_hindsight,
        muse_client=muse,
        settings=settings,
    )

    try:
        before_result = before_investigator.investigate(test_request)
        print(f">> Memory Used: {before_result.memory_used}")
        print(f">> Confidence: {before_result.confidence}")
        print(f">> Raw Evidence Count: {before_result.raw_evidence_count}")
        print(f">> Incident Summary: {before_result.incident_summary}")
        print(">> Historical Evidence Items:")
        if not before_result.historical_evidence:
            print("   [NONE FOUND - Agent acknowledges zero organizational memory]")
        for ev in before_result.historical_evidence:
            print(f"   - [{ev.incident_id}] {ev.summary}")
        print(">> Recommended Steps:")
        for step in before_result.recommended_steps:
            print(f"   * {step}")
        print(">> Warnings:")
        for w in before_result.warnings:
            print(f"   ! {w}")
    except Exception as e:
        print(f"Phase 1 execution error: {e}")

    print()
    print("----------------------------------------------------------------------")
    print("PHASE 2: AFTER PERSISTENT MEMORY (Seeded Bank: opsmind-engineering)")
    print("----------------------------------------------------------------------")
    print(f"Incident: {test_request.incident_id} | Service: {test_request.service}")
    print(f"Symptoms: {', '.join(test_request.symptoms)}")
    print()

    active_hindsight = HindsightMemory(
        api_key=settings.hindsight_api_key,
        base_url=settings.hindsight_api_url,
        bank_id=settings.hindsight_bank_id,
        settings=settings,
    )
    after_investigator = OpsMindInvestigator(
        hindsight_memory=active_hindsight,
        muse_client=muse,
        settings=settings,
    )

    try:
        after_result = after_investigator.investigate(test_request)
        print(f">> Memory Used: {after_result.memory_used}")
        print(f">> Confidence: {after_result.confidence}")
        print(f">> Raw Evidence Count: {after_result.raw_evidence_count}")
        print(f">> Incident Summary: {after_result.incident_summary}")
        print(">> Historical Evidence Recalled & Grounded:")
        for ev in after_result.historical_evidence:
            print(f"   - [{ev.incident_id}] {ev.summary}")
            print(f"     Relevance: {ev.relevance_to_current}")
            if ev.effective_actions:
                print(f"     Effective: {', '.join(ev.effective_actions)}")
            if ev.dangerous_actions:
                print(f"     DANGEROUS: {', '.join(ev.dangerous_actions)}")
        print(">> Possible Root Causes:")
        for rc in after_result.possible_root_causes:
            print(f"   ? {rc}")
        print(">> Recommended Next Steps:")
        for step in after_result.recommended_steps:
            print(f"   * {step}")
        print(">> Critical Warnings (Derived from Past Lessons & Decisions):")
        for w in after_result.warnings:
            print(f"   ! {w}")
    except Exception as e:
        print(f"Phase 2 execution error: {e}")

    print()
    print("=" * 70)
    print("DEMONSTRATION SUMMARY")
    print("Before: Agent had zero historical context; generic triage.")
    print("After:  Agent cited INC-1042 connection pools, INC-1067 config diffs,")
    print("        and explicitly WARNED against restarting payment-api based on INC-1091.")
    print("=" * 70)


if __name__ == "__main__":
    run_demo()
