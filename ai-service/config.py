"""SentriRoad AI Service Configuration"""
import os
PORT = int(os.getenv("AI_SERVICE_PORT", "5001"))
INFERENCE_MODE = os.getenv("INFERENCE_MODE", "mock")
YOLO_MODEL_PATH = os.getenv("YOLO_MODEL_PATH", "models/yolov8n.pt")
CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.5"))
