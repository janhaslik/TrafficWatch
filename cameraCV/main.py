import random
import time
import cv2
import camera_data_producer as producer

CAMERA = "Camera 1"

VIDEO_URL = "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"

categories = ["Car", "Bus", "Motorbike"]

# Capture from the video device (e.g., webcam)
device = cv2.VideoCapture(VIDEO_URL)

while True:
    # Read frame from the camera
    _, frame = device.read()

    time.sleep(1)

    # Prepare the frame (convert to JPEG or another format suitable for Kafka)
    _, buffer = cv2.imencode('.jpg', frame)
    frame_bytes = buffer.tobytes()

    # Send detected object categories as metadata
    producer.send_data(CAMERA, [
        {'category': 'Car', 'objectsDetected': random.randint(3, 15)},
        {'category': 'Bus', "objectsDetected": random.randint(1, 5)},
        {'category': 'Motorbike', "objectsDetected": random.randint(1, 10)}
    ])

    # Send the frame itself
    producer.send_frame(CAMERA, frame_bytes)
