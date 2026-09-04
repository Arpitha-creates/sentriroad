"""SentriRoad AI Service - Flask API"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import config
from models.detector import get_detector
from models.scoring import compute_score, classify
from models.recommendation import generate_recommendation
from models.route_optimizer import optimize_routes

app = Flask(__name__)
CORS(app)
detector = get_detector()
print(f"[AI SERVICE] Detector mode: {detector.mode}")

@app.route("/health")
def health():
    return jsonify({"status": "ok", "service": "sentriroad-ai-service", "inference_mode": detector.mode})

@app.route("/detect", methods=["POST"])
def detect():
    data = request.get_json() or {}
    image_url = data.get("image_url")
    if not image_url: return jsonify({"error": {"code": "VALIDATION_ERROR", "message": "image_url is required"}}), 400
    try: return jsonify(detector.detect(image_url))
    except Exception as e: return jsonify({"error": {"code": "DETECTION_FAILED", "message": str(e)}}), 500

@app.route("/score", methods=["POST"])
def score():
    data = request.get_json() or {}
    result = compute_score(data.get("factors", {}))
    result["classification"] = classify(result["urgency_score"])
    return jsonify(result)

@app.route("/recommend", methods=["POST"])
def recommend():
    data = request.get_json() or {}
    return jsonify(generate_recommendation(data.get("damage_type", "pothole"), data.get("confidence", 0.8), data.get("urgency_score", 50), data.get("factor_breakdown", {})))

@app.route("/optimize-routes", methods=["POST"])
def optimize():
    data = request.get_json() or {}
    return jsonify(optimize_routes(data.get("work_orders", []), data.get("crews", []), data.get("depot")))

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=config.PORT, debug=True)
