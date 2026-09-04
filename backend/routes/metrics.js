/**
 * Metrics, Zones, Drone, Alert Routes
 */
const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/auth");
const { getSummary } = require("../controllers/metricsController");
const { getPriorityZones, uploadDroneFootage, getOptimizedRoutes } = require("../controllers/zoneController");
const { listAlerts, getAlertById } = require("../controllers/alertController");

router.get("/summary", requireAuth, requireRole("authority", "admin"), getSummary);
router.get("/alerts", requireAuth, requireRole("authority", "admin"), listAlerts);
router.get("/alerts/:id", requireAuth, requireRole("authority", "admin"), getAlertById);
router.get("/zones/priority", requireAuth, requireRole("authority", "admin"), getPriorityZones);
router.post("/drone/footage", requireAuth, requireRole("authority", "admin"), uploadDroneFootage);
router.get("/routes/optimize", requireAuth, requireRole("authority", "admin"), getOptimizedRoutes);

module.exports = router;
