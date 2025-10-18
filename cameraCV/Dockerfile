FROM python:3.12-slim

# Set the working directory
WORKDIR /usr/src/app

# Copy the application code
COPY . .

# Copy the requirements file
COPY requirements.txt /tmp/

# Install system dependencies for OpenCV and h5py
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    pkg-config \
    libhdf5-dev \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxrender1 \
    libxext6 && \
    pip install --no-cache-dir -r /tmp/requirements.txt && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Run the application
CMD ["python3", "./main.py"]
