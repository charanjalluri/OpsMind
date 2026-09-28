# OpsMind

> **AI Incident Response Agent with Persistent Engineering Memory**  
> Built for **HackwithHyderabad 3.0**

OpsMind addresses a persistent failure in SRE and platform operations: **engineering teams repeatedly solve the same production incidents from scratch**. Institutional knowledge is routinely lost across scattered postmortems, Slack war-rooms, and resolved tickets.

OpsMind introduces a **continuous learning loop** for incident response:
1. **Persistent Memory (Hindsight RETAIN)** — stores structured postmortems, root causes, remediations, and anti-pattern warnings into a Hindsight cloud memory bank.
2. **Memory-Grounded Investigation (Hindsight RECALL + Meta Muse Spark 1.3)** — every new incident starts by recalling matching past experiences and reasoning with real evidence, not generic pre-training.
3. **SRE Console (React + TypeScript)** — a live operator console for incident triage, investigation, resolution, and memory exploration.

---

## Why Persistent Memory Matters

```text
Without Persistent Memory (Stateless LLM):
  Incident → Generic Advice → Blind Restart → Duplicate Charges / Outage

With OpsMind + Hindsight:
  Incident → RECALL → Past Evidence + Warnings → Grounded Fix → RETAIN Postmortem → Next Incident is Smarter
```

> "The agent doesn't need a better model. It needs a persistent memory."

---

## Architecture

```text
 ┌────────────────────────────────────┐
 │         Active Incident            │
 │  INC-1127: payment-api 502s v2.9.1 │
 └────────────────┬───────────────────┘
                  │
                  ▼
 ┌────────────────────────────────────┐
 │     Hindsight Cloud RECALL         │
 │     bank: opsmind-engineering      │
 └────────────────┬───────────────────┘
                  │
 ┌────────────────┴───────────────────┐
 │    Recalled Engineering Evidence   │
 │  · INC-1042: pool_max regression   │
 │  · INC-1067: env-var mismatch      │
 │  · INC-1091: restart warning ⚠️    │
 └────────────────┬───────────────────┘
                  │
                  ▼
 ┌────────────────────────────────────┐
 │      Meta Muse Spark 1.3           │
 │    Evidence-Grounded Reasoning     │
 └────────────────┬───────────────────┘
                  │
                  ▼
 ┌────────────────────────────────────┐
 │   Grounded Action Plan + Warnings  │
 └────────────────┬───────────────────┘
                  │
                  ▼
 ┌────────────────────────────────────┐
 │    Engineer Resolves + Postmortem  │
 └────────────────┬───────────────────┘
                  │
                  ▼
 ┌────────────────────────────────────┐
 │     Hindsight Cloud RETAIN         │
 │   New postmortem → bank            │
 └────────────────┬───────────────────┘
                  │
                  ▼
 ┌────────────────────────────────────┐
 │   Future incidents benefit         │
 └────────────────────────────────────┘
```

---

## Core Technologies

| Component | Technology | Role |
|-----------|-----------|------|
| Persistent Memory | [Hindsight](https://vectorize.io) (`hindsight-client`) | RETAIN postmortems, RECALL evidence |
| Reasoning Engine | Meta Muse Spark 1.3 (`muse-spark-1.3`) | Evidence-grounded incident analysis |
| Backend | Python 3.12, FastAPI, Uvicorn, Pydantic v2 | REST API, investigation pipeline |
| Frontend | React 19, TypeScript, Vite, TailwindCSS | SRE operator console |

---

## Project Structure

```text
OpsMind/
├── backend/
│   ├── app/
│   │   ├── agent/            # SRE Investigator — recall → evidence → Muse Spark
│   │   ├── api/              # REST endpoints: health, incidents, investigations, memory
│   │   ├── llm/              # Meta Muse Spark 1.3 client
│   │   ├── memory/           # Hindsight SDK wrapper, RETAIN and RECALL modules
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── config.py         # Settings, env config, key handling
│   │   └── main.py           # FastAPI app + CORS
│   ├── scripts/
│   │   ├── seed_incidents.py             # Seed Hindsight with historical memories
│   │   ├── demo_before_after.py          # CLI before/after memory demonstration
│   │   └── verify_hindsight_recall.py    # Verify Hindsight RECALL works end-to-end
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Dashboard, incident investigation, memory explorer UI
│   │   ├── pages/            # Dashboard, Incidents, IncidentDetail, MemoryExplorer, DemoLearning
│   │   ├── services/         # API clients
│   │   └── types/            # TypeScript interfaces
│   └── package.json
│
├── data/seed/incidents.json  # Realistic INC-1042, INC-1067, INC-1091 postmortems
├── docs/
│   ├── MEMORY_ENGINE.md      # Hindsight memory engine design
│   └── LEARNING_LOOP_DEMO.md # Learning loop walkthrough
├── article.md                # Technical deep-dive article
├── .env.example
└── README.md
```

---

## Prerequisites

- **Python 3.12+**
- **Node.js 18+ and npm**
- **Hindsight API key** — sign up at [vectorize.io](https://vectorize.io)
- **Meta Model API key** (Muse Spark 1.3) — from [api.meta.ai](https://api.meta.ai)

---

## Environment Configuration

Copy the template and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Hindsight Persistent Memory
HINDSIGHT_API_KEY=your_hindsight_api_key_here
HINDSIGHT_API_URL=https://api.hindsight.vectorize.io
HINDSIGHT_BANK_ID=opsmind-engineering

# Meta Muse Spark 1.3
META_MODEL_API_KEY=your_meta_api_key_here
META_MODEL_NAME=muse-spark-1.3
META_MODEL_BASE_URL=https://api.meta.ai/v1

# App
ENVIRONMENT=development
```

> ⚠️ **Never commit your `.env` file.** It is excluded from Git via `.gitignore`.

---

## Installation & Running

### 1. Backend Setup

```bash
# From the repository root
python -m venv .venv

# Activate (Windows PowerShell)
.venv\Scripts\Activate.ps1

# Activate (Linux/macOS)
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Seed Hindsight with Historical Memories

This populates the `opsmind-engineering` memory bank with realistic past incidents (INC-1042, INC-1067, INC-1091) so the agent has evidence to recall against new incidents:

```bash
python -m backend.scripts.seed_incidents
```

You should see each memory confirmed as retained with its document ID.

### 3. Start the Backend

```bash
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

- **API base**: `http://127.0.0.1:8000`
- **OpenAPI docs**: `http://127.0.0.1:8000/docs`
- **Health check**: `http://127.0.0.1:8000/health`

### 4. Frontend Setup & Dev Server

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

- **SRE Console**: `http://127.0.0.1:5173` (or the port Vite reports)

---

## Running the Full Demo

### Step 1 — Verify Hindsight RECALL

Confirm the memory bank is populated and recall works:

```bash
python -m backend.scripts.verify_hindsight_recall
```

Expected output: recalled memories for `payment-api` matching connection pool regression and restart warnings.

### Step 2 — Investigate INC-1127

Open the SRE Console and select **INC-1127** (payment-api 502s after v2.9.1 deployment). Click **Investigate**. The agent will:
1. RECALL matching memories from Hindsight (INC-1042, INC-1091)
2. Invoke Muse Spark 1.3 with the evidence
3. Return root cause hypotheses, ordered action steps, and an explicit warning not to restart pods during active payment processing

### Step 3 — Resolve and RETAIN

Fill in the postmortem fields (root cause: connection pool regression, resolution: rollback, warning: no blind restarts). Click **Retain Experience in Hindsight**. The postmortem is stored in Hindsight under the incident ID.

### Step 4 — Prove the Learning Loop

Create a similar new incident (e.g., INC-1132 with the same symptoms on payment-api). Run Investigate. Hindsight RECALL should now return the postmortem you just retained — the agent is smarter because of the incident you just resolved.

### Step 5 — Before/After CLI Demo

```bash
python -m backend.scripts.demo_before_after
```

This runs two consecutive RECALL queries showing what the agent knows before seeding vs. after — a clean before/after demonstration.

---

## How RETAIN Works

When an engineer submits a resolution via `POST /api/incidents/{id}/resolve`:

1. The postmortem is converted into an `EngineeringMemory` domain model (`backend/app/memory/memory_types.py`)
2. `retain_from_resolution_request()` in `backend/app/memory/retain.py` calls `HindsightMemory.retain()`
3. The Hindsight SDK stores it in the `opsmind-engineering` bank with a deterministic `document_id` (the incident ID) for idempotency
4. Future RECALL queries can retrieve it semantically

## How RECALL Works

During investigation, `POST /api/investigations`:

1. `construct_incident_query()` builds a structured natural-language query from service, symptoms, environment, and deployment version
2. `recall_engineering_memories()` calls `HindsightMemory.recall()` with a 1500-token budget
3. Results are passed into the Muse Spark 1.3 system prompt as grounding evidence
4. Muse Spark reasons from the evidence and returns a structured JSON action plan

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health status, Hindsight + Muse Spark configuration check |
| `GET` | `/api/incidents` | List active SEV-1/SEV-2 incidents |
| `GET` | `/api/incidents/{id}` | Incident telemetry + timeline |
| `POST` | `/api/incidents/{id}/resolve` | Resolve incident, retain postmortem to Hindsight |
| `POST` | `/api/investigations` | RECALL + Muse Spark investigation |
| `POST` | `/api/memory/recall` | Direct Hindsight RECALL query |
| `POST` | `/api/memory/retain` | Manually retain a postmortem or decision record |
| `GET` | `/api/memory/knowledge` | Full memory catalog (seed + dynamically retained) |
| `GET` | `/api/dashboard/stats` | Dashboard metrics and memory bank status |

---

## Docs

- [docs/MEMORY_ENGINE.md](docs/MEMORY_ENGINE.md) — Hindsight memory engine design and schemas
- [docs/LEARNING_LOOP_DEMO.md](docs/LEARNING_LOOP_DEMO.md) — Step-by-step learning loop walkthrough
- [article.md](article.md) — Technical deep-dive: problem, architecture, implementation, lessons

---

## Hackathon Context & Roadmap

Built for **HackwithHyderabad 3.0** to demonstrate how stateful, persistent AI memory transforms engineering incident response.

### Future Roadmap
- Real-time OpenTelemetry and Prometheus alert webhook ingestion
- Automated remediation execution with human-in-the-loop approval gates
- Multi-bank tenancy across independent engineering domains
- Slack war-room transcription → automated postmortem draft
