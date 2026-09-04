/**
 * Recommendation Engine
 */
function generateRecommendation({ damage_type, confidence, urgency_score, factor_breakdown, context = {} }) {
  const severity = factor_breakdown?.severity ?? 50;
  let size = severity >= 75 ? "Large" : severity >= 45 ? "Medium" : "Small";
  if (damage_type === "pothole") {
    if (urgency_score >= 80) return _rec(size, "Priority patch repair + field engineering verification", ["Hot mix asphalt patch material", "Tack coat primer", "Aggregate base", "Plate compactor", "Safety barriers and traffic cones"], "3-4 people", "4-6 hours", "Critical urgency: large pothole on a high-traffic road.", 3500, 25000, urgency_score);
    if (urgency_score >= 60) return _rec(size, "Standard asphalt patch repair", ["Cold mix asphalt", "Tack coat", "Hand tamper or small compactor", "Traffic cones"], "2-3 people", "2-4 hours", "High urgency pothole requiring standard patch repair.", 3500, 25000, urgency_score);
    if (urgency_score >= 30) return _rec(size, "Routine pothole patching", ["Cold mix asphalt", "Hand tamper", "Warning sign"], "1-2 people", "1-2 hours", "Medium urgency: standard pothole patch.", 3500, 25000, urgency_score);
    return _rec(size, "Monitor and schedule", ["Inspection only"], "1 person (inspection)", "30 min", "Low urgency: monitor during routine inspections.", 3500, 25000, urgency_score);
  } else {
    if (urgency_score >= 60) return _rec(size, "Crack sealing + micro-surfacing", ["Rubberized crack sealant", "Hot air lance", "Squeegee", "Micro-surfacing mix"], "2-3 people", "3-5 hours", "High urgency crack across the lane.", 2000, 15000, urgency_score);
    return _rec(size, "Routine crack sealing", ["Crack sealant", "Application tool"], "1-2 people", "1-2 hours", "Standard crack sealing.", 2000, 15000, urgency_score);
  }
}
function _rec(size, category, kit, crew, duration, explanation, low, high, urgency) {
  const costLow = Math.round(low + (high - low) * (urgency / 100) * 0.3);
  const costHigh = Math.round(low + (high - low) * (urgency / 100));
  return { size_category: size, repair_category: category, suggested_kit: kit, estimated_crew: crew, estimated_duration: duration, estimated_cost_low_inr: costLow, estimated_cost_high_inr: costHigh, explanation, disclaimer: "These are prototype estimates, not engineering specifications." };
}
module.exports = { generateRecommendation };
