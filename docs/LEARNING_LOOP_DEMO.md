# OpsMind — SRE Learning Loop Judge Demonstration Script

> **Core Value Proposition**:
> *"OpsMind is an AI incident-response agent that remembers how engineering teams solved previous production incidents and uses those experiences to investigate future incidents."*
>
> **The Key Takeaway for Judges**:
> *"The agent did not receive a new model. It received a new memory."*

---

## Demonstration Overview (2–3 Minutes)

| Step | Action | What Judges See | Key Concept |
| :--- | :----- | :-------------- | :---------- |
| **1** | Open Dashboard | Real-time incident counts, active SEV-1 alerts, and persistent Hindsight memory signal. | SRE Console & Memory Bank state. |
| **2** | Open `INC-1127` (payment-api) | Critical outage telemetry: `HTTP 502 responses increased immediately after deployment v2.9.1`. | Production Incident Triage. |
| **3** | Click **"INVESTIGATE WITH OPSMIND"** | Live Hindsight Recall retrieves 4 historical memories (`INC-1042`, `INC-1067`, `INC-1091`, `DECISION-PAYMENT-RESTART`). | Historical Evidence Grounding. |
| **4** | Inspect AI Investigation | Meta Muse Spark 1.3 flags connection pool regression (from `INC-1042`) and **elevates critical warning**: *"Do NOT blindly restart payment-api (INC-1091: caused duplicate charges)"*. | Anti-Pattern Prevention. |
| **5** | Click **"RESOLVE INCIDENT"** | Professional Postmortem Modal opens with read-only telemetry and structured fields. | Postmortem Capture. |
| **6** | Fill Postmortem & Click **"RETAIN EXPERIENCE"** | Root cause, rollback actions, lessons learned, and critical warnings submitted to `POST /api/incidents/INC-1127/resolve`. | Real Hindsight `client.retain()`. |
| **7** | Observe Visual Signal | **"MEMORY UPDATED • HINDSIGHT ENGINE ACTIVE"** banner appears with verified checklist: `✓ Incident recorded`, `✓ Postmortem retained`, `✓ Engineering memory updated`. Status updates to `RESOLVED`. | Active Organizational Learning. |
| **8** | Inspect Memory Explorer | Click **"Refresh Memory"** — `INC-1127` postmortem immediately appears in the catalog under bank `opsmind-engineering`. | Persistent Knowledge Catalog. |
| **9** | Open "How OpsMind Learns" (Interactive Demo) | Run Phase 3: Simulated future incident `INC-1142` occurs with similar symptoms. | Live Memory Recall. |
| **10** | Verify Recall Result | Live Hindsight Recall retrieves the newly retained postmortem from `opsmind-engineering`. | **Experience Proven Over Time**. |

---

## Detailed Step-by-Step Walkthrough

### Step 1: OpsMind SRE Console
1. Navigate to `http://localhost:3000/`.
2. Highlight the top metric card:
   - **Persistent Memory Bank**: `opsmind-engineering`
   - **Status**: `Connected (Hindsight Engine Active)`
   - **Precedents & Decisions**: Active catalog of lessons learned and operational warnings.

### Step 2: Active Incident Investigation (`INC-1127`)
1. In the **Active Incidents** table, click on `INC-1127` (`payment-api` — *SEV-1 Critical*).
2. Point out:
   - Observed symptoms: `HTTP 502 Bad Gateway responses increased immediately after deployment v2.9.1`.
   - Deployment: `v2.9.1`.
3. Click the primary button: **"INVESTIGATE WITH OPSMIND"**.
4. Point out the **System Execution Trace**:
   - `Current Incident [payment-api]` → `Hindsight Recall` → `Historical Evidence Assembled` → `Meta Muse Spark 1.3` → `Evidence-Grounded Action Plan`.
5. Point out the **Crucial Operational Warning**:
   - Red banner: *"Do NOT execute kubectl rollout restart deployment/payment-api. In past incident INC-1091, an uncoordinated restart severed in-flight transactions and caused $12,400 in duplicate customer charges."*
   - Note to judges: *"A standard LLM would have suggested restarting the pod. OpsMind saved the company from duplicate billing because it remembered INC-1091."*

### Step 3: Resolving the Incident & Retaining the Postmortem
1. Click **"RESOLVE INCIDENT"** in the top action bar (or in the incident panel).
2. The **Resolve Incident & Retain Experience** modal opens:
   - Read-only telemetry: `INC-1127`, `payment-api`, `production`, `SEV-1`, `v2.9.1`.
   - Click **"Pre-fill Suggested Postmortem"** to populate:
     - **Root Cause**: Database connection pool regression (`pool_max` decreased from 50 to 5 in `v2.9.1`).
     - **Resolution**: Rolled back `v2.9.1` to `v2.9.0` and restored `pool_max=50`.
     - **Outcome**: Successful — 502 error rate dropped to 0.0% within 90 seconds.
     - **Lessons Learned**: For `payment-api` 502 errors after deployment, compare connection pool configuration before restarting the service.
     - **Critical Warning**: Do not automatically restart `payment-api`.
3. Click **"RETAIN EXPERIENCE"**.
4. The backend immediately executes `POST /api/incidents/INC-1127/resolve` and calls the official Hindsight SDK `client.retain()`.

### Step 4: Verification of Learning
1. Notice the immediate feedback:
   - Status badge turns green: `RESOLVED`.
   - Incident timeline shows substantiated event: `Postmortem captured & retained in Hindsight`.
   - Glowing purple signal banner appears:
     ```text
     MEMORY UPDATED • HINDSIGHT ENGINE ACTIVE
     OpsMind learned from INC-1127
     ✓ Incident recorded
     ✓ Postmortem retained
     ✓ Engineering memory updated
     ```
2. Click **"View in Memory Explorer"** (or navigate to Memory Explorer):
   - Click **"Refresh Memory"**.
   - Notice the green notification: `New memory available: INC-1127 (payment-api) retained into Hindsight.`
   - Filter by `Incident Postmortems` to show `INC-1127` rendered alongside prior team memories.

### Step 5: The "After" Demonstration (Live Hindsight Recall)
1. Navigate to **"How OpsMind Learns"** in the sidebar.
2. Select **"Live Learning Loop (Interactive)"**.
3. Advance to **Phase 3: After Persistent Memory**:
   - A similar future incident occurs: *"orders-worker queue backlog growing rapidly after promotional batch run."*
   - Click **"RECALL FROM HINDSIGHT"**.
4. Live query executes against Hindsight Cloud bank `opsmind-engineering`:
   - Returns the exact retained experience live over HTTP.
   - Shows memory impact:
     - **Before**: 0 relevant historical experiences.
     - **After**: Newly relevant experiences retrieved live.

---

## Concluding Statement for Judges

> *"In traditional SRE organizations, postmortems are PDFs that sit in Google Drive and are forgotten until the same disaster strikes again.*
>
> *With OpsMind and Hindsight, every incident solved becomes a permanent, queryable memory.*
>
> *When future engineers face a 3 AM production outage, OpsMind ensures the team never repeats the same mistake twice.*
>
> **The agent did not receive a new model. It received a new memory.**"
