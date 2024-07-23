import random
import time

import camera_data_producer

producer = camera_data_producer

CAMERA = "Camera 1"

categories = ["Car", "Bus", "Motorbike"]

while True:
    time.sleep(random.randint(1, 5))
    producer.send_data(CAMERA,
                       [{'category': 'Car', 'objectsDetected': random.randint(3, 15)}, {'category': 'Bus', "objectsDetected": random.randint(3, 15)}, {'category': 'Motorbike', "objectsDetected": random.randint(3, 15)}])
