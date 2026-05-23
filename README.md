# 🔥 Fire & Human Detection System

An AI-powered real-time detection system for identifying **fire** and **humans** in images and video streams using deep learning.

---

## 📁 Project Structure

```
fire-human-detection-system/
│
├── backend/        # API server, detection logic, and model inference
│
├── frontend/       # Web UI for uploading media and viewing results
│
├── models/         # Trained ML/DL model weights and configs
│
├── dataset/        # Training and testing datasets
│
├── uploads/        # Uploaded images/videos for inference
│
├── outputs/        # Detection results, annotated images/videos
│
└── README.md       # Project documentation
```

---

## 🚀 Features

- 🔥 Real-time **fire detection** in images and video
- 🧍 Real-time **human detection** using object detection models
- 📤 Upload images/videos via web interface
- 📊 Annotated output with bounding boxes and confidence scores
- 🌐 REST API backend for easy integration

---

## 🛠️ Tech Stack

| Layer     | Technology              |
|-----------|-------------------------|
| Backend   | Python, FastAPI / Flask |
| Frontend  | HTML, CSS, JavaScript   |
| ML Models | YOLOv8 / PyTorch        |
| Database  | SQLite / PostgreSQL      |

---

## ⚙️ Getting Started

### Prerequisites

- Python 3.9+
- Node.js (for frontend, if applicable)
- pip / virtualenv

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/fire-human-detection-system.git
cd fire-human-detection-system

# Set up Python virtual environment
python -m venv venv
venv\Scripts\activate   # Windows
# source venv/bin/activate  # macOS/Linux

# Install backend dependencies
pip install -r backend/requirements.txt
```

### Running the App

```bash
# Start backend server
cd backend
python app.py
```

---

## 📂 Directory Details

| Folder     | Description                                              |
|------------|----------------------------------------------------------|
| `backend/` | FastAPI/Flask server, inference pipeline, API endpoints  |
| `frontend/`| HTML/JS/CSS interface for user interaction               |
| `models/`  | Pre-trained and fine-tuned model weights (`.pt`, `.h5`)  |
| `dataset/` | Raw and processed images/videos used for training        |
| `uploads/` | Temporary storage for user-uploaded media files          |
| `outputs/` | Annotated results and detection reports                  |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.
