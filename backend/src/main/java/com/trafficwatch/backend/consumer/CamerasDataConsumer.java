package com.trafficwatch.backend.consumer;

import com.trafficwatch.backend.dtos.TrafficCameraKafkaRecord;
import com.trafficwatch.backend.model.TrafficCameraRecord;
import com.trafficwatch.backend.service.TrafficService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CamerasDataConsumer {

    private final Logger logger = LoggerFactory.getLogger(getClass().getName());
    private static final String CAMERAS_DATA_TOPIC = "cameras_data_topic";
    private static final String CAMERA_FRAME_TOPIC = "camera_frame_topic";
    private final TrafficService trafficService;

    @KafkaListener(topics = CAMERAS_DATA_TOPIC, groupId = "kafka-group")
    public void consumeData(TrafficCameraKafkaRecord message){
        logger.info("Received message: {}", message);

        try {
            trafficService.insertTrafficCameraRecord(message.getLabel(), convertToEntity(message));
        } catch (Exception e) {
            logger.error("Error processing message: {}", message, e);
        }
    }

    @KafkaListener(topics = CAMERA_FRAME_TOPIC, groupId = "kafka-group", containerFactory = "frameListenerContainerFactory")
    public void consumeFrame(@Header(KafkaHeaders.RECEIVED_KEY) String key, byte[] frame) {
        logger.info("Received frame for camera: {}", key);

        try {
            // Send the frame data via WebSocket to the frontend
            trafficService.broadcastFrame(key, frame);
            logger.info("Frame sent to WebSocket for camera: {}", key);
        } catch (Exception e) {
            logger.error("Error sending frame to WebSocket for camera: {}", key, e);
        }
    }

    private TrafficCameraRecord convertToEntity(TrafficCameraKafkaRecord record) {
        return new TrafficCameraRecord(record.getTimestamp(), record.getCategories());
    }
}
