/**
 * Centralized configuration
 */
require("dotenv").config();
module.exports = {
  port: parseInt(process.env.PORT, 10) || 4000,
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-me",
  aiServiceUrl: process.env.AI_SERVICE_URL || "http://localhost:5001",
  scoring: {
    weights: {
      severity: parseFloat(process.env.WEIGHT_SEVERITY) || 0.4,
      traffic: parseFloat(process.env.WEIGHT_TRAFFIC) || 0.2,
      rainfall: parseFloat(process.env.WEIGHT_RAINFALL) || 0.1,
      roadImportance: parseFloat(process.env.WEIGHT_ROAD_IMPORTANCE) || 0.1,
      sensitiveLocation: parseFloat(process.env.WEIGHT_SENSITIVE_LOCATION) || 0.1,
      citizenComplaints: parseFloat(process.env.WEIGHT_CITIZEN_COMPLAINTS) || 0.1,
    },
    criticalThreshold: parseInt(process.env.CRITICAL_THRESHOLD, 10) || 80,
  },
  sla: { defaultHours: 48 },
  costEstimates: { pothole: { low: 3500, high: 25000 }, crack: { low: 2000, high: 15000 } },
};
