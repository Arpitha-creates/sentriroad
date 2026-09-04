/**
 * Scoring Engine
 */
const config = require("../config");
const { Reports, Detections, Scores } = require("../models");
function clamp(v) { if (v == null || isNaN(v)) return 0; return Math.max(0, Math.min(100, Math.round(v))); }
function computeScore(factors) {
  const w = config.scoring.weights;
  const breakdown = { severity: clamp(factors.severity), traffic: clamp(factors.traffic), rainfall: clamp(factors.rainfall), road_importance: clamp(factors.road_importance), sensitive_location: clamp(factors.sensitive_location), citizen_complaints: clamp(factors.citizen_complaints) };
  const score = Math.round(w.severity * breakdown.severity + w.traffic * breakdown.traffic + w.rainfall * breakdown.rainfall + w.roadImportance * breakdown.road_importance + w.sensitiveLocation * breakdown.sensitive_location + w.citizenComplaints * breakdown.citizen_complaints);
  return { urgency_score: clamp(score), factor_breakdown: breakdown };
}
function classify(score) { if (score >= 80) return "CRITICAL"; if (score >= 60) return "HIGH"; if (score >= 30) return "MEDIUM"; return "LOW"; }
async function scoreReport(reportId, contextData = {}) {
  const report = Reports.findById(reportId); if (!report) throw new Error("Report not found");
  const detections = Detections.findByReport(reportId); if (!detections.length) throw new Error("No detections found");
  const detection = detections[0];
  const confidence = detection.confidence;
  const severity = detection.damage_type === "pothole" ? Math.round(confidence * 90 + 10) : Math.round(confidence * 70 + 5);
  const factors = { severity, traffic: contextData.traffic_volume ?? defaultTraffic(report), rainfall: contextData.rainfall ?? 70, road_importance: contextData.road_importance ?? defaultRoadImportance(report), sensitive_location: contextData.sensitive_location ?? defaultSensitiveLocation(report), citizen_complaints: contextData.citizen_complaints ?? defaultComplaints(report) };
  const { urgency_score, factor_breakdown } = computeScore(factors);
  const score = Scores.create({ detection_id: detection.id, urgency_score, factor_breakdown });
  Reports.updateStatus(reportId, "scored");
  return score;
}
function defaultTraffic(report) { const dist = Math.abs(report.gps.lat - 12.97) + Math.abs(report.gps.lng - 77.59); return clamp(Math.round(90 - dist * 200)); }
function defaultRoadImportance(report) { const addr = (report.address || "").toLowerCase(); if (addr.includes("ring road") || addr.includes("highway")) return 90; if (addr.includes("main road") || addr.includes("signal")) return 75; return 50; }
function defaultSensitiveLocation(report) { const addr = (report.address || "").toLowerCase(); if (addr.includes("bus stop") || addr.includes("school") || addr.includes("hospital")) return 95; if (addr.includes("bridge") || addr.includes("junction")) return 80; return 40; }
function defaultComplaints(report) { const all = Reports.all(); const nearby = all.filter((r) => { const d = Math.abs(r.gps.lat - report.gps.lat) + Math.abs(r.gps.lng - report.gps.lng); return d < 0.01; }); return clamp(nearby.length * 25); }
module.exports = { computeScore, classify, scoreReport, clamp };
