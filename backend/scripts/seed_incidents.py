import json
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Ensure root workspace directory is on sys.path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BASE_DIR))

# Load .env files
load_dotenv(BASE_DIR / ".env")
load_dotenv(BASE_DIR / "backend" / ".env")

from backend.app.config import get_settings
from backend.app.memory.hindsight import (
    HindsightMemory,
    HindsightConfigurationError,
    HindsightServiceError,
)
from backend.app.memory.memory_types import EngineeringMemory
from backend.app.memory.retain import retain_engineering_memory


def main():
    print("=" * 40)
    print("OpsMind Memory Seeder")
    print("=" * 40)
    print()

    settings = get_settings()

    if not settings.hindsight_api_key:
        print("ERROR: Missing required environment variable: HINDSIGHT_API_KEY")
        print("Please configure HINDSIGHT_API_KEY in your .env file or environment.")
        print()
        print("Example (.env):")
        print("  HINDSIGHT_API_KEY=your_api_key_here")
        print("  HINDSIGHT_API_URL=https://api.hindsight.vectorize.io")
        print(f"  HINDSIGHT_BANK_ID={settings.hindsight_bank_id}")
        sys.exit(1)

    seed_file = BASE_DIR / "data" / "seed" / "incidents.json"
    if not seed_file.exists():
        print(f"ERROR: Seed file not found at {seed_file}")
        sys.exit(1)

    with open(seed_file, "r", encoding="utf-8") as f:
        incidents_data = json.load(f)

    total = len(incidents_data)
    print(f"Found {total} engineering memories to retain in bank '{settings.hindsight_bank_id}'")
    print(f"Connecting to Hindsight at: {settings.hindsight_api_url} ...")
    print()

    hindsight = HindsightMemory(settings=settings)

    success_count = 0
    for idx, item in enumerate(incidents_data, 1):
        mem = EngineeringMemory(**item)
        label = mem.incident_id or mem.title or f"item-{idx}"
        display_name = f"Storing {label}"
        dots = "." * max(2, 30 - len(display_name))

        try:
            retain_engineering_memory(mem, hindsight)
            print(f"[{idx}/{total}] {display_name} {dots} SUCCESS")
            success_count += 1
        except Exception as e:
            print(f"[{idx}/{total}] {display_name} {dots} FAILED")
            print(f"      Reason: {e}")

    print()
    if success_count == total:
        print("Memory seeding complete. All memories successfully stored.")
    else:
        print(f"Memory seeding finished with errors: {success_count}/{total} stored.")
        sys.exit(1)


if __name__ == "__main__":
    main()
