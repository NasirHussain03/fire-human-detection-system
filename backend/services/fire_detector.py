"""
fire_detector.py
────────────────
Wraps the trained Keras/TF CNN fire classifier.
Exposes a single predict(frame) → (is_fire: bool, confidence: float)
"""

import os
import numpy as np
import cv2
import tensorflow as tf
from tensorflow.keras.models import load_model

# Suppress TF oneDNN noise
os.environ.setdefault("TF_ENABLE_ONEDNN_OPTS", "0")
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")

BASE_DIR   = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.environ.get("MODEL_PATH", os.path.join(BASE_DIR, "models", "fire_classifier.h5"))

IMG_SIZE        = (128, 128)
FIRE_THRESHOLD  = 0.5          # sigmoid threshold


class FireDetector:
    """Singleton-safe CNN fire classifier."""

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._loaded = False
        return cls._instance

    def load(self):
        if self._loaded:
            return
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"Fire model not found at: {MODEL_PATH}\n"
                "Run models/train_fire_model.py first."
            )
        print(f"[FireDetector] Loading model from {MODEL_PATH}")
        self.model = load_model(MODEL_PATH)
        self._loaded = True
        print("[FireDetector] Model loaded successfully.")

    # ─────────────────────────────────────────
    def preprocess(self, frame: np.ndarray) -> np.ndarray:
        """BGR frame (OpenCV) → normalised tensor (1, H, W, 3)."""
        rgb   = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        resized = cv2.resize(rgb, IMG_SIZE)
        return np.expand_dims(resized.astype("float32") / 255.0, axis=0)

    def predict(self, frame: np.ndarray) -> tuple[bool, float]:
        """
        Parameters
        ----------
        frame : np.ndarray  (H, W, 3)  BGR image from OpenCV

        Returns
        -------
        (is_fire, confidence)  where confidence ∈ [0, 1]
        """
        if not self._loaded:
            self.load()

        tensor     = self.preprocess(frame)
        raw_val    = float(self.model.predict(tensor, verbose=0)[0][0])
        
        # Since class 'fire' is 0 and 'no_fire' is 1 (determined alphabetically by flow_from_directory),
        # raw_val close to 0 indicates fire, and raw_val close to 1 indicates no-fire.
        # Thus, fire confidence (probability) is 1.0 - raw_val.
        fire_confidence = 1.0 - raw_val
        is_fire    = fire_confidence >= FIRE_THRESHOLD
        return is_fire, fire_confidence



# Module-level singleton
fire_detector = FireDetector()
