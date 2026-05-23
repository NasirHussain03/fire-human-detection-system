FROM python:3.12-slim

# Install system dependencies for OpenCV and YOLO
RUN apt-get update && apt-get install -y \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Set up user 1000 for Hugging Face security compatibility
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

WORKDIR $HOME/app

# Ensure Python output is not buffered (so logs appear in HF dashboard immediately)
ENV PYTHONUNBUFFERED=1

# Copy requirements and install
COPY --chown=1000 requirements.txt .

# Install gunicorn and requirements as user 1000
RUN pip install --no-cache-dir --user gunicorn
RUN pip install --no-cache-dir --user -r requirements.txt

# Copy backend files with correct ownership
COPY --chown=1000 . $HOME/app

# Expose port (Hugging Face Spaces expects the app to listen on port 7860)
ENV PORT=7860
EXPOSE 7860

# Run the app using gunicorn with preload so TF/YOLO load once in master, not per-worker
CMD ["gunicorn", "--bind", "0.0.0.0:7860", "--timeout", "300", "--workers", "1", "--preload", "app:app"]
