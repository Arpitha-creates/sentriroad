/**
 * Work Order Generation Service
 */
const config = require("../config");
const { WorkOrders, Scores, Detections, Reports } = require("../models");
const { generateRecommendation } = require("./recommendation");
const { generateWorkOrderPdf } = require("./pdf");
const { escalateIfCritical } = require("./escalation");
async function createWorkOrder(reportId, scoreId) {
  const report = Reports.findById(reportId); if (!report) throw new Error("Report not found");
  const score = Scores.findById(scoreId); if (!score) throw new Error("Score not found");
  const detection = Detections.findById(score.detection_id); if (!detection) throw new Error("Detection not found");
  const recommendation = generateRecommendation({ damage_type: detection.damage_type, confidence: detection.confidence, urgency_score: score.urgency_score, factor_breakdown: score.factor_breakdown });
  const costEstimate = Math.round((recommendation.estimated_cost_low_inr + recommendation.estimated_cost_high_inr) / 2);
  const slaHours = score.urgency_score >= config.scoring.criticalThreshold ? Math.round(config.sla.defaultHours / 2) : config.sla.defaultHours;
  const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000).toISOString();
  const wo = WorkOrders.create({ report_id: reportId, score_id: scoreId, location: { address: report.address || `(${report.gps.lat}, ${report.gps.lng})`, gps: report.gps }, evidence_image_url: detection.evidence_image_url, damage_type: detection.damage_type, urgency_score: score.urgency_score, cost_estimate: costEstimate, sla_deadline: slaDeadline });
  wo.recommendation = recommendation;
  try { const pdfBuffer = await generateWorkOrderPdf(wo, recommendation, score, detection, report); wo.pdf_url = `data:application/pdf;base64,${pdfBuffer.toString("base64")}`; } catch (err) { console.error("PDF generation failed:", err.message); wo.pdf_url = null; }
  await escalateIfCritical(wo, score, report);
  return wo;
}
module.exports = { createWorkOrder };
