# Sentriroad — API Specification (v1)

**One API, three frontends.** Citizen, Authority, and Crew dashboards all call the same endpoints.

All endpoints are prefixed with `/api/v1`. All request/response bodies match the shapes in `types/index.ts`.

## Auth
| Method | Endpoint | Who | Purpose |
|---|---|---|---|
| POST | `/auth/signup` | anyone | Create account |
| POST | `/auth/login` | anyone | Returns token + user |
| GET | `/auth/me` | any logged-in user | Current user profile |

## Uploads
| Method | Endpoint | Who | Purpose |
|---|---|---|---|
| POST | `/uploads/signed-url` | citizen, crew, admin | Signed upload URL |

## Reports
| Method | Endpoint | Who | Purpose |
|---|---|---|---|
| POST | `/reports` | citizen | Create a new report |
| GET | `/reports` | citizen (own), authority (all), crew (assigned) | List reports |
| GET | `/reports/:id` | owner, authority, assigned crew | Full report detail |
| GET | `/reports/:id/status` | owner citizen | Lightweight status poll |
| POST | `/reports/:id/feedback` | owner citizen | Only when status = `verified` |

## Detections & Scores
| Method | Endpoint | Who | Purpose |
|---|---|---|---|
| GET | `/reports/:id/detections` | authority, owner | Detection results |
| GET | `/reports/:id/score` | authority, owner | Urgency score + factor breakdown |

## Work Orders
| Method | Endpoint | Who | Purpose |
|---|---|---|---|
| GET | `/workorders` | authority (all), crew (assigned) | Priority list |
| GET | `/workorders/:id` | authority, crew | Full detail |
| GET | `/workorders/:id/pdf` | authority | Returns generated PDF |
| PATCH | `/workorders/:id/dispatch` | authority | scored -> dispatched |
| PATCH | `/workorders/:id/assign-crew` | authority | -> assigned_to_crew |
| POST | `/workorders/:id/submit-repair` | crew | -> crew_submitted |
| PATCH | `/workorders/:id/review` | authority | approved -> verified / rejected -> back to crew |
| GET | `/workorders/:id/verification` | authority, owner | Before/after images |

## Metrics
| Method | Endpoint | Who | Purpose |
|---|---|---|---|
| GET | `/metrics/summary` | authority | Returns MetricsSummary |

## Zones / Drone
| Method | Endpoint | Who | Purpose |
|---|---|---|---|
| GET | `/zones/priority` | authority | RL-recommended zones + battery savings |
| POST | `/drone/footage` | drone operator | Upload drone footage |

## Status flow
```
reported -> scored -> dispatched -> assigned_to_crew -> crew_submitted
   -> reviewing -> [approved: repaired -> verified]
              -> [rejected: back to assigned_to_crew]
```

## Error format
```json
{ "error": { "code": "NOT_FOUND", "message": "Work order not found" } }
```
