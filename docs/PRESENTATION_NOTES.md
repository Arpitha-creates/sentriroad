# SentriRoad — Presentation Notes for Judges

## What problem are we solving?
Road damage causes accidents, vehicle damage, and economic loss. Current systems rely on manual inspection and reactive maintenance. There is no closed loop connecting detection, prioritization, dispatch, repair, verification, and feedback.

## Why AI?
Manual inspection is slow, subjective, and expensive. AI enables automated detection, consistent scoring, explainable prioritization, and scalability.

## How is priority calculated?
A transparent 5+1 factor model:
```
Score = 0.40 x Severity + 0.20 x Traffic + 0.10 x Rainfall
      + 0.10 x RoadImportance + 0.10 x SensitiveLocation + 0.10 x CitizenComplaints
```
Every score shows its full breakdown. Weights are configurable via environment variables.

Classification: 0-29 LOW, 30-59 MEDIUM, 60-79 HIGH, 80-100 CRITICAL.

## Critical Escalation
Score >= 80 triggers: authority alert, Socket.IO real-time push, shorter SLA (24h vs 48h).

## Key Differentiators
1. Transparency — every score shows its factor breakdown
2. Honesty — mock data clearly labeled
3. Closed loop — end-to-end from detection to feedback
4. Configurable — weights change via env vars
5. Demo-ready — one-click walkthrough

## Limitations (honestly stated)
- Mock inference (no trained model)
- No real SMS/email
- No live government API
- No fabricated accident reduction statistics
- Cost estimates are prototype values
- In-memory database resets on restart
