/**
 * AI Detection Controller
 */
const { Reports, Detections, Scores, WorkOrders } = require("../models");
const { apiError } = require("../utils/errors");
const { runDetection } = require("../services/aiClient");
const { scoreReport } = require("../services/scoring");
const { createWorkOrder } = require("../services/workorder");
const { notify } = require("../services/notification");
async function analyzeReport(req, res) {
  const report = Reports.findById(req.params.id);
  if (!report) return apiError(res, 404, "NOT_FOUND", "Report not found");
  if (report.status !== "reported") return apiError(res, 409, "INVALID_STATE_TRANSITION", `Report already analyzed (status: ${report.status})`);
  try {
    const detectionResult = await runDetection(report.media_url);
    const detection = Detections.create({ report_id: report.id, damage_type: detectionResult.damage_type, confidence: detectionResult.confidence, bounding_box: detectionResult.bounding_box, evidence_image_url: report.media_url, frame_timestamp_seconds: null });
    const score = await scoreReport(report.id, {});
    const workOrder = await createWorkOrder(report.id, score.id);
    notify("new_scored_issue", { report_id: report.id, work_order_id: workOrder.id, urgency_score: score.urgency_score, location: workOrder.location }, "authority");
    res.json({ report_id: report.id, detection, score, work_order: workOrder, status: "scored" });
  } catch (err) { console.error("[ANALYZE ERROR]", err); return apiError(res, 500, "ANALYSIS_FAILED", err.message); }
}
function getDetections(req, res) { const report = Reports.findById(req.params.id); if (!report) return apiError(res, 404, "NOT_FOUND", "Report not found"); res.json({ data: Detections.findByReport(report.id) }); }
function getScore(req, res) { const report = Reports.findById(req.params.id); if (!report) return apiError(res, 404, "NOT_FOUND", "Report not found"); const detection = Detections.findByReport(report.id)[0]; if (!detection) return apiError(res, 404, "NOT_FOUND", "No detection/score yet"); res.json(Scores.findByDetection(detection.id) || null); }
module.exports = { analyzeReport, getDetections, getScore };
