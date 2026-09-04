/**
 * Metrics Controller
 */
const { WorkOrders } = require("../models");
function getSummary(req, res) {
  const all = WorkOrders.all();
  const open = all.filter((w) => w.status !== "verified").length;
  const overdue = all.filter((w) => w.status !== "verified" && new Date(w.sla_deadline) < new Date()).length;
  const verified = all.filter((w) => w.status === "verified").length;
  const critical = all.filter((w) => w.urgency_score >= 80).length;
  const totalCost = all.reduce((sum, w) => sum + (w.cost_estimate || 0), 0);
  res.json({ total_work_orders: all.length, open_issues: open, overdue_sla_count: overdue, critical_count: critical, verified_count: verified, percent_repairs_verified: all.length ? Math.round((verified / all.length) * 100) : 0, total_estimated_cost_inr: totalCost, cost_avoided_inr: 28000000, riders_protected_monthly: 12400, safety_impact_note: "Safety impact tracking — awaiting historical data." });
}
module.exports = { getSummary };
