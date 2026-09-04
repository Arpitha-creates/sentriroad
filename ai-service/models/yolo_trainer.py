"""
YOLOv8n TRAINING SCRIPT — Train on pothole/crack dataset
Prerequisites:
    pip install ultralytics torch torchvision
Usage:
    python yolo_trainer.py --train --data data.yaml --epochs 100
    python yolo_trainer.py --infer --image path/to/pothole.jpg
"""
import argparse, sys, os

def train(data_yaml, epochs=100, imgsz=640, batch=16):
    try: from ultralytics import YOLO
    except ImportError: print("ERROR: pip install ultralytics torch torchvision"); sys.exit(1)
    model = YOLO("yolov8n.pt")
    print(f"\n[TRAINING] Starting YOLOv8n training")
    results = model.train(data=data_yaml, epochs=epochs, imgsz=imgsz, batch=batch, device="auto", project="runs", name="sentriroad_yolov8n", save=True, plots=True)
    print(f"\n[TRAINING COMPLETE] Best model: runs/sentriroad_yolov8n/weights/best.pt")
    print(f"  Copy to: ai-service/models/yolov8n.pt")
    print(f"  Set INFERENCE_MODE=yolo in .env")
    return results

def infer(image_path, model_path="models/yolov8n.pt"):
    try: from ultralytics import YOLO
    except ImportError: print("ERROR: pip install ultralytics torch torchvision"); sys.exit(1)
    if not os.path.exists(model_path): print(f"ERROR: Model not found at {model_path}"); sys.exit(1)
    model = YOLO(model_path)
    results = model(image_path, conf=0.5)
    detections = []
    for r in results:
        for box in r.boxes:
            cls = int(box.cls); class_name = model.names[cls]; conf = float(box.conf); bbox = box.xywhn[0].tolist()
            detections.append({"class": class_name, "class_id": cls, "confidence": round(conf, 4), "bbox_normalized": [round(v, 4) for v in bbox]})
    print(f"\n[INFERENCE] {image_path}")
    print(f"  Detections: {len(detections)}")
    for d in detections: print(f"    {d['class']} ({d['confidence']:.2%}) bbox={d['bbox_normalized']}")
    return detections

def export_onnx(model_path="models/yolov8n.pt"):
    try: from ultralytics import YOLO
    except ImportError: print("ERROR: pip install ultralytics"); sys.exit(1)
    model = YOLO(model_path); model.export(format="onnx")
    print(f"[EXPORT] ONNX model saved to {model_path.replace('.pt', '.onnx')}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="SentriRoad YOLOv8n Trainer")
    parser.add_argument("--train", action="store_true")
    parser.add_argument("--infer", action="store_true")
    parser.add_argument("--export", action="store_true")
    parser.add_argument("--data", default="data.yaml")
    parser.add_argument("--image", help="Image path for inference")
    parser.add_argument("--model", default="models/yolov8n.pt")
    parser.add_argument("--epochs", type=int, default=100)
    parser.add_argument("--batch", type=int, default=16)
    parser.add_argument("--imgsz", type=int, default=640)
    args = parser.parse_args()
    if args.train: train(args.data, args.epochs, args.imgsz, args.batch)
    elif args.infer: infer(args.image, args.model) if args.image else print("ERROR: --image required")
    elif args.export: export_onnx(args.model)
    else: parser.print_help()
