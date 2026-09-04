/**
 * Work Order Routes
 */
const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/auth");
const {
  listWorkOrders, getWorkOrder, getPdf, dispatch, assignCrew, submitRepair, review, getVerification,
} = require("../controllers/workOrderController");

router.get("/", requireAuth, listWorkOrders);
router.get("/:id", requireAuth, getWorkOrder);
router.get("/:id/pdf", requireAuth, requireRole("authority", "admin"), getPdf);
router.get("/:id/verification", requireAuth, getVerification);
router.patch("/:id/dispatch", requireAuth, requireRole("authority", "admin"), dispatch);
router.patch("/:id/assign-crew", requireAuth, requireRole("authority", "admin"), assignCrew);
router.post("/:id/submit-repair", requireAuth, requireRole("crew"), submitRepair);
router.patch("/:id/review", requireAuth, requireRole("authority", "admin"), review);

module.exports = router;
