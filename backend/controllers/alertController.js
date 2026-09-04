/**
 * Alert Controller
 */
const { getAlerts, getAlert } = require("../services/escalation");
function listAlerts(req, res) { const alerts = getAlerts(); res.json({ data: alerts, total: alerts.length }); }
function getAlertById(req, res) { const alert = getAlert(req.params.id); if (!alert) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Alert not found" } }); res.json(alert); }
module.exports = { listAlerts, getAlertById };
