"""Repair Recommendation Engine"""
def generate_recommendation(damage_type, confidence, urgency_score, factor_breakdown=None):
    fb = factor_breakdown or {}
    severity = fb.get("severity", 50)
    size = "Large" if severity >= 75 else "Medium" if severity >= 45 else "Small"
    if damage_type == "pothole":
        if urgency_score >= 80: return _rec(size, "Priority patch repair + field engineering verification", ["Hot mix asphalt", "Tack coat", "Aggregate base", "Plate compactor", "Safety barriers"], "3-4 people", "4-6 hours", "Critical urgency: large pothole.", 3500, 25000, urgency_score)
        if urgency_score >= 60: return _rec(size, "Standard asphalt patch repair", ["Cold mix asphalt", "Tack coat", "Compactor", "Traffic cones"], "2-3 people", "2-4 hours", "High urgency pothole.", 3500, 25000, urgency_score)
        if urgency_score >= 30: return _rec(size, "Routine pothole patching", ["Cold mix asphalt", "Hand tamper"], "1-2 people", "1-2 hours", "Medium urgency.", 3500, 25000, urgency_score)
        return _rec(size, "Monitor and schedule", ["Inspection only"], "1 person", "30 min", "Low urgency.", 3500, 25000, urgency_score)
    else:
        if urgency_score >= 60: return _rec(size, "Crack sealing + micro-surfacing", ["Rubberized sealant", "Hot air lance", "Squeegee"], "2-3 people", "3-5 hours", "High urgency crack.", 2000, 15000, urgency_score)
        return _rec(size, "Routine crack sealing", ["Crack sealant", "Application tool"], "1-2 people", "1-2 hours", "Standard crack sealing.", 2000, 15000, urgency_score)

def _rec(size, cat, kit, crew, dur, expl, low, high, urg):
    return {"size_category": size, "repair_category": cat, "suggested_kit": kit, "estimated_crew": crew, "estimated_duration": dur, "estimated_cost_low_inr": round(low + (high - low) * (urg / 100) * 0.3), "estimated_cost_high_inr": round(low + (high - low) * (urg / 100)), "explanation": expl, "disclaimer": "Prototype estimates, not engineering specifications."}
