# SentriRoad — Implementation Guide

## 1. Real YOLOv8n Model (Replace Mock Detection)

### Step 1: Collect Dataset
- Photograph potholes and cracks (minimum 500 images per class)
- Label with LabelImg or Roboflow (YOLO format)
- Split: 80% train, 20% val

### Step 2: Train
```bash
cd ai-service
pip install ultralytics torch torchvision
python models/yolo_trainer.py --train --data data.yaml --epochs 100 --batch 16
```

### Step 3: Copy Trained Model
```bash
copy runs\sentriroad_yolov8n\weights\best.pt models\yolov8n.pt
```

### Step 4: Enable in .env
```
INFERENCE_MODE=yolo
YOLO_MODEL_PATH=models/yolov8n.pt
```

## 2. RL Route Optimization (Replace Nearest-Neighbor)

### Option A: Q-Learning (No PyTorch needed — pure JS)
In backend/services/routeOptimizer.js, change:
```js
const { optimizeRoutes } = require("./routeOptimizer");
// To:
const { optimizeRoutes } = require("./rlRouteOptimizer");
```

### Option B: Deep Q-Network (PyTorch)
```python
from models.rl_agent import RLRouteAgent
agent = RLRouteAgent(num_work_orders=10)
agent.train(historical_work_orders, episodes=1000)
agent.save("models/rl_model.pt")
route = agent.predict(current_work_orders, start_pos)
```

## 3. MongoDB (Replace In-Memory DB)

### Step 1: Install MongoDB + Mongoose
### Step 2: Add DB_URL=mongodb://localhost:27017/sentriroad to .env
### Step 3: In backend/models/index.js, replace:
```js
const db = require("./db");
// with:
const db = require("./mongo_adapter");
await db.connect(process.env.DB_URL);
```

## File Reference
| File | Purpose |
|---|---|
| backend/models/mongoose_schemas.js | All MongoDB schemas |
| backend/models/mongo_adapter.js | Drop-in replacement for in-memory db.js |
| backend/services/rlRouteOptimizer.js | Q-Learning route optimizer (pure JS) |
| ai-service/models/rl_agent.py | Deep Q-Network agent (PyTorch) |
| ai-service/models/yolo_trainer.py | YOLOv8n training, inference, ONNX export |
| ai-service/data.yaml | YOLO dataset config |
