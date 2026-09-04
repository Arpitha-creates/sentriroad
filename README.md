# SentriRoad — AI Road Inspector

**Closed-Loop AI System for Road Infrastructure Safety**

SentriRoad detects road damage (potholes and cracks) from images, computes a transparent priority score, generates repair recommendations and work orders, escalates critical cases to authorities, and tracks repairs through to verification — all in one closed loop.

Built for **DECODE SIH 2026 — Bharat Nirman PS2**.

---

## Quick Start

### Option 1: Run all services (recommended)

```bash
# Terminal 1 — AI Service
cd ai-service
pip install -r requirements.txt
python app.py

# Terminal 2 — Backend
cd backend
copy .env.example .env
npm install
npm run dev

# Terminal 3 — Frontend
cd frontend
copy .env.example .env
npm install
npm run dev
```

Then open http://localhost:3000

### Option 2: Docker Compose

```bash
docker compose up --build
```

Frontend: http://localhost:3000 · Backend: http://localhost:4000 · AI: http://localhost:5001

### Option 3: Mock server only (for frontend dev)

```bash
cd mock-server
npm install
npm start
```

---

## Demo Login Accounts

| Email | Role | Notes |
|---|---|---|
| ravi@example.com | citizen | Has 3 reports |
| anjali@example.com | citizen | Has 2 reports |
| suresh.authority@bbmp.gov.in | authority | Sees all work orders |
| ramesh.crew@bbmp.gov.in | crew | 2 assigned work orders |
| manju.crew@bbmp.gov.in | crew | 1 assigned work order |

Password for all accounts: `demo`

---

## Features

### Implemented

- **AI Detection** — YOLOv8n interface with mock inference fallback (clearly labeled as DEMO)
- **Priority Scoring** — 5+1 factor model (severity 40%, traffic 20%, rainfall 10%, road importance 10%, sensitive location 10%, citizen complaints 10%)
- **Repair Recommendations** — Category, kit, crew size, duration, cost range, explanation
- **Work Order Generation** — Auto-created PDF with location, image, cost, urgency, SLA
- **Critical Escalation** — Priority >=80 triggers authority alert + Socket.IO real-time push
- **Citizen Dashboard** — Upload, track status, feedback (1-5 stars)
- **Authority Dashboard** — GIS map (Leaflet), priority list, work order PDF, metrics, critical alerts
- **Crew Dashboard** — Assigned work orders, submit after-repair photos, rejection handling
- **Drone Dashboard** — Priority zones, route map, footage upload, battery saving estimates
- **Route Optimization** — Nearest-neighbor heuristic (Optimization Prototype, RL-ready)
- **Role-Based Access** — JWT auth, citizen/authority/crew/admin roles
- **Demo Mode** — One-click full closed-loop walkthrough
- **Socket.IO** — Real-time critical alerts and status changes

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router, Leaflet, Recharts, Lucide Icons |
| Backend | Node.js, Express, Socket.IO, JWT, PDFKit |
| AI/ML | Python, Flask, YOLOv8n (interface), NumPy |
| Database | In-memory (prototype) — MongoDB/Supabase ready |
| Deployment | Docker, Docker Compose, nginx |
| Map | OpenStreetMap + Leaflet |

---

## Priority Scoring Formula

```
Priority Score =
  0.40 x Severity
+ 0.20 x Traffic
+ 0.10 x Rainfall
+ 0.10 x RoadImportance
+ 0.10 x SensitiveLocation
+ 0.10 x CitizenComplaints
```

All inputs normalized to 0-100. Weights are configurable in backend/config/index.js or via environment variables.

| Range | Classification |
|---|---|
| 80-100 | CRITICAL |
| 60-79 | HIGH |
| 30-59 | MEDIUM |
| 0-29 | LOW |

---

## Running Tests

```bash
cd backend
node tests/logic_test.js
```

---

## Limitations

- In-memory database (resets on restart) — MongoDB-ready schema
- Mock YOLO inference (no trained model included) — clearly labeled as DEMO
- No real SMS/email notifications (Socket.IO + console logging only)
- No live BBMP/municipal integration
- Route optimization is deterministic, not RL-based
- No accident reduction statistics (clearly stated, not fabricated)

---

## Team: Code Crusaders

- Person 1 — Backend & Integration
- Person 2 — AI/ML Engineer
- Person 3 — Citizen Dashboard
- Person 4 — Authority & Drone Dashboards
- Person 5 — DevOps, QA & Documentation
