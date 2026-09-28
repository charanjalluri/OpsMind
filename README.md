# OpsMind

> **AI Incident Response Agent with Persistent Engineering Memory**  
> Built for **HackwithHyderabad 3.0**

OpsMind addresses a persistent failure in SRE and platform operations: **engineering teams repeatedly solve the same production incidents from scratch**. When production breaks, institutional knowledge is routinely lost across scattered postmortems, Slack war-rooms, resolved Jira tickets, and individual engineers' heads.

OpsMind introduces a **continuous learning loop** for incident response:
1. **Persistent Memory Layer**: Uses **Hindsight** to retain and recall empirical engineering postmortems, root causes, effective remediations, and critical anti-pattern warnings.
2. **Reasoning Engine**: Uses **Meta Muse Spark 1.3** to synthesize active telemetry symptoms against historical evidence and produce structured, grounded action plans.
3. **SRE Console**: Delivers a high-density, real-time SRE incident operations console built with React, TypeScript, and TailwindCSS.

---

## 1. Problem & Solution

### The Problem
* **Repetitive Failures**: SRE teams diagnose identical configuration regressions or connection pool exhaustion bugs multiple times a year.
* **Dangerous Anti-Patterns**: Without immediate historical context, on-call engineers execute reflexive remediations (e.g. emergency pod restarts) that previously caused data loss or duplicate transactions.
* **Stateless LLM Limitations**: Standard AI incident assistants lose state across sessions and hallucinate generic advice based purely on pre-training data, ignorant of company-specific systems and past disasters.

### The OpsMind Solution
* **Organizational Memory Grounding**: Every investigation starts with real-time vector and metadata retrieval from the Hindsight memory bank (`opsmind-engineering`).
* **Empirical Remediation**: Recommendations cite specific past incident IDs, verified root causes, and explicit operational cautions.
* **Continuous Feedback Loop**: When an engineer resolves an incident, the verified postmortem is committed back into Hindsight, making future investigations immediately smarter.

---

## 2. Why Persistent Memory Matters

```text
Without Persistent Memory (Stateless LLM):
Incident Occurs ──► Generic Advice ──► Blind Restart ──► Duplicate Charges / Outage

With Persistent Memory (OpsMind + Hindsight):
Incident Occurs ──► Hindsight Recall ──► Precedents & Warnings ──► Grounded Fix ──► Retain Postmortem
```

The core tenet of OpsMind: **"The agent does not need a new model; it needs a persistent memory."**

---

## 3. Roles of Core Technologies

* **Hindsight (`hindsight-client`)**: Serves as the persistent organizational memory bank. It stores and indexes structured engineering experiences: confirmed root causes, environment parameters, effective recovery actions, and operational anti-patterns.
* **Meta Muse Spark 1.3 (`muse-spark-1.3`)**: Serves as the reasoning engine. It evaluates active symptoms strictly through the lens of recalled historical evidence, avoiding speculative or unsafe interventions.
* **FastAPI Backend**: Exposes REST APIs for incident lifecycle management, investigation execution, and memory retain/recall operations.
* **React + Vite Frontend**: Provides a clean SRE workstation featuring an incident console, live timeline, telemetry inspection, memory explorer, and interactive learning loop demonstration.

---

## 4. Architecture & Workflow

```text
                        ┌──────────────────────────────┐
                        │      Active Incident         │
                        │ (symptoms, service, version) │
                        └──────────────┬───────────────┘
                                       │
                                       ▼
                        ┌──────────────────────────────┐
                        │   Hindsight Cloud RECALL     │
                        │   (bank: opsmind-engineering)│
                        └──────────────┬───────────────┘
                                       │
                        ┌──────────────┴───────────────┐
                        │ Recalled Engineering Evidence│
                        │  - INC-1042: Pool regression │
                        │  - INC-1091: Restart warning │
                        └──────────────┬───────────────┘
                                       │
                                       ▼
                        ┌──────────────────────────────┐
                        │     Meta Muse Spark 1.3      │
                        │    Reasoning & Synthesis     │
                        └──────────────┬───────────────┘
                                       │
                                       ▼
                        ┌──────────────────────────────┐
                        │ Grounded SRE Action Plan &   │
                        │   Anti-Pattern Warnings      │
                        └──────────────┬───────────────┘
                                       │
                        ┌──────────────┴───────────────┐
                        │ Engineer Resolves Incident   │
                        └──────────────┬───────────────┘
                                       │
                                       ▼
                        ┌──────────────────────────────┐
                        │   Hindsight Cloud RETAIN     │
                        │  (New Postmortem Committed)  │
                        └──────────────┬───────────────┘
                                       │
                                       ▼
                        ┌──────────────────────────────┐
                        │ Future Incidents Benefit     │
                        └──────────────────────────────┘
```

For detailed memory engine design and schemas, see [docs/MEMORY_ENGINE.md](docs/MEMORY_ENGINE.md).  
For the learning loop demo guide, see [docs/LEARNING_LOOP_DEMO.md](docs/LEARNING_LOOP_DEMO.md).

---

## 5. Main Features

1. **SRE Incident Console**: Real-time incident dashboard with severity indicators (`SEV-1`, `SEV-2`), status tags, and service attribution.
2. **Telemetry & Precedent Correlation**: Live incident inspection showing service details, deployment versions, active symptoms, and impacted endpoints.
3. **Memory-Grounded Investigation**: Automated reasoning that cites matching past incidents, predicts probable root causes, and generates ordered action steps.
4. **Elevated Anti-Pattern Cautions**: Prominently highlights historical warnings (e.g., forbidding reflexive restarts of transactional services).
5. **Interactive Postmortem Capture & Retention**: Resolving an incident captures structured postmortem fields (root cause, fix, outcome, warnings) and retains them into Hindsight.
6. **Hindsight Memory Explorer**: Full visual inspection of retained engineering memories, category filtering, and real-time semantic query test bar.
7. **Experience Learning Loop Demo**: Step-by-step interactive demonstration showing incident triage before learning vs. after retaining new experience.

---

## 6. Technology Stack

* **Backend**: Python 3.12, FastAPI, Uvicorn, Pydantic v2, HTTPX
* **Memory Layer**: [Hindsight](https://vectorize.io) Python SDK (`hindsight-client`)
* **LLM Engine**: Meta Muse Spark 1.3 (`https://api.meta.ai/v1`)
* **Frontend**: React 18, TypeScript, Vite, TailwindCSS, Lucide Icons
* **Testing**: Pytest, Pytest-Asyncio, HTTPX TestClient

---

## 7. Project Structure

```text
OpsMind/
├── backend/
│   ├── app/
│   │   ├── agent/                 # SRE Investigator agent & prompt templates
│   │   ├── api/                   # FastAPI endpoints (health, incidents, investigations, memory)
│   │   ├── llm/                   # Meta Muse Spark 1.3 client integration
│   │   ├── memory/                # Hindsight SDK abstraction, retain & recall modules
│   │   ├── schemas/               # Pydantic request/response schemas
│   │   ├── config.py              # Environment configuration & settings
│   │   └── main.py                # Application entrypoint & CORS middleware
│   ├── scripts/
│   │   ├── demo_before_after.py   # CLI before/after memory demonstration
│   │   ├── seed_incidents.py      # Seeds realistic engineering memories into Hindsight
│   │   └── test_recall.py         # Standalone Hindsight recall verification script
│   ├── tests/                     # Comprehensive test suite (40 tests)
│   ├── requirements.txt           # Python dependencies
│   └── .env.example               # Backend environment template
│
├── frontend/
│   ├── src/
│   │   ├── components/            # UI, layout, dashboard, investigation, and memory components
│   │   ├── pages/                 # Dashboard, IncidentDetail, MemoryExplorer, DemoLearning
│   │   ├── services/              # API clients for incidents, investigations, and memory
│   │   ├── types/                 # TypeScript interfaces for incidents, memory, telemetry
│   │   ├── App.tsx                # App root & navigation
│   │   └── index.css              # Design tokens & typography (IBM Plex Sans)
│   ├── package.json               # Node dependencies & build scripts
│   └── vite.config.ts             # Vite bundler configuration (proxy to :8000)
│
├── data/
│   └── seed/
│       └── incidents.json         # Realistic seed incident and postmortem records
├── docs/
│   ├── MEMORY_ENGINE.md           # Hindsight memory engine specification
│   └── LEARNING_LOOP_DEMO.md      # Experience loop walkthrough guide
│
├── .env.example                   # Root environment template
├── .gitignore                     # Production Git ignore rules
├── pytest.ini                     # Pytest configuration
└── README.md
```

---

## 8. Environment Setup & Configuration

Create a `.env` file in the project root or `backend/` by copying `.env.example`:

```bash
cp .env.example .env
```

Configure your credentials:

```env
# Hindsight Persistent Memory Configuration
HINDSIGHT_API_KEY=your_hindsight_api_key_here
HINDSIGHT_API_URL=https://api.hindsight.vectorize.io
HINDSIGHT_BANK_ID=opsmind-engineering

# Meta Model (Muse Spark 1.3) Configuration
META_MODEL_API_KEY=your_meta_api_key_here
META_MODEL_NAME=muse-spark-1.3
META_MODEL_BASE_URL=https://api.meta.ai/v1

# Application Environment
ENVIRONMENT=development
```

> **Security Note**: Never commit actual API keys or credentials. The `.env` file is excluded from Git tracking via `.gitignore`.

---

## 9. Local Installation & Running

### 1. Prerequisites
* **Python**: 3.12+
* **Node.js**: 18+ and npm

### 2. Backend Setup
```bash
# From repository root
python -m venv .venv

# Activate virtual environment
# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# Linux/macOS:
source .venv/bin/activate

# Install backend dependencies
pip install -r requirements.txt
```

### 3. Seed Initial Engineering Memories (Optional)
To populate the Hindsight memory bank with initial postmortems:
```bash
python -m backend.scripts.seed_incidents
```

### 4. Run the Backend Server
```bash
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
* **API Root**: `http://127.0.0.1:8000`
* **Interactive OpenAPI Docs**: `http://127.0.0.1:8000/docs`
* **Health Check**: `http://127.0.0.1:8000/health`

### 5. Frontend Setup & Running
In a separate terminal window:
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
* **SRE Console UI**: `http://127.0.0.1:3000`

---

## 10. Running Tests

### Backend Test Suite
The backend contains 40 tests covering health endpoints, Hindsight retain/recall abstractions, Muse Spark 1.3 prompt formatting and error handling, incident lifecycle, and mock investigations.

```bash
# Run all unit and mock tests (no live API keys required)
python -m pytest backend/tests/ -v
```

To run live integration tests against live Hindsight Cloud and Meta Muse Spark APIs:
```bash
python -m pytest backend/tests/ -m integration -v
```

### Frontend Build & Lint Verification
```bash
cd frontend
npm run build
```

---

## 11. Interactive Demo: The Experience Loop

To experience how OpsMind learns in the web application:
1. Open `http://127.0.0.1:3000` in your browser.
2. Click **"Experience Loop"** in the top navigation or sidebar.
3. **Phase 1 (Before Learning)**: View `INC-1130` (`orders-worker` queue starvation). Zero relevant historical experiences exist in the memory bank; generic advice recommends pod restarts.
4. **Phase 2 (Resolve & Retain)**: Fill or pre-fill the postmortem documenting that lock contention was resolved by throttling `sync_concurrency`, with an explicit warning **not** to kill pods. Click **"Retain Experience in Hindsight"**.
5. **Phase 3 (After Learning)**: A future incident (`INC-1142`) occurs 2 weeks later. Click **"Recall from Hindsight"** to watch OpsMind automatically retrieve the retained postmortem live from Hindsight.

---

## 12. API Reference Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | System health status and configuration verification |
| `GET` | `/api/incidents` | List active, mitigated, and resolved incidents |
| `GET` | `/api/incidents/{id}` | Retrieve incident telemetry and timeline |
| `POST` | `/api/incidents/{id}/resolve` | Resolve incident, generate postmortem, and retain to Hindsight |
| `POST` | `/api/investigations` | Run SRE investigation using Hindsight recall & Meta Muse Spark |
| `POST` | `/api/memory/recall` | Query Hindsight memory bank for semantic matches |
| `POST` | `/api/memory/retain` | Manually retain an engineering postmortem or decision record |
| `GET` | `/api/memory/knowledge-base` | Retrieve all indexed memories in the bank |

---

## 13. Hackathon Context & Future Roadmap

OpsMind was developed for **HackwithHyderabad 3.0** to demonstrate how stateful, persistent AI memory transforms engineering incident response.

### Future Roadmap
* **Telemetry Streaming**: Real-time OpenTelemetry and Prometheus alert webhook ingestion.
* **Bi-directional Runbooks**: Automated remediation execution with human-in-the-loop approval.
* **Multi-Bank Tenancy**: Partitioning memory banks across independent engineering domains and clusters.
* **Automated Postmortem Drafts**: Transcribing Slack war-room threads directly into structured postmortem proposals.
