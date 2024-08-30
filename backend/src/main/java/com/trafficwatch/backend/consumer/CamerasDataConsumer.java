package com.trafficwatch.backend.consumer;

import com.trafficwatch.backend.dtos.TrafficCameraKafkaRecord;
import com.trafficwatch.backend.model.TrafficCameraRecord;
import com.trafficwatch.backend.service.TrafficService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CamerasDataConsumer {

    private final Logger logger = LoggerFactory.getLogger(getClass().getName());
    private static final String CAMERAS_DATA_TOPIC = "cameras_data_topic";
    private final TrafficService trafficService;

    @KafkaListener(topics = CAMERAS_DATA_TOPIC, groupId = "kafka-group")
    public void consumeData(TrafficCameraKafkaRecord message){
        logger.info("Received message: {}", message);

        try {
            trafficService.insertTrafficCameraRecord(message.getLabel(), convertToEntity(message));
        }catch (Exception e){
            logger.error("Error processing message: {}", message, e);
        }
    }

    private TrafficCameraRecord convertToEntity(TrafficCameraKafkaRecord record) {
        return new TrafficCameraRecord(record.getTimestamp(), record.getCategories());
    }
}
