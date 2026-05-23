"""
decision_engine.py
───────────────────
Combines fire + human detection results into a risk status.

Logic:
  fire AND person  →  HIGH RISK
  fire only        →  FIRE ONLY
  person only      →  PERSON DETECTED
  neither          →  SAFE

Each status carries a colour (BGR for OpenCV) and a severity level (0-3).
"""

from dataclasses import dataclass

# ─────────────────────────────────────────────────────────────
#  Status definitions
# ─────────────────────────────────────────────────────────────
@dataclass(frozen=True)
class RiskStatus:
    label    : str
    severity : int          # 0=safe … 3=critical
    color_bgr: tuple        # OpenCV uses BGR
    emoji    : str


STATUSES = {
    "HIGH_RISK":        RiskStatus("HIGH RISK",        3, (0,   0,   255), "CRITICAL"),
    "FIRE_ONLY":        RiskStatus("FIRE ONLY",        2, (0,   140, 255), "WARNING"),
    "PERSON_DETECTED":  RiskStatus("PERSON DETECTED",  1, (0,   255, 0  ), "CAUTION"),
    "SAFE":             RiskStatus("SAFE",             0, (0,   200, 0  ), "SAFE"),
}


# ─────────────────────────────────────────────────────────────
#  Decision function
# ─────────────────────────────────────────────────────────────
def evaluate(
    fire_detected  : bool,
    fire_confidence: float,
    human_detections: list[dict],
) -> dict:
    """
    Parameters
    ----------
    fire_detected    : bool   — output of FireDetector.predict()
    fire_confidence  : float  — sigmoid score from CNN
    human_detections : list   — output of HumanDetector.detect()

    Returns
    -------
    dict with keys:
        status          : str   e.g. "HIGH RISK"
        severity        : int   0-3
        color_bgr       : tuple (B, G, R)
        fire_detected   : bool
        fire_confidence : float
        person_count    : int
        persons         : list  bounding boxes
    """
    person_count = len(human_detections)

    if fire_detected and person_count > 0:
        key = "HIGH_RISK"
    elif fire_detected:
        key = "FIRE_ONLY"
    elif person_count > 0:
        key = "PERSON_DETECTED"
    else:
        key = "SAFE"

    rs = STATUSES[key]

    return {
        "status"          : rs.label,
        "severity"        : rs.severity,
        "color_bgr"       : rs.color_bgr,
        "fire_detected"   : fire_detected,
        "fire_confidence" : round(fire_confidence, 4),
        "person_count"    : person_count,
        "persons"         : human_detections,
    }
