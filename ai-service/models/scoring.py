"""Priority Scoring Engine"""
WEIGHTS = {"severity": 0.40, "traffic": 0.20, "rainfall": 0.10, "road_importance": 0.10, "sensitive_location": 0.10, "citizen_complaints": 0.10}
CRITICAL_THRESHOLD = 80

def clamp(v):
    if v is None: return 0
    return max(0, min(100, int(round(v))))

def compute_score(factors):
    breakdown = {k: clamp(factors.get(k, 50)) for k in WEIGHTS}
    score = round(sum(WEIGHTS[k] * breakdown[k] for k in WEIGHTS))
    return {"urgency_score": clamp(score), "factor_breakdown": breakdown}

def classify(score):
    if score >= 80: return "CRITICAL"
    if score >= 60: return "HIGH"
    if score >= 30: return "MEDIUM"
    return "LOW"
