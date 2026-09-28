import os
import sys
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BASE_DIR))

load_dotenv(BASE_DIR / ".env")
load_dotenv(BASE_DIR / "backend" / ".env")

from backend.app.config import get_settings
from backend.app.memory.hindsight import HindsightMemory, HindsightConfigurationError, HindsightServiceError
from backend.app.memory.recall import recall_engineering_memories


def main():
    settings = get_settings()

    query = "The payment API is returning HTTP 502 errors immediately after today's deployment. What should I investigate first?"

    print("QUERY")
    print("-----")
    print(query)
    print()

    if not settings.hindsight_api_key:
        print("ERROR: HINDSIGHT_API_KEY is not configured.")
        print("Please configure HINDSIGHT_API_KEY in .env to perform recall against Hindsight.")
        sys.exit(1)

    hindsight = HindsightMemory(settings=settings)

    try:
        response = recall_engineering_memories(
            query=query,
            hindsight_memory=hindsight,
            bank_id=settings.hindsight_bank_id,
        )
    except Exception as e:
        print(f"Recall request failed: {e}")
        sys.exit(1)

    print("RECALLED MEMORIES")
    print("-----------------")
    if not response.results:
        print("No memories found in bank.")
        return

    for idx, item in enumerate(response.results, 1):
        mem_id = item.id or item.metadata.get("incident_id") or "Memory"
        snippet = item.text.replace("\n", " ").strip()
        if len(snippet) > 120:
            snippet = snippet[:117] + "..."
        print(f"{idx}. [{mem_id}] {snippet}")

    print()
    print(f"Total memories retrieved: {response.count}")


if __name__ == "__main__":
    main()
