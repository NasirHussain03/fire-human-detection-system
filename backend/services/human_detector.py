"""
human_detector.py
──────────────────
Wraps YOLOv8 pretrained model for human (person) detection.
Class ID 0 = 'person' in COCO.

Exposes:
  detect(frame) → list[dict]  each dict has keys:
      bbox       : (x1, y1, x2, y2)  absolute pixel coords
      confidence : float
      label      : "person"
"""

import os
import numpy as np
from ultralytics import YOLO

YOLO_MODEL      = "yolov8n.pt"   # nano — fastest; swap for yolov8s/m for better accuracy
PERSON_CLASS_ID = 0
CONF_THRESHOLD  = 0.40           # minimum confidence to count as a person


class HumanDetector:
    """Singleton-safe YOLOv8 human detector."""

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._loaded = False
        return cls._instance

    def load(self):
        if self._loaded:
            return
        print(f"[HumanDetector] Loading YOLOv8 model ({YOLO_MODEL})...")
        self.model = YOLO(YOLO_MODEL)   # auto-downloads on first use
        self._loaded = True
        print("[HumanDetector] YOLO model ready.")

    # ─────────────────────────────────────────
    def detect(self, frame: np.ndarray) -> list[dict]:
        """
        Parameters
        ----------
        frame : np.ndarray  (H, W, 3)  BGR image from OpenCV

        Returns
        -------
        List of person detections:
          [{"bbox": (x1,y1,x2,y2), "confidence": 0.87, "label": "person"}, ...]
        """
        if not self._loaded:
            self.load()

        results   = self.model(frame, classes=[PERSON_CLASS_ID],
                               conf=CONF_THRESHOLD, verbose=False)
        detections = []

        for result in results:
            for box in result.boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
                conf = float(box.conf[0])
                detections.append({
                    "bbox":       (x1, y1, x2, y2),
                    "confidence": round(conf, 3),
                    "label":      "person",
                })

        return detections


# Module-level singleton
human_detector = HumanDetector()
