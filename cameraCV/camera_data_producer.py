import json
from datetime import datetime
from kafka import KafkaProducer

# Initialize Kafka producer
producer = KafkaProducer(
    bootstrap_servers='kafka:9092',
    key_serializer=lambda k: k.encode('utf-8') if k is not None else None,
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)
TOPIC = "cameras_data_topic"

def send_data(key, objects_detected):
    data = {
        "label": "Camera 1",
        "timestamp": str(datetime.now().isoformat()),
        "objectsDetected": objects_detected
    }

    headers = [('type', b'com.trafficwatch.backend.dtos.TrafficCameraKafkaRecord')]

    future = producer.send(TOPIC, key=key, value=data, headers=headers)
    # Optionally wait for the result
    record_metadata = future.get(timeout=10)
    print(f"Message sent to topic {record_metadata.topic} partition {record_metadata.partition} at offset {record_metadata.offset}")
