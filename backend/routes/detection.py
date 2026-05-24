"""
routes/detection.py
────────────────────
Flask API endpoints for fire & human detection.

POST /api/detect/image   → process a single uploaded image
POST /api/detect/video   → process an uploaded video file
GET  /api/detect/stream  → MJPEG live stream from webcam
"""

import os
import uuid
import threading
import time
import cv2
from flask import Blueprint, request, jsonify, Response, current_app
from werkzeug.utils import secure_filename

from services.video_processor import process_image, process_video, process_frame
from services.fire_detector   import fire_detector
from services.human_detector  import human_detector

detection_bp = Blueprint("detection", __name__)

ALLOWED_IMAGE = {"jpg", "jpeg", "png", "bmp", "webp"}
ALLOWED_VIDEO = {"mp4", "avi", "mov", "mkv", "webm"}


def _allowed(filename: str, allowed_set: set) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in allowed_set


def _upload_path(app, folder_key: str) -> str:
    folder = app.config.get(folder_key, folder_key.lower().replace("_folder", "s"))
    os.makedirs(folder, exist_ok=True)
    return folder


# ─────────────────────────────────────────────────────────────
#  POST /api/detect/image
# ─────────────────────────────────────────────────────────────
@detection_bp.route("/image", methods=["POST"])
def detect_image():
    if "file" not in request.files:
        return jsonify({"error": "No file part in request"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if not _allowed(file.filename, ALLOWED_IMAGE):
        return jsonify({"error": f"Invalid file type. Allowed: {ALLOWED_IMAGE}"}), 400

    # Save upload
    upload_dir = _upload_path(current_app, "UPLOAD_FOLDER")
    filename   = f"{uuid.uuid4().hex}_{secure_filename(file.filename)}"
    input_path = os.path.join(upload_dir, filename)
    file.save(input_path)

    # Process
    output_dir  = _upload_path(current_app, "OUTPUT_FOLDER")
    output_path = os.path.join(output_dir, f"annotated_{filename}")

    try:
        result = process_image(input_path, output_path)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    # Strip non-serialisable fields
    result.pop("color_bgr", None)

    return jsonify({
        "success"         : True,
        "status"          : result["status"],
        "severity"        : result["severity"],
        "fire_detected"   : result["fire_detected"],
        "fire_confidence" : result["fire_confidence"],
        "person_count"    : result["person_count"],
        "persons"         : [
            {"bbox": list(p["bbox"]), "confidence": p["confidence"]}
            for p in result.get("persons", [])
        ],
        "output_file"     : os.path.basename(output_path),
    }), 200


# ─────────────────────────────────────────────────────────────
#  POST /api/detect/video
# ─────────────────────────────────────────────────────────────
@detection_bp.route("/video", methods=["POST"])
def detect_video():
    if "file" not in request.files:
        return jsonify({"error": "No file part in request"}), 400

    file = request.files["file"]
    if not _allowed(file.filename, ALLOWED_VIDEO):
        return jsonify({"error": f"Invalid file type. Allowed: {ALLOWED_VIDEO}"}), 400

    upload_dir  = _upload_path(current_app, "UPLOAD_FOLDER")
    filename    = f"{uuid.uuid4().hex}_{secure_filename(file.filename)}"
    input_path  = os.path.join(upload_dir, filename)
    file.save(input_path)

    output_dir  = _upload_path(current_app, "OUTPUT_FOLDER")
    output_path = os.path.join(output_dir, f"annotated_{filename}")

    try:
        summary = process_video(input_path, output_path)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    # Remove per-frame data from API response (too large)
    summary.pop("frame_results", None)

    return jsonify({
        "success"         : True,
        "output_file"     : os.path.basename(output_path),
        **summary,
    }), 200


# ─────────────────────────────────────────────────────────────
#  GET /api/detect/stream   — MJPEG webcam stream
# ─────────────────────────────────────────────────────────────
_stream_active = False


class CameraStream:
    """Helper class to continuously read webcam frames in a background thread."""
    def __init__(self):
        self.cap = None
        self.running = False
        self.thread = None
        self.frame = None
        self.lock = threading.Lock()

    def start(self):
        print("[CameraStream] Opening webcam (index 0)...")
        import platform
        if platform.system() == "Linux" and not os.path.exists("/dev/video0"):
            print("[CameraStream] No video device /dev/video0 found on Linux. Streaming webcam is disabled.")
            return False
        self.cap = cv2.VideoCapture(0)
        if not self.cap.isOpened():
            print("[CameraStream] Failed to open webcam.")
            return False
        self.running = True
        self.thread = threading.Thread(target=self._update, daemon=True)
        self.thread.start()
        print("[CameraStream] Background reader thread started.")
        return True

    def stop(self):
        print("[CameraStream] Stopping background reader...")
        self.running = False
        if self.thread:
            self.thread.join(timeout=1.0)
        if self.cap:
            self.cap.release()
        print("[CameraStream] Background reader stopped and camera released.")

    def _update(self):
        while self.running:
            ret, frame = self.cap.read()
            if not ret:
                time.sleep(0.01)
                continue
            with self.lock:
                self.frame = frame
            time.sleep(0.005)

    def get_frame(self):
        with self.lock:
            return self.frame.copy() if self.frame is not None else None


def _gen_frames():
    global _stream_active
    stream = CameraStream()
    if not stream.start():
        return

    _stream_active = True
    try:
        while _stream_active:
            frame = stream.get_frame()
            if frame is None:
                time.sleep(0.01)
                continue

            # Process frame using caching/frame-skipping pipeline
            annotated, _ = process_frame(frame)

            _, buffer = cv2.imencode(".jpg", annotated, [cv2.IMWRITE_JPEG_QUALITY, 80])
            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n"
                + buffer.tobytes()
                + b"\r\n"
            )
            # Throttle stream rate to prevent overwhelming CPU/browser (e.g. ~25 FPS)
            time.sleep(0.04)
    finally:
        stream.stop()
        _stream_active = False


@detection_bp.route("/stream", methods=["GET"])
def detect_stream():
    return jsonify({"error": "Server-side streaming is disabled. Use client-side browser monitoring."}), 400


@detection_bp.route("/stream/stop", methods=["POST"])
def stop_stream():
    return jsonify({"message": "Stream disabled"}), 200
