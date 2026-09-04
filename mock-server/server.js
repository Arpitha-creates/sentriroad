/**
 * SENTRIROAD MOCK API SERVER
 * A real, running Express server that implements the full API_SPEC.md
 * contract against in-memory fixture data.
 */
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const users = require("./data/users.json");
let reports = require("./data/reports.json");
let detections = require("./data/detections.json");
let scores = require("./data/scores.json");
let workorders = require("./data/workorders.json");
let verifications = require("./data/verifications.json");
let feedback = require("./data/feedback.json");
const app = express();
app.use(cors());
app.use(express.json());
const PORT = 4000;
const PREFIX = "/api/v1";
function genId(prefix) { return `${prefix}_${crypto.randomBytes(4).toString("hex")}`; }
function nowIso() { return new Date().toISOString(); }
function encodeToken(userId) { return Buffer.from(userId).toString("base64"); }
function decodeToken(token) { try { return Buffer.from(token, "base64").toString("utf8"); } catch { return null; } }
function apiError(res, status, code, message) { return res.status(status).json({ error: { code, message } }); }
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return apiError(res, 401, "UNAUTHORIZED", "Missing bearer token");
  const userId = decodeToken(token);
  const user = users.find((u) => u.id === userId);
  if (!user) return apiError(res, 401, "UNAUTHORIZED", "Invalid token");
  req.user = user;
  next();
}
function requireRole(...roles) { return (req, res, next) => { if (!roles.includes(req.user.role)) return apiError(res, 403, "FORBIDDEN", `Requires role: ${roles.join(" or ")}`); next(); }; }
function attachWorkOrderContext(wo) { const report = reports.find((r) => r.id === wo.report_id); const score = scores.find((s) => s.id === wo.score_id); return { ...wo, report, score }; }
app.post(`${PREFIX}/auth/login`, (req, res) => { const { email, role } = req.body || {}; let user = null; if (email) user = users.find((u) => u.email === email); if (!user && role) user = users.find((u) => u.role === role); if (!user) return apiError(res, 401, "UNAUTHORIZED", "No matching mock user found"); res.json({ token: encodeToken(user.id), user }); });
app.get(`${PREFIX}/auth/me`, requireAuth, (req, res) => { res.json(req.user); });
app.post(`${PREFIX}/uploads/signed-url`, requireAuth, (req, res) => { const { filename } = req.body || {}; const path = `mock-uploads/${req.user.id}/${Date.now()}-${filename}`; res.json({ upload_url: `https://mock-storage.example.com/upload?path=${encodeURIComponent(path)}`, file_path: path, public_url_after_upload: `https://picsum.photos/seed/${encodeURIComponent(path)}/800/600`, expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() }); });
app.post(`${PREFIX}/reports`, requireAuth, requireRole("citizen"), (req, res) => { const { media_url, media_type, gps, address, description } = req.body || {}; if (!media_url || !media_type || !gps) return apiError(res, 400, "VALIDATION_ERROR", "media_url, media_type, and gps are required"); const report = { id: genId("r"), citizen_id: req.user.id, media_url, media_type, gps, address: address || null, description: description || null, status: "reported", created_at: nowIso() }; reports.push(report); res.status(201).json(report); });
app.get(`${PREFIX}/reports`, requireAuth, (req, res) => { let scoped; if (req.user.role === "citizen") scoped = reports.filter((r) => r.citizen_id === req.user.id); else if (req.user.role === "authority" || req.user.role === "admin") scoped = reports; else if (req.user.role === "crew") { const ids = workorders.filter((w) => w.assigned_crew_id === req.user.id).map((w) => w.report_id); scoped = reports.filter((r) => ids.includes(r.id)); } else scoped = []; res.json({ data: scoped, page: 1, page_size: scoped.length, total: scoped.length }); });
app.get(`${PREFIX}/reports/:id`, requireAuth, (req, res) => { const report = reports.find((r) => r.id === req.params.id); if (!report) return apiError(res, 404, "NOT_FOUND", "Report not found"); const detection = detections.find((d) => d.report_id === report.id) || null; const score = detection ? scores.find((s) => s.detection_id === detection.id) : null; const workOrder = workorders.find((w) => w.report_id === report.id) || null; res.json({ ...report, detection, score, work_order: workOrder }); });
app.get(`${PREFIX}/reports/:id/status`, requireAuth, (req, res) => { const report = reports.find((r) => r.id === req.params.id); if (!report) return apiError(res, 404, "NOT_FOUND", "Report not found"); res.json({ id: report.id, status: report.status, updated_at: nowIso() }); });
app.get(`${PREFIX}/reports/:id/detections`, requireAuth, (req, res) => { res.json({ data: detections.filter((d) => d.report_id === req.params.id) }); });
app.get(`${PREFIX}/reports/:id/score`, requireAuth, (req, res) => { const detection = detections.find((d) => d.report_id === req.params.id); if (!detection) return apiError(res, 404, "NOT_FOUND", "No detection/score yet"); res.json(scores.find((s) => s.detection_id === detection.id) || null); });
app.get(`${PREFIX}/workorders`, requireAuth, (req, res) => { let scoped; if (req.user.role === "authority" || req.user.role === "admin") scoped = workorders; else if (req.user.role === "crew") scoped = workorders.filter((w) => w.assigned_crew_id === req.user.id); else return apiError(res, 403, "FORBIDDEN", "Citizens should use /reports"); if (req.query.status) scoped = scoped.filter((w) => w.status === req.query.status); if (req.query.sort === "urgency") scoped = [...scoped].sort((a, b) => b.urgency_score - a.urgency_score); res.json({ data: scoped.map(attachWorkOrderContext), page: 1, page_size: scoped.length, total: scoped.length }); });
app.get(`${PREFIX}/workorders/:id`, requireAuth, (req, res) => { const wo = workorders.find((w) => w.id === req.params.id); if (!wo) return apiError(res, 404, "NOT_FOUND", "Work order not found"); res.json(attachWorkOrderContext(wo)); });
app.get(`${PREFIX}/workorders/:id/pdf`, requireAuth, requireRole("authority", "admin"), (req, res) => { const wo = workorders.find((w) => w.id === req.params.id); if (!wo) return apiError(res, 404, "NOT_FOUND", "Work order not found"); res.json({ pdf_url: wo.pdf_url || `https://storage.example.com/workorders/${wo.id}.pdf` }); });
app.patch(`${PREFIX}/workorders/:id/dispatch`, requireAuth, requireRole("authority", "admin"), (req, res) => { const wo = workorders.find((w) => w.id === req.params.id); if (!wo) return apiError(res, 404, "NOT_FOUND", "Work order not found"); wo.status = "dispatched"; wo.updated_at = nowIso(); res.json(attachWorkOrderContext(wo)); });
app.patch(`${PREFIX}/workorders/:id/assign-crew`, requireAuth, requireRole("authority", "admin"), (req, res) => { const wo = workorders.find((w) => w.id === req.params.id); if (!wo) return apiError(res, 404, "NOT_FOUND", "Work order not found"); const { crew_id } = req.body || {}; wo.assigned_crew_id = crew_id; wo.status = "assigned_to_crew"; wo.updated_at = nowIso(); res.json(attachWorkOrderContext(wo)); });
app.post(`${PREFIX}/workorders/:id/submit-repair`, requireAuth, requireRole("crew"), (req, res) => { const wo = workorders.find((w) => w.id === req.params.id); if (!wo) return apiError(res, 404, "NOT_FOUND", "Work order not found"); const { after_photo_url } = req.body || {}; wo.crew_photo_url = after_photo_url; wo.crew_submitted_at = nowIso(); wo.review_status = "pending"; wo.status = "crew_submitted"; wo.updated_at = nowIso(); res.json(attachWorkOrderContext(wo)); });
app.patch(`${PREFIX}/workorders/:id/review`, requireAuth, requireRole("authority", "admin"), (req, res) => { const wo = workorders.find((w) => w.id === req.params.id); if (!wo) return apiError(res, 404, "NOT_FOUND", "Work order not found"); const { decision, rejection_reason } = req.body || {}; if (decision === "approved") { wo.review_status = "approved"; wo.status = "verified"; wo.reviewed_by = req.user.id; wo.reviewed_at = nowIso(); const report = reports.find((r) => r.id === wo.report_id); if (report) report.status = "verified"; } else { wo.review_status = "rejected"; wo.rejection_reason = rejection_reason; wo.status = "assigned_to_crew"; wo.crew_photo_url = null; } wo.updated_at = nowIso(); res.json(attachWorkOrderContext(wo)); });
app.get(`${PREFIX}/metrics/summary`, requireAuth, requireRole("authority", "admin"), (req, res) => { const open = workorders.filter((w) => w.status !== "verified").length; const overdue = workorders.filter((w) => w.status !== "verified" && new Date(w.sla_deadline) < new Date()).length; const verifiedCount = workorders.filter((w) => w.status === "verified").length; res.json({ cost_avoided_inr: 28000000, riders_protected_monthly: 12400, percent_repairs_verified: workorders.length ? Math.round((verifiedCount / workorders.length) * 100) : 0, open_issues: open, overdue_sla_count: overdue }); });
app.get(`${PREFIX}/zones/priority`, requireAuth, requireRole("authority", "admin"), (req, res) => { res.json({ data: [{ id: "z_1", name: "Ward 12 - Outer Ring Road belt", priority: "high", estimated_battery_saving_pct: 35 }, { id: "z_2", name: "Ward 14 - Whitefield stretch", priority: "medium", estimated_battery_saving_pct: 22 }], note: "Static stub for MVP demo" }); });
app.get("/", (req, res) => { res.json({ status: "ok", message: "Sentriroad mock API running", prefix: PREFIX }); });
app.listen(PORT, () => { console.log(`\n  Sentriroad mock API running -> http://localhost:${PORT}${PREFIX}\n`); });
