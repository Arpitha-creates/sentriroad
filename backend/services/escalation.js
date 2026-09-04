/**
 * Critical Escalation Service
 */
const { classify } = require("./scoring");
let alerts = [];
function getAlerts() { return [...alerts]; }
function getAlert(id) { return alerts.find((a) => a.id === id) || null; }
async function escalateIfCritical(workOrder, score, report, io = null) {
  const level = classify(score.urgency_score);
  if (level !== "CRITICAL") return null;
  const alert = { id: `alert_${workOrder.id}`, work_order_id: workOrder.id, report_id: report.id, pothole_id: report.id, priority_score: score.urgency_score, priority_level: level, location: workOrder.location, damage_type: workOrder.damage_type, message: `CRITICAL ROAD HAZARD\nPothole ${report.id}\nPriority: ${score.urgency_score}/100\nLocation: ${workOrder.location.address}\nImmediate attention recommended.`, created_at: new Date().toISOString(), status: "active" };
  alerts.push(alert);
  if (io) io.to("authority").emit("critical_alert", alert);
  console.log(`[ESCALATION] Critical alert created for ${report.id} (score: ${score.urgency_score})`);
  return alert;
}
module.exports = { escalateIfCritical, getAlerts, getAlert };
