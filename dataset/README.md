# Dataset Setup Guide

## Required Folder Structure

```
dataset/
├── fire/          ← images CONTAINING fire/smoke
└── no_fire/       ← images WITHOUT fire (normal scenes)
```

---

## A. Fire Detection Dataset (Kaggle)

**Option 1 — Kaggle Fire Dataset (Recommended)**
- URL: https://www.kaggle.com/datasets/phylake1337/fire-dataset
- Contains: ~755 fire images + ~244 non-fire images
- Steps:
  1. Download and unzip
  2. Copy `fire_images/` content → `dataset/fire/`
  3. Copy `non_fire_images/` content → `dataset/no_fire/`

**Option 2 — Fire and Smoke Dataset**
- URL: https://www.kaggle.com/datasets/dataclusterlabs/fire-and-smoke-dataset
- Larger dataset with smoke included

### Download via Kaggle CLI (fastest)
```bash
pip install kaggle
# Place your kaggle.json API key in ~/.kaggle/
kaggle datasets download -d phylake1337/fire-dataset
Expand-Archive fire-dataset.zip -DestinationPath dataset_raw
```
Then move images into `dataset/fire/` and `dataset/no_fire/`.

---

## B. Human Detection (YOLO Pretrained — No Training Needed)

YOLOv8 already detects humans (class 0 = "person") out of the box.

```python
from ultralytics import YOLO
model = YOLO("yolov8n.pt")   # auto-downloads on first run
results = model("image.jpg", classes=[0])  # class 0 = person
```

No dataset download required for human detection.

---

## Minimum Images Recommended

| Class    | Minimum | Recommended |
|----------|---------|-------------|
| fire     | 200     | 500+        |
| no_fire  | 200     | 500+        |
