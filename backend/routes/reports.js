/**
 * Report Routes
 */
const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/auth");
const { createReport, listReports, getReport, getStatus, submitFeedback } = require("../controllers/reportController");
const { analyzeReport, getDetections, getScore } = require("../controllers/detectionController");

router.post("/", requireAuth, requireRole("citizen"), createReport);
router.get("/", requireAuth, listReports);
router.get("/:id", requireAuth, getReport);
router.get("/:id/status", requireAuth, getStatus);
router.post("/:id/feedback", requireAuth, requireRole("citizen"), submitFeedback);
router.post("/:id/analyze", requireAuth, analyzeReport);
router.get("/:id/detections", requireAuth, getDetections);
router.get("/:id/score", requireAuth, getScore);

module.exports = router;
