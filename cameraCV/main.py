import random
import time
import cv2
import camera_data_producer as producer
import time

CAMERA = "Camera 1"
VIDEO_URL = "./traffic.mp4"
categories = ["Car", "Bus", "Motorbike"]


# Function to initialize video capture
def initialize_device():
    device = cv2.VideoCapture(VIDEO_URL)
    if not device.isOpened():
        print(f"Error: Could not open video source {VIDEO_URL}")
        exit()
    return device


# Initialize video capture device
device = initialize_device()

if not device.isOpened():
    print(f"Error: Could not open video source {VIDEO_URL}")
    exit()

# Compression settings
frame_width = 640
frame_height = 360
jpeg_quality = 50

fps = 30

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

        # Resize the frame for compression
        compressed_frame = cv2.resize(frame, (frame_width, frame_height))

        # Compress the frame
        encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), jpeg_quality]
        _, buffer = cv2.imencode('.jpg', compressed_frame, encode_param)
        frame_bytes = buffer.tobytes()

        current_time = time.time()

        if current_time - last_data_time > 1:
            # Send detected object categories to kafka
            producer.send_data(CAMERA, [
                {'category': 'Car', 'objectsDetected': random.randint(3, 15)},
                {'category': 'Bus', 'objectsDetected': random.randint(1, 5)},
                {'category': 'Motorbike', 'objectsDetected': random.randint(1, 10)}
            ])
            last_data_time = current_time

        producer.send_frame(CAMERA, frame_bytes)

        time.sleep(1 / fps)

except Exception as e:
    print(f"Error occurred: {e}")

finally:
    device.release()
    cv2.destroyAllWindows()
