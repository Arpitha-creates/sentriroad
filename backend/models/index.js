/**
 * Model helpers — thin wrappers around in-memory db arrays.
 */
const { v4: uuidv4 } = require("uuid");
const db = require("./db");
function nowIso() { return new Date().toISOString(); }
function genId(prefix) { return `${prefix}_${uuidv4().split("-")[0]}`; }
const Users = {
  findByEmail(email) { return db.users.find((u) => u.email === email) || null; },
  findById(id) { return db.users.find((u) => u.id === id) || null; },
  findByRole(role) { return db.users.filter((u) => u.role === role); },
  create({ name, email, phone, role }) { const u = { id: genId("u"), name, email, phone: phone || null, role, created_at: nowIso() }; db.users.push(u); return u; },
};
const Reports = {
  all() { return [...db.reports]; },
  findById(id) { return db.reports.find((r) => r.id === id) || null; },
  findByCitizen(cid) { return db.reports.filter((r) => r.citizen_id === cid); },
  findByAssignedCrew(crewId) { const ids = db.workorders.filter((w) => w.assigned_crew_id === crewId).map((w) => w.report_id); return db.reports.filter((r) => ids.includes(r.id)); },
  create(data) { const r = { id: genId("r"), citizen_id: data.citizen_id, media_url: data.media_url, media_type: data.media_type, gps: data.gps, address: data.address || null, description: data.description || null, status: "reported", created_at: nowIso() }; db.reports.push(r); return r; },
  updateStatus(rid, status) { const r = db.reports.find((r) => r.id === rid); if (r) r.status = status; return r; },
};
const Detections = {
  findByReport(rid) { return db.detections.filter((d) => d.report_id === rid); },
  findById(id) { return db.detections.find((d) => d.id === id) || null; },
  create(data) { const d = { id: genId("d"), report_id: data.report_id, damage_type: data.damage_type, confidence: data.confidence, bounding_box: data.bounding_box, evidence_image_url: data.evidence_image_url, frame_timestamp_seconds: data.frame_timestamp_seconds || null, created_at: nowIso() }; db.detections.push(d); return d; },
};
const Scores = {
  findByDetection(did) { return db.scores.find((s) => s.detection_id === did) || null; },
  findById(id) { return db.scores.find((s) => s.id === id) || null; },
  create(data) { const s = { id: genId("s"), detection_id: data.detection_id, urgency_score: data.urgency_score, factor_breakdown: data.factor_breakdown, computed_at: nowIso() }; db.scores.push(s); return s; },
};
const WorkOrders = {
  all() { return [...db.workorders]; },
  findById(id) { return db.workorders.find((w) => w.id === id) || null; },
  findByReport(rid) { return db.workorders.find((w) => w.report_id === rid) || null; },
  findByCrew(cid) { return db.workorders.filter((w) => w.assigned_crew_id === cid); },
  create(data) { const w = { id: genId("w"), report_id: data.report_id, score_id: data.score_id, location: data.location, evidence_image_url: data.evidence_image_url, damage_type: data.damage_type, urgency_score: data.urgency_score, cost_estimate: data.cost_estimate, sla_deadline: data.sla_deadline, status: "scored", assigned_crew_id: null, crew_submitted_at: null, crew_photo_url: null, review_status: null, reviewed_by: null, reviewed_at: null, rejection_reason: null, pdf_url: null, created_at: nowIso(), updated_at: nowIso() }; db.workorders.push(w); return w; },
  update(id, patch) { const w = db.workorders.find((w) => w.id === id); if (w) { Object.assign(w, patch, { updated_at: nowIso() }); return w; } return null; },
};
const Verifications = {
  findByWorkOrder(woid) { return db.verifications.find((v) => v.work_order_id === woid) || null; },
  create(data) { const v = { id: genId("v"), work_order_id: data.work_order_id, before_image: data.before_image, after_image: data.after_image, verified_by: data.verified_by, verified_at: nowIso() }; db.verifications.push(v); return v; },
};
const Feedback = {
  findByReport(rid) { return db.feedback.find((f) => f.report_id === rid) || null; },
  create(data) { const f = { id: genId("f"), report_id: data.report_id, citizen_id: data.citizen_id, rating: data.rating, comment: data.comment || null, created_at: nowIso() }; db.feedback.push(f); return f; },
};
module.exports = { Users, Reports, Detections, Scores, WorkOrders, Verifications, Feedback, genId, nowIso };
