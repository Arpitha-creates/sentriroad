/**
 * Upload Routes
 */
const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/auth");
const { getSignedUrl } = require("../controllers/uploadController");

router.post("/signed-url", requireAuth, requireRole("citizen", "crew", "admin"), getSignedUrl);

module.exports = router;
