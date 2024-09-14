FROM python:3.12-slim

# Set the working directory
WORKDIR /usr/src/app

# Copy the application code
COPY . .

# Copy the requirements file and install dependencies
COPY requirements.txt /tmp/

# Install system dependencies for OpenCV (including libGL for OpenCV)
RUN apt-get update && \
    apt-get install -y libgl1 libglib2.0-0 libsm6 libxrender1 libxext6 && \
    pip install --no-cache-dir -r /tmp/requirements.txt

# Run the application
CMD ["python3", "./main.py"]
