/**
 * Report Controller
 */
const { Reports, WorkOrders, Feedback, Detections, Scores } = require("../models");
const { apiError } = require("../utils/errors");
function createReport(req, res) {
  const { media_url, media_type, gps, address, description } = req.body || {};
  if (!media_url || !media_type || !gps || gps.lat == null || gps.lng == null) return apiError(res, 400, "VALIDATION_ERROR", "media_url, media_type, and gps {lat, lng} are required");
  res.status(201).json(Reports.create({ citizen_id: req.user.id, media_url, media_type, gps, address, description }));
}
function listReports(req, res) {
  let scoped;
  if (req.user.role === "citizen") scoped = Reports.findByCitizen(req.user.id);
  else if (req.user.role === "authority" || req.user.role === "admin") scoped = Reports.all();
  else if (req.user.role === "crew") scoped = Reports.findByAssignedCrew(req.user.id);
  else scoped = [];
  res.json({ data: scoped, page: 1, page_size: scoped.length, total: scoped.length });
}
function getReport(req, res) {
  const report = Reports.findById(req.params.id);
  if (!report) return apiError(res, 404, "NOT_FOUND", "Report not found");
  const canView = req.user.role === "authority" || req.user.role === "admin" || (req.user.role === "citizen" && report.citizen_id === req.user.id) || (req.user.role === "crew" && WorkOrders.findByReport(report.id)?.assigned_crew_id === req.user.id);
  if (!canView) return apiError(res, 403, "FORBIDDEN", "Not allowed to view this report");
  const detection = Detections.findByReport(report.id)[0] || null;
  const score = detection ? Scores.findByDetection(detection.id) : null;
  const workOrder = WorkOrders.findByReport(report.id) || null;
  res.json({ ...report, detection, score, work_order: workOrder });
}
function getStatus(req, res) { const report = Reports.findById(req.params.id); if (!report) return apiError(res, 404, "NOT_FOUND", "Report not found"); if (req.user.role === "citizen" && report.citizen_id !== req.user.id) return apiError(res, 403, "FORBIDDEN", "Not your report"); res.json({ id: report.id, status: report.status, updated_at: new Date().toISOString() }); }
function submitFeedback(req, res) {
  const report = Reports.findById(req.params.id);
  if (!report) return apiError(res, 404, "NOT_FOUND", "Report not found");
  if (report.citizen_id !== req.user.id) return apiError(res, 403, "FORBIDDEN", "Not your report");
  if (report.status !== "verified") return apiError(res, 409, "INVALID_STATE_TRANSITION", "Feedback only allowed once status is 'verified'");
  const { rating, comment } = req.body || {};
  if (!rating || ![1, 2, 3, 4, 5].includes(rating)) return apiError(res, 400, "VALIDATION_ERROR", "rating must be 1-5");
  if (Feedback.findByReport(report.id)) return apiError(res, 409, "VALIDATION_ERROR", "Feedback already submitted");
  res.status(201).json(Feedback.create({ report_id: report.id, citizen_id: req.user.id, rating, comment }));
}
module.exports = { createReport, listReports, getReport, getStatus, submitFeedback };
