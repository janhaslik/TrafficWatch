import time
import cv2
import camera_data_producer as producer

from model import ObjectDetector

CAMERA = "Camera 1"
VIDEO_URL = "./traffic.mp4"
# Read actual classes from classes.txt to match training data
import pandas as pd
import os
classes_df = pd.read_csv(os.path.join('./data/labels', 'classes.txt'), header=None)
categories = classes_df[0].tolist()


model = ObjectDetector(frame_width=640, frame_height=640, num_classes=len(categories))
model.load("object_detector_model.keras")

def initialize_device():
    device = cv2.VideoCapture(VIDEO_URL)
    if not device.isOpened():
        print(f"Error: Could not open video source {VIDEO_URL}")
        exit()
    return device


device = initialize_device()

if not device.isOpened():
    print(f"Error: Could not open video source {VIDEO_URL}")
    exit()

# Compression settings
frame_width = 640
frame_height = 360
jpeg_quality = 50

MAX_BOXES = 5

fps = 60

last_data_time = time.time()

try:
    while True:
        # Read frame from the video
        ret, frame = device.read()

        # If the video has ended, create a new capture device
        if not ret:
            print("End of video reached. Restarting...")
            device.release()  # Release the old device
            device = initialize_device()  # Create a new device
            continue

        original_height, original_width, _ = frame.shape

        # Resize the frame for compression
        resized_frame = cv2.resize(frame, (640, 640))
        normalized_frame = resized_frame / 255.0

        predictions = model.predict(normalized_frame)

        boxes, confidence, classes = (
            predictions["boxes"],
            predictions["confidence"],
            predictions["classes"]
        )

        detected_objects = []
        box_count = 0

        for box, score, class_id in zip(boxes[0], confidence[0], classes[0]):
            if score > 0.5:
                category = categories[int(class_id)]
                detected_objects.append({'category': category, 'objectsDetected': 1})

        # Compress the frame
        compressed_frame = cv2.resize(frame, (frame_width, frame_height))

        encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), jpeg_quality]
        _, buffer = cv2.imencode('.jpg', compressed_frame, encode_param)
        frame_bytes = buffer.tobytes()

        current_time = time.time()

        if current_time - last_data_time > 1:
            # Send detected object categories to kafka
            producer.send_data(CAMERA, detected_objects)
            last_data_time = current_time

        producer.send_frame(CAMERA, frame_bytes)

        time.sleep(1 / fps)

except Exception as e:
    print(f"Error occurred: {e}")

finally:
    device.release()
    cv2.destroyAllWindows()
