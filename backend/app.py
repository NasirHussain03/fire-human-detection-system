import os
from flask import Flask
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB
# client = MongoClient(os.getenv("MONGO_URI"))
# db     = client["fire_detection"]

# Config
app.config["UPLOAD_FOLDER"] = os.getenv("UPLOAD_FOLDER", "uploads")
app.config["OUTPUT_FOLDER"] = os.getenv("OUTPUT_FOLDER", "outputs")
app.config["MAX_CONTENT_LENGTH"] = 200 * 1024 * 1024   # 200 MB

# Ensure upload/output folders exist
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
os.makedirs(app.config["OUTPUT_FOLDER"], exist_ok=True)

# Register blueprints
from routes.health    import health_bp
from routes.detection import detection_bp

app.register_blueprint(health_bp)
app.register_blueprint(detection_bp, url_prefix="/api/detect")


from flask import send_from_directory

@app.route("/")
def home():
    return {"message": "Fire Detection API Running"}


@app.route("/outputs/<path:filename>")
def get_output_file(filename):
    return send_from_directory(app.config["OUTPUT_FOLDER"], filename)


if __name__ == "__main__":
    app.run(debug=True)
