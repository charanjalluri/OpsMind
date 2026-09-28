# OpsMind: When Your AI Incident Agent Remembers What Your Team Learned the Hard Way

*A hackathon engineering post from HackWithHyderabad 3.0*

---

## The Problem

Your payment API goes down at 2am. HTTP 502 errors spike. You wake up an on-call engineer who has been on the team for three months. They do what seems reasonable: restart the pods to relieve pressure.

Except that's exactly what caused $12,400 in duplicate charges six months ago, when a previous SRE team discovered that restarting payment-api mid-transaction severs in-flight database connections and triggers retry storms. That lesson was written up in a postmortem, filed in a Confluence page, and then forgotten by everyone who wasn't there.

The problem isn't that engineers are careless. It's that **engineering teams don't have memory**. Every incident investigation starts from scratch. Runbooks get stale. Postmortems accumulate in wikis. The team that solved the database connection pool regression in v2.9.0 turns over, and the next team hits the same failure pattern twelve months later and spends four hours diagnosing something that was already understood.

**OpsMind is an attempt to fix this.**

---

## What We Built

OpsMind is an AI incident-response agent that maintains **persistent engineering memory**. When a production incident occurs, it retrieves the team's historical experience from [Hindsight](https://hindsight.vectorize.io) — previous postmortems, engineering decisions, warnings, and lessons learned — and uses that evidence to ground a [Meta Muse Spark 1.3](https://ai.meta.com) investigation.

The investigation produces:
- What historical incidents match the current symptoms
- What worked to fix them
- What failed or caused harm (explicitly flagged as warnings)
- Recommended investigation steps, ordered by evidence

When the engineer resolves the incident, the resolution is retained back into Hindsight. The next similar incident starts with richer evidence.

**This is the core loop:**

```
Production Incident
      ↓
Hindsight RECALL → Historical evidence retrieved
      ↓
Meta Muse Spark 1.3 → Evidence-grounded investigation
      ↓
Engineer investigates → Root cause identified
      ↓
Engineer resolves → Resolution + postmortem captured
      ↓
Hindsight RETAIN → New experience stored
      ↓
Future incident → Better investigation from day one
```

---

## Architecture

```
React Frontend (Vite + TypeScript)
        ↓
FastAPI Backend (Python)
    ├── /api/investigations  → Recall + Muse Spark investigation
    ├── /api/incidents       → Incident management + resolution retain
    ├── /api/memory          → Direct retain/recall + knowledge explorer
    └── /health
        ↓
Hindsight (Persistent Memory Layer)
    ├── RECALL → semantic search over engineering experience
    └── RETAIN → structured postmortem stored as experience document
        ↓
Meta Muse Spark 1.3 (Reasoning Layer)
    └── OpenAI-compatible API, evidence-grounded prompts
```

The frontend is a full SRE console: a dashboard with active incidents and memory signal stats, an incidents list with severity filtering, an investigation view that shows the Hindsight evidence alongside the Muse analysis, a resolution modal that writes the postmortem back to memory, and a Memory Explorer for browsing what has been retained.

---

## The Hindsight Memory Layer

[Hindsight](https://hindsight.vectorize.io) provides persistent memory as a managed service. Documents are stored in a "bank" and retrieved via semantic search. OpsMind wraps this in two domain-specific operations.

### RETAIN: Storing Engineering Experience

When an engineer resolves an incident, OpsMind converts the resolution into a structured `EngineeringMemory` document:

```python
class EngineeringMemory(BaseModel):
    incident_id: str
    title: str
    service: str
    environment: str
    deployment_version: Optional[str]
    symptoms: List[str]
    confirmed_root_cause: str
    investigation_steps: List[str]
    actions_taken: List[str]
    resolution: str
    outcome: str
    failed_approaches: List[str]    # what didn't work
    warnings: List[str]             # critical anti-patterns
    lessons_learned: List[str]
```

This document is stored in Hindsight via the `hindsight_client` SDK:

```python
hindsight_memory.retain(
    document_id=memory.incident_id,
    text=experience_text,           # rich structured text
    metadata={"service": memory.service, "type": "incident", ...},
    tags=[memory.service, memory.environment, ...]
)
```

The `document_id` is deterministic (incident ID), so re-resolving the same incident updates the memory rather than duplicating it.

### RECALL: Retrieving Historical Context

Before investigating an incident, OpsMind queries Hindsight with a constructed query:

```python
query = f"Service: {service}\nEnvironment: production\nSymptoms: {symptoms_text}\nDeployment: {version}"
response = hindsight_memory.recall(query=query, bank_id=bank_id)
```

The response contains ranked memory documents. These are formatted as structured historical context and injected into the Muse Spark system prompt.

---

## Meta Muse Spark 1.3 Investigation

The investigation prompt is explicit about its grounding:

```
CRITICAL OPERATIONAL RULES:
1. Historical memories provided are your empirical evidence.
   Cite them explicitly by identifier (INC-1042, DECISION-PAYMENT-RESTART).
2. If memory contains no relevant records, state this clearly.
   Set memory_used to false and confidence to "Low - Insufficient Historical Evidence".
3. NEVER fabricate incident IDs, postmortems, or policies.
```

This prevents hallucination. The model can only cite incidents that are in the recalled memory. If no memory exists, it says so and provides standard SRE triage, but it doesn't invent precedents.

The response schema is enforced:

```json
{
  "incident_id": "INC-1127",
  "incident_summary": "...",
  "historical_evidence": [{
    "incident_id": "INC-1042",
    "relevance_to_current": "...",
    "effective_actions": [...],
    "dangerous_actions": [...],
    "lessons_learned": [...]
  }],
  "possible_root_causes": [...],
  "recommended_steps": [...],
  "warnings": [...],
  "confidence": "High - Directly Supported by Historical Precedents",
  "memory_used": true
}
```

Muse Spark 1.3 is accessed via its OpenAI-compatible endpoint. The `unwrap_api_key` utility in `config.py` handles the fact that Pydantic `SecretStr` wraps the key — the raw string must be extracted before passing to the OpenAI client, otherwise the client serializes the object and the API returns an invalid request error.

---

## A Realistic Incident Example

OpsMind ships with seed data representing a realistic history for a `payment-api` service.

**INC-1042** — Database connection pool regression in v2.9.0. Symptoms: HTTP 502 errors immediately after deployment. Root cause: `pool_max` dropped from 50 to 5 in config. Fixed by rolling back and restoring the pool setting. Lesson: diff connection pool configs before assuming external provider issues.

**INC-1091** — Duplicate payment processing from an emergency restart. An on-call engineer restarted pods during live payment traffic to relieve pressure. This severed in-flight transactions, causing retry storms and 47 customers charged twice. Lesson: never restart payment-api without draining in-flight transactions.

**DECISION-PAYMENT-RESTART** — Engineering policy: automatic restart of payment-api is prohibited without lead SRE sign-off. This decision was captured as a separate memory so it surfaces on any payment-api incident, even when the symptoms don't directly resemble INC-1091.

When INC-1127 arrives (new 502 spike on payment-api after a deployment), Hindsight recalls INC-1042 and DECISION-PAYMENT-RESTART. Muse Spark connects the dots: "Check the database connection pool configuration in the new deployment. Do not restart the service without draining."

The investigation takes seconds. The engineer knows what to check first and what to avoid. Without OpsMind, this would require searching Confluence, asking colleagues, or making the same mistake again.

---

## Implementation Notes

**Stack**: FastAPI, Pydantic, hindsight-client, openai (for Meta's compatible endpoint), React, Vite, TypeScript, Tailwind CSS.

**Memory idempotency**: The `RETAINED_DOCUMENT_IDS` set in `retain.py` prevents double-storing a resolution if the API is called twice. The deterministic document_id also means Hindsight will update rather than duplicate.

**Confidence signal**: The investigation result exposes `memory_used: bool` and a `confidence` string. The frontend displays a "Memory Signal" card showing whether the investigation was grounded in historical evidence. If `memory_used` is false, the UI clearly indicates the investigation had no historical precedent — not a failure mode, but a signal that this is the first time the team has encountered this pattern.

**CORS**: The backend uses `allow_origins=["*"]` for the hackathon. For production, this should be restricted to the frontend's domain.

**Configuration**: All credentials are loaded via Pydantic `BaseSettings` from environment variables. No keys are hardcoded. The `unwrap_api_key` utility handles `SecretStr` safely.

---

## What the Learning Loop Looks Like in Practice

1. **Seed the memory bank**: `python backend/scripts/seed_incidents.py`
   — Stores INC-1042, INC-1091, DECISION-PAYMENT-RESTART, INC-1110 into Hindsight.

2. **Investigate INC-1127**: POST `/api/investigations` with payment-api symptoms.
   — Hindsight recalls INC-1042 and the restart policy.
   — Muse Spark produces an evidence-grounded investigation warning against restart.

3. **Resolve INC-1127**: POST `/api/incidents/INC-1127/resolve` with root cause and resolution.
   — OpsMind retains the postmortem to Hindsight.

4. **Investigate INC-1135** (similar symptoms two weeks later): POST `/api/investigations`.
   — Hindsight now recalls INC-1042, INC-1091, DECISION-PAYMENT-RESTART, **and INC-1127**.
   — The investigation is richer: it cites the most recent precedent alongside the older ones.

Each resolution makes the next investigation better. The system is genuinely improving, not simulating it.

---

## Limitations

**Hindsight recall quality depends on the quality of retained documents.** Sparse postmortems produce sparse evidence. The more structured the resolution capture (root cause, specific actions, failures), the better the recall.

**Muse Spark 1.3 is constrained to the evidence it receives.** It will not diagnose root causes that aren't in the recalled memories unless it falls back to standard SRE triage. That's intentional — hallucinated postmortems are worse than no postmortems.

**The frontend memory bank in this demo is pre-seeded.** In a real deployment, memories accumulate over time. A fresh installation with no historical data will produce lower-confidence investigations until the team builds up their memory bank.

**No authentication or multi-tenancy.** This is a hackathon prototype. Production use would require user sessions, team-scoped memory banks, and role-based access.

---

## What We Learned

The most important lesson was about the failure mode of AI grounding. Early versions of the prompt didn't explicitly forbid fabrication, and Muse Spark would invent plausible-sounding incident IDs. Adding `"NEVER fabricate incident IDs, postmortems, or policies"` and tying `memory_used` to the actual presence of recalled evidence eliminated this.

The second lesson was about the `SecretStr` wrapping in Pydantic. When you load an API key via `BaseSettings`, Pydantic wraps it in `SecretStr` to prevent accidental logging. Passing a `SecretStr` object directly to the OpenAI client causes it to serialize the object to JSON, which produces `{"get_secret_value": ...}` — not a string key. The `unwrap_api_key` function that handles this edge case was the result of debugging a subtle production error.

The third lesson was about the distinction between a tool that retrieves documents and a tool that builds institutional memory. Static document retrieval (searching Confluence) is different from semantic recall over structured experience documents. The structure matters: a postmortem with `failed_approaches` and `warnings` fields produces dramatically different retrieval results than a plain prose writeup, because the structured fields are part of the stored text that Hindsight searches over.

---

*Built for HackWithHyderabad 3.0 · Stack: FastAPI · Hindsight · Meta Muse Spark 1.3 · React · Vite*
