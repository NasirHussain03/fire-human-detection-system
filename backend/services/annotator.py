"""
annotator.py
─────────────
Step 12 — Real-time frame annotation using OpenCV.

Colour scheme (BGR):
  Red    (0,0,255)   → Fire warning overlay
  Green  (0,255,0)   → Person bounding box
  Yellow (0,215,255) → HIGH RISK banner
  Orange (0,140,255) → FIRE ONLY banner
"""

import cv2
import numpy as np

# ── Colours (BGR)
RED    = (0,   0,   255)
GREEN  = (0,   200, 0  )
YELLOW = (0,   215, 255)
ORANGE = (0,   140, 255)
WHITE  = (255, 255, 255)
BLACK  = (0,   0,   0  )

SEVERITY_COLORS = {
    3: YELLOW,   # HIGH RISK
    2: ORANGE,   # FIRE ONLY
    1: GREEN,    # PERSON DETECTED
    0: GREEN,    # SAFE
}

FONT       = cv2.FONT_HERSHEY_SIMPLEX
FONT_BOLD  = cv2.FONT_HERSHEY_DUPLEX


def draw_persons(frame: np.ndarray, persons: list[dict]) -> np.ndarray:
    """Draw green bounding boxes with confidence labels for each detected person."""
    for p in persons:
        x1, y1, x2, y2 = p["bbox"]
        conf = p["confidence"]

        # Bounding box
        cv2.rectangle(frame, (x1, y1), (x2, y2), GREEN, 2)

        # Label background
        label     = f"Person {conf:.0%}"
        (tw, th), baseline = cv2.getTextSize(label, FONT, 0.55, 1)
        cv2.rectangle(frame, (x1, y1 - th - 6), (x1 + tw + 4, y1), GREEN, -1)

        # Label text
        cv2.putText(frame, label, (x1 + 2, y1 - 4),
                    FONT, 0.55, BLACK, 1, cv2.LINE_AA)

    return frame


def draw_fire_overlay(frame: np.ndarray, confidence: float) -> np.ndarray:
    """Draw a semi-transparent red tint + fire confidence bar at the bottom."""
    h, w = frame.shape[:2]

    # Tinted border when fire is detected
    overlay = frame.copy()
    cv2.rectangle(overlay, (0, 0), (w, h), RED, 12)
    cv2.addWeighted(overlay, 0.4, frame, 0.6, 0, frame)

    # Confidence bar
    bar_w = int(w * confidence)
    cv2.rectangle(frame, (0, h - 18), (bar_w, h), RED, -1)
    cv2.putText(frame, f"Fire conf: {confidence:.1%}",
                (6, h - 4), FONT, 0.45, WHITE, 1, cv2.LINE_AA)

    return frame


def draw_status_banner(frame: np.ndarray, result: dict) -> np.ndarray:
    """Draw the top status banner with risk level and counts."""
    h, w   = frame.shape[:2]
    color  = tuple(result["color_bgr"])
    status = result["status"]
    fire_c = result["fire_confidence"]
    p_cnt  = result["person_count"]

    # Banner background
    banner_h = 44
    overlay  = frame.copy()
    cv2.rectangle(overlay, (0, 0), (w, banner_h), color, -1)
    cv2.addWeighted(overlay, 0.75, frame, 0.25, 0, frame)

    # Status text (left)
    cv2.putText(frame, f"  STATUS: {status}",
                (6, 30), FONT_BOLD, 0.85, WHITE, 2, cv2.LINE_AA)

    # Info text (right)
    info = f"Fire: {fire_c:.0%}  |  Persons: {p_cnt}"
    (tw, _), _ = cv2.getTextSize(info, FONT, 0.50, 1)
    cv2.putText(frame, info,
                (w - tw - 10, 30), FONT, 0.50, WHITE, 1, cv2.LINE_AA)

    return frame


def annotate_frame(frame: np.ndarray, result: dict) -> np.ndarray:
    """
    Master annotation function.
    Applies all overlays to a single frame based on the decision engine result.

    Parameters
    ----------
    frame  : np.ndarray  BGR frame from OpenCV
    result : dict        output of decision_engine.evaluate()

    Returns
    -------
    Annotated frame (same shape, BGR)
    """
    frame = frame.copy()

    # 1. Fire overlay (red tint + bar)
    if result["fire_detected"]:
        frame = draw_fire_overlay(frame, result["fire_confidence"])

    # 2. Person bounding boxes
    if result["persons"]:
        frame = draw_persons(frame, result["persons"])

    # 3. Status banner (always on top)
    frame = draw_status_banner(frame, result)

    return frame
