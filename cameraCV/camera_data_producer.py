from kafka import KafkaProducer
import json
from datetime import datetime

# Initialize Kafka producer
producer = KafkaProducer(
    bootstrap_servers='kafka:9092',
    key_serializer=lambda k: k.encode('utf-8') if k is not None else None,
    value_serializer=lambda v: v  # Binary data should not be JSON serialized
)
DATA_TOPIC = "cameras_data_topic"
FRAME_TOPIC = "camera_frame_topic"


def send_data(key, categories):
    data = {
        "label": "Camera 1",
        "timestamp": str(datetime.now().isoformat()),
        "categories": categories
    }

    try:
        # Send data to the DATA_TOPIC
        future = producer.send(DATA_TOPIC, key=key, value=json.dumps(data).encode('utf-8'))
        record_metadata = future.get(timeout=10)
        print(
            f"Message sent to topic {record_metadata.topic} partition {record_metadata.partition} at offset {record_metadata.offset}")

    except Exception as e:
        print(f"Failed to send data: {e}")


def send_frame(key, frame):
    """
    Sends a binary frame to Kafka.

    :param key: Key for the Kafka message (e.g., camera ID or name)
    :param frame: Binary frame data to be sent (e.g., JPEG bytes of an image)
    """
    try:
        # Sending the frame data to the FRAME_TOPIC
        future = producer.send(FRAME_TOPIC, key=key, value=frame)
        record_metadata = future.get(timeout=10)
        print(
            f"Frame sent to topic {record_metadata.topic} partition {record_metadata.partition} at offset {record_metadata.offset}")

    except Exception as e:
        print(f"Failed to send frame: {e}")
