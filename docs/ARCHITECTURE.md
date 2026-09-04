# SentriRoad — Architecture

## High-Level Flow
```
Input (Drone / Phone / Citizen)
  -> AI Detection (YOLOv8n / Mock)
  -> Priority Scoring (5+1 factors, 0-100)
  -> Repair Recommendation (category, kit, cost, duration)
  -> Work Order (PDF, cost, SLA)
  -> Critical Escalation (if score >= 80)
  -> Notification (Socket.IO real-time)
  -> Repair (Crew + SLA tracking)
  -> Verification (before/after images)
  -> Citizen Feedback (1-5 stars)
  -> Loops back via updated priority zones and RL routing
```

## Services
1. **Backend (Node.js/Express — Port 4000):** REST API, JWT auth, Socket.IO, PDFKit, in-memory store seeded from fixture data
2. **AI Service (Python/Flask — Port 5001):** YOLOv8n detection (mock mode), 5+1 factor scoring, recommendation engine, route optimization
3. **Frontend (React/Vite — Port 3000):** Citizen, Authority, Crew, Drone dashboards + Demo Mode
4. **Mock Server (Port 4000/4001):** Original Express mock, same fixture data and API contract

## Data Model
| Entity | Key Fields |
|---|---|
| User | id, name, email, phone, role, created_at |
| Report | id, citizen_id, media_url, gps, status, created_at |
| Detection | id, report_id, damage_type, confidence, bounding_box |
| Score | id, detection_id, urgency_score, factor_breakdown |
| WorkOrder | id, report_id, score_id, location, cost_estimate, sla_deadline, status |
| Verification | id, work_order_id, before_image, after_image |
| Feedback | id, report_id, citizen_id, rating, comment |
| Alert | id, work_order_id, priority_score, message, status |

## Scaling Path
In-memory store is MongoDB/Supabase-ready. Replace array operations in model files with Mongoose calls — controllers don't change.
