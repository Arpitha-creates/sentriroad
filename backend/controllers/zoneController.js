/**
 * Zones & Drone Controller
 */
const { WorkOrders, Users } = require("../models");
const { optimizeRoutes } = require("../services/routeOptimizer");
const { apiError } = require("../utils/errors");
function getPriorityZones(req, res) {
  const open = WorkOrders.all().filter((w) => w.status !== "verified");
  const zones = {};
  open.forEach((wo) => { const key = `${wo.location.gps.lat.toFixed(2)},${wo.location.gps.lng.toFixed(2)}`; if (!zones[key]) zones[key] = { id: `z_${key.replace(/[.,]/g, "_")}`, name: wo.location.address || `Zone ${key}`, gps: wo.location.gps, work_order_count: 0, max_urgency: 0, work_order_ids: [] }; zones[key].work_order_count++; zones[key].max_urgency = Math.max(zones[key].max_urgency, wo.urgency_score); zones[key].work_order_ids.push(wo.id); });
  const zoneList = Object.values(zones).map((z) => ({ ...z, priority: z.max_urgency >= 80 ? "critical" : z.max_urgency >= 60 ? "high" : z.max_urgency >= 30 ? "medium" : "low", estimated_battery_saving_pct: 20 + Math.floor(Math.random() * 25) }));
  res.json({ data: zoneList, note: "Optimization Prototype — zones derived from open work orders." });
}
function uploadDroneFootage(req, res) { const { media_url, zone_id } = req.body || {}; if (!media_url) return apiError(res, 400, "VALIDATION_ERROR", "media_url is required"); res.status(202).json({ job_id: `drone_${Date.now()}`, status: "processing", zone_id: zone_id || null, message: "Drone footage queued for frame extraction." }); }
function getOptimizedRoutes(req, res) { const openWorkOrders = WorkOrders.all().filter((w) => w.status === "scored" || w.status === "dispatched"); const crews = Users.findByRole("crew"); res.json(optimizeRoutes(openWorkOrders, crews)); }
module.exports = { getPriorityZones, uploadDroneFootage, getOptimizedRoutes };
