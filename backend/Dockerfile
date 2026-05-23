FROM python:3.12-slim

# Install system dependencies for OpenCV and YOLO
RUN apt-get update && apt-get install -y \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install
COPY requirements.txt .

# Install gunicorn for production WSGI server
RUN pip install --no-cache-dir gunicorn
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend files
COPY . .

# Expose port (Hugging Face Spaces expects the app to listen on port 7860)
ENV PORT=7860
EXPOSE 7860

# Run the app using gunicorn (binds to 0.0.0.0:7860, timeout 120s for ML model loading)
CMD ["gunicorn", "--bind", "0.0.0.0:7860", "--timeout", "120", "app:app"]
