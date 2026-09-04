/**
 * Work Order Controller
 */
const { WorkOrders, Reports, Users, Verifications, Scores, Detections } = require("../models");
const { apiError } = require("../utils/errors");
const { notify } = require("../services/notification");
function attachContext(wo) { const report = Reports.findById(wo.report_id); const score = Scores.findById(wo.score_id); const detection = score ? Detections.findById(score.detection_id) : null; return { ...wo, report, score, detection }; }
function listWorkOrders(req, res) {
  let scoped;
  if (req.user.role === "authority" || req.user.role === "admin") scoped = WorkOrders.all();
  else if (req.user.role === "crew") scoped = WorkOrders.findByCrew(req.user.id);
  else return apiError(res, 403, "FORBIDDEN", "Citizens should use /reports");
  if (req.query.status) scoped = scoped.filter((w) => w.status === req.query.status);
  if (req.query.overdue === "true") scoped = scoped.filter((w) => new Date(w.sla_deadline) < new Date() && w.status !== "verified");
  if (req.query.sort === "urgency") scoped = [...scoped].sort((a, b) => b.urgency_score - a.urgency_score);
  res.json({ data: scoped.map(attachContext), page: 1, page_size: scoped.length, total: scoped.length });
}
function getWorkOrder(req, res) { const wo = WorkOrders.findById(req.params.id); if (!wo) return apiError(res, 404, "NOT_FOUND", "Work order not found"); res.json(attachContext(wo)); }
function getPdf(req, res) {
  const wo = WorkOrders.findById(req.params.id); if (!wo) return apiError(res, 404, "NOT_FOUND", "Work order not found");
  if (wo.pdf_url && wo.pdf_url.startsWith("data:application/pdf;base64,")) { const base64 = wo.pdf_url.split(",")[1]; const buffer = Buffer.from(base64, "base64"); res.setHeader("Content-Type", "application/pdf"); res.setHeader("Content-Disposition", `attachment; filename="workorder_${wo.id}.pdf"`); return res.send(buffer); }
  res.json({ pdf_url: wo.pdf_url || `https://storage.example.com/workorders/${wo.id}.pdf` });
}
function dispatch(req, res) { const wo = WorkOrders.findById(req.params.id); if (!wo) return apiError(res, 404, "NOT_FOUND", "Work order not found"); if (wo.status !== "scored") return apiError(res, 409, "INVALID_STATE_TRANSITION", `Cannot dispatch from '${wo.status}'`); WorkOrders.update(wo.id, { status: "dispatched" }); notify("status_change", { work_order_id: wo.id, status: "dispatched" }, "citizen"); res.json(attachContext(WorkOrders.findById(wo.id))); }
function assignCrew(req, res) { const wo = WorkOrders.findById(req.params.id); if (!wo) return apiError(res, 404, "NOT_FOUND", "Work order not found"); const { crew_id } = req.body || {}; if (!crew_id) return apiError(res, 400, "VALIDATION_ERROR", "crew_id is required"); const crewUser = Users.findById(crew_id); if (!crewUser || crewUser.role !== "crew") return apiError(res, 400, "VALIDATION_ERROR", "Invalid crew_id"); WorkOrders.update(wo.id, { assigned_crew_id: crew_id, status: "assigned_to_crew" }); notify("work_order_assigned", { work_order_id: wo.id, crew_id }, "crew"); res.json(attachContext(WorkOrders.findById(wo.id))); }
function submitRepair(req, res) { const wo = WorkOrders.findById(req.params.id); if (!wo) return apiError(res, 404, "NOT_FOUND", "Work order not found"); if (wo.assigned_crew_id !== req.user.id) return apiError(res, 403, "FORBIDDEN", "Not assigned to you"); if (wo.status !== "assigned_to_crew") return apiError(res, 409, "INVALID_STATE_TRANSITION", `Cannot submit from '${wo.status}'`); const { after_photo_url, notes } = req.body || {}; if (!after_photo_url) return apiError(res, 400, "VALIDATION_ERROR", "after_photo_url is required"); WorkOrders.update(wo.id, { crew_photo_url: after_photo_url, crew_submitted_at: new Date().toISOString(), review_status: "pending", status: "crew_submitted", crew_notes: notes || null }); notify("repair_submitted", { work_order_id: wo.id }, "authority"); res.json(attachContext(WorkOrders.findById(wo.id))); }
function review(req, res) {
  const wo = WorkOrders.findById(req.params.id); if (!wo) return apiError(res, 404, "NOT_FOUND", "Work order not found");
  if (wo.status !== "crew_submitted" && wo.status !== "reviewing") return apiError(res, 409, "INVALID_STATE_TRANSITION", `Cannot review from '${wo.status}'`);
  const { decision, rejection_reason } = req.body || {};
  if (!["approved", "rejected"].includes(decision)) return apiError(res, 400, "VALIDATION_ERROR", "decision must be approved or rejected");
  const updates = { reviewed_by: req.user.id, reviewed_at: new Date().toISOString() };
  if (decision === "approved") {
    updates.review_status = "approved"; updates.status = "verified";
    WorkOrders.update(wo.id, updates);
    Verifications.create({ work_order_id: wo.id, before_image: wo.evidence_image_url, after_image: wo.crew_photo_url, verified_by: req.user.id });
    Reports.updateStatus(wo.report_id, "verified");
    notify("repair_verified", { work_order_id: wo.id, report_id: wo.report_id }, "citizen");
  } else {
    if (!rejection_reason) return apiError(res, 400, "VALIDATION_ERROR", "rejection_reason required");
    updates.review_status = "rejected"; updates.rejection_reason = rejection_reason; updates.status = "assigned_to_crew"; updates.crew_photo_url = null; updates.crew_submitted_at = null;
    WorkOrders.update(wo.id, updates);
    notify("repair_rejected", { work_order_id: wo.id, rejection_reason }, "crew");
  }
  res.json(attachContext(WorkOrders.findById(wo.id)));
}
function getVerification(req, res) { const v = Verifications.findByWorkOrder(req.params.id); if (!v) return apiError(res, 404, "NOT_FOUND", "No verification yet"); res.json(v); }
module.exports = { listWorkOrders, getWorkOrder, getPdf, dispatch, assignCrew, submitRepair, review, getVerification };
