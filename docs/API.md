# SentriRoad — API Reference

The full API specification is in `docs/API_SPEC.md`. This document summarizes the complete endpoint list.

All endpoints are prefixed with `/api/v1`.

## Auth
| Method | Endpoint | Who | Purpose |
|---|---|---|---|
| POST | `/auth/signup` | anyone | Create account |
| POST | `/auth/login` | anyone | Login (password: `demo`) |
| GET | `/auth/me` | logged-in | Current user profile |

## Uploads
| Method | Endpoint | Who | Purpose |
|---|---|---|---|
| POST | `/uploads/signed-url` | citizen, crew | Get signed upload URL |

## Reports
| Method | Endpoint | Who | Purpose |
|---|---|---|---|
| POST | `/reports` | citizen | Create damage report |
| GET | `/reports` | all (scoped by role) | List reports |
| GET | `/reports/:id` | owner, authority, crew | Report detail + detection + score + work order |
| GET | `/reports/:id/status` | owner | Lightweight status poll |
| POST | `/reports/:id/feedback` | owner citizen | 1-5 star rating (verified only) |

## AI Pipeline
| Method | Endpoint | Who | Purpose |
|---|---|---|---|
| POST | `/reports/:id/analyze` | authority, admin | Run detection + scoring + work order |
| GET | `/reports/:id/detections` | authority, owner | Detection results |
| GET | `/reports/:id/score` | authority, owner | Urgency score + factor breakdown |

## Work Orders
| Method | Endpoint | Who | Purpose |
|---|---|---|---|
| GET | `/workorders` | authority (all), crew (own) | Priority list (supports `?sort=urgency`, `?status=`, `?overdue=true`) |
| GET | `/workorders/:id` | authority, crew | Work order detail |
| GET | `/workorders/:id/pdf` | authority | Download PDF |
| PATCH | `/workorders/:id/dispatch` | authority | scored -> dispatched |
| PATCH | `/workorders/:id/assign-crew` | authority | dispatched -> assigned_to_crew |
| POST | `/workorders/:id/submit-repair` | crew | assigned -> crew_submitted |
| PATCH | `/workorders/:id/review` | authority | Approve -> verified / Reject -> back to crew |
| GET | `/workorders/:id/verification` | authority, owner | Before/after images |

## Metrics
| Method | Endpoint | Who | Purpose |
|---|---|---|---|
| GET | `/metrics/summary` | authority | Aggregate dashboard metrics |

## Alerts
| Method | Endpoint | Who | Purpose |
|---|---|---|---|
| GET | `/alerts` | authority | List critical alerts |
| GET | `/alerts/:id` | authority | Alert detail |

## Zones & Drone
| Method | Endpoint | Who | Purpose |
|---|---|---|---|
| GET | `/zones/priority` | authority | Priority zones + battery saving |
| POST | `/drone/footage` | authority | Upload drone footage |
| GET | `/routes/optimize` | authority | Optimized crew routes |

## AI Service (Python — Port 5001)
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/detect` | Run YOLO detection |
| POST | `/score` | Compute priority score |
| POST | `/recommend` | Generate repair recommendation |
| POST | `/optimize-routes` | Optimize crew routes |

## Error Format
```json
{ "error": { "code": "NOT_FOUND", "message": "Work order not found" } }
```
