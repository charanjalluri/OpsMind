# OpsMind SRE Console Frontend

Modern dark-mode SRE Incident Console and Dashboard built with React, TypeScript, Vite, and Tailwind CSS on top of the OpsMind persistent memory backend (FastAPI + Hindsight + Meta Muse Spark 1.3).

---

## Features

* **SRE Operations Dashboard**: Real-time metrics on active incidents, critical incidents, indexed postmortems, and cumulative persistent engineering memories.
* **Hindsight Memory Signal**: Prominently communicates active Hindsight bank connectivity, recent memory retention events, and past experience counts.
* **3-Column Incident Investigation**:
  * **Current Incident Panel**: Telemetry, deployment versions, observable symptoms, and one-click OpsMind investigation trigger.
  * **AI Investigation Analysis**: Structured Meta Muse Spark 1.3 reasoning displaying likelihood root causes, prioritized SRE action steps, and critical operational cautions.
  * **Hindsight Persistent Memory**: Highlights recalled empirical evidence (past postmortems, rollback precedents, and engineering policy decisions) with explicit source citations.
* **Memory Explorer**: Search Hindsight persistent memory in real time, view categorized experience cards, and inspect the decision topology graph.
* **How OpsMind Learns (Demo)**: Side-by-side comparison demonstrating how persistent memory eliminates dangerous operational blind spots (such as uncoordinated service restarts).

---

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

By default, the Vite dev server runs at `http://localhost:3000` with an automatic proxy forwarding `/api` and `/health` requests to `http://127.0.0.1:8000`.
