"""YOLO Detection Module - mock or real YOLOv8n"""
import os, hashlib, config

class MockDetector:
    def __init__(self): self.mode = "mock"
    def detect(self, image_url):
        h = int(hashlib.md5(image_url.encode()).hexdigest(), 16)
        is_pothole = h % 3 != 2
        confidence = 0.72 + (h % 23) / 100
        x = 0.15 + (h % 35) / 100; y = 0.30 + (h % 30) / 100; w = 0.12 + (h % 18) / 100; hh = 0.08 + (h % 12) / 100
        return {"damage_type": "pothole" if is_pothole else "crack", "confidence": round(confidence, 2), "bounding_box": [round(x, 2), round(y, 2), round(w, 2), round(hh, 2)], "num_detections": 1, "source_type": "DEMO", "note": "Mock inference - set INFERENCE_MODE=yolo for real detection."}

class YoloDetector:
    def __init__(self):
        from ultralytics import YOLO
        self.mode = "yolo"
        self.model = YOLO(config.YOLO_MODEL_PATH)
    def detect(self, image_url):
        results = self.model(image_url, conf=config.CONFIDENCE_THRESHOLD)
        detections = []
        for r in results:
            for box in r.boxes:
                cls = "pothole" if int(box.cls) == 0 else "crack"
                detections.append({"class": cls, "confidence": round(float(box.conf), 2), "bbox": [round(v, 2) for v in box.xywhn[0].tolist()]})
        if not detections:
            return {"damage_type": "pothole", "confidence": 0.0, "bounding_box": [0, 0, 0, 0], "num_detections": 0, "source_type": "MODEL"}
        best = max(detections, key=lambda d: d["confidence"])
        return {"damage_type": best["class"], "confidence": best["confidence"], "bounding_box": best["bbox"], "num_detections": len(detections), "source_type": "MODEL"}

def get_detector():
    if config.INFERENCE_MODE == "yolo" and os.path.exists(config.YOLO_MODEL_PATH):
        try: return YoloDetector()
        except ImportError: print("[AI] ultralytics not installed. Using mock."); return MockDetector()
    return MockDetector()
