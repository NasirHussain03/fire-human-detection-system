"""
video_processor.py
───────────────────
Step 11 — Full video processing pipeline.

Workflow:
  Upload Video
  → Read Frames (OpenCV)
  → CNN Fire Prediction (every N frames for speed)
  → YOLO Human Detection
  → Annotate Frames
  → Save Output Video

Usage:
  from services.video_processor import process_video
  result = process_video(input_path, output_path)
"""

import os
import cv2
import time
import numpy as np
from typing import Callable

from services.fire_detector  import fire_detector
from services.human_detector import human_detector
from services import decision_engine
from services.annotator      import annotate_frame

# ── Run fire CNN every N frames (reduces latency; YOLO runs every frame)
FIRE_CHECK_INTERVAL = 5


def process_video(
    input_path : str,
    output_path: str,
    progress_cb: Callable[[int, int], None] | None = None,
) -> dict:
    """
    Process a video file end-to-end.

    Parameters
    ----------
    input_path  : str   Path to input video
    output_path : str   Path where annotated video will be saved
    progress_cb : callable(current_frame, total_frames) | None

    Returns
    -------
    dict with processing summary:
        total_frames, processed_frames, duration_sec,
        fire_frames, max_persons, output_path
    """
    # ── Ensure models are loaded
    fire_detector.load()
    human_detector.load()

    cap = cv2.VideoCapture(input_path)
    if not cap.isOpened():
        raise IOError(f"Cannot open video: {input_path}")

    # ── Video properties
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps          = cap.get(cv2.CAP_PROP_FPS) or 25.0
    width        = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height       = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    # ── Output writer
    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    writer = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    # ── Processing state
    frame_idx        = 0
    fire_frames      = 0
    max_persons      = 0
    last_fire_result = (False, 0.0)   # cached between fire checks
    start_time       = time.time()
    frame_results    = []

    print(f"[VideoProcessor] Processing {total_frames} frames @ {fps:.1f} FPS ...")
    print(f"[VideoProcessor]  Input  : {input_path}")
    print(f"[VideoProcessor]  Output : {output_path}")

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # ── Fire detection (every N frames, cached otherwise)
        if frame_idx % FIRE_CHECK_INTERVAL == 0:
            last_fire_result = fire_detector.predict(frame)

        is_fire, fire_conf = last_fire_result

        # ── Human detection (every frame)
        persons = human_detector.detect(frame)

        # ── Decision
        result = decision_engine.evaluate(is_fire, fire_conf, persons)

        # ── Annotate
        annotated = annotate_frame(frame, result)
        writer.write(annotated)

        # ── Stats
        if is_fire:
            fire_frames += 1
        max_persons = max(max_persons, len(persons))

        frame_results.append({
            "frame"    : frame_idx,
            "status"   : result["status"],
            "severity" : result["severity"],
            "fire_conf": fire_conf,
            "persons"  : len(persons),
        })

        # ── Progress callback
        if progress_cb and frame_idx % 10 == 0:
            progress_cb(frame_idx, total_frames)

        frame_idx += 1

    cap.release()
    writer.release()

    duration = round(time.time() - start_time, 2)
    print(f"[VideoProcessor] Done in {duration}s — "
          f"{fire_frames}/{frame_idx} fire frames, max {max_persons} persons")

    return {
        "total_frames"     : total_frames,
        "processed_frames" : frame_idx,
        "duration_sec"     : duration,
        "fps"              : round(fps, 2),
        "fire_frames"      : fire_frames,
        "fire_percentage"  : round(fire_frames / max(frame_idx, 1) * 100, 1),
        "max_persons"      : max_persons,
        "output_path"      : output_path,
        "frame_results"    : frame_results,
    }


def process_image(input_path: str, output_path: str) -> dict:
    """
    Process a single image file.

    Returns
    -------
    dict — decision engine result + output_path
    """
    fire_detector.load()
    human_detector.load()

    frame = cv2.imread(input_path)
    if frame is None:
        raise IOError(f"Cannot read image: {input_path}")

    is_fire, fire_conf = fire_detector.predict(frame)
    persons            = human_detector.detect(frame)
    result             = decision_engine.evaluate(is_fire, fire_conf, persons)
    annotated          = annotate_frame(frame, result)

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    cv2.imwrite(output_path, annotated)

    result["output_path"] = output_path
    return result


# ── Caching variables for real-time streaming
_frame_idx = 0
_last_fire_result = (False, 0.0)
_last_persons = []


def process_frame(frame: np.ndarray) -> tuple[np.ndarray, dict]:
    """
    Process a single in-memory frame (for live stream / webcam).
    Uses caching/frame-skipping to minimize latency on CPU.

    Returns
    -------
    (annotated_frame, result_dict)
    """
    global _frame_idx, _last_fire_result, _last_persons

    # Run fire detection CNN every 5 frames
    if _frame_idx % 5 == 0:
        _last_fire_result = fire_detector.predict(frame)

    # Run human detection YOLO every 2 frames
    if _frame_idx % 2 == 0:
        _last_persons = human_detector.detect(frame)

    is_fire, fire_conf = _last_fire_result
    result             = decision_engine.evaluate(is_fire, fire_conf, _last_persons)
    annotated          = annotate_frame(frame, result)

    _frame_idx += 1
    return annotated, result

