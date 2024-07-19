import random
import time

import camera_data_producer

producer = camera_data_producer

CAMERA = "Camera 1"

while True:
    time.sleep(random.randint(1, 5))
    num = random.randint(3, 15)
    producer.send_data(CAMERA, num)
