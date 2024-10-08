package com.trafficwatch.backend.websocket;

import com.trafficwatch.backend.dtos.TrafficCameraKafkaRecord;
import com.trafficwatch.backend.model.TrafficCameraRecord;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WebSocketService {

    private static final Logger log = LoggerFactory.getLogger(WebSocketService.class);


    private final SimpMessagingTemplate messagingTemplate;

    public void broadcast(String label, TrafficCameraRecord record) {
        if (record == null) {
            log.warn("Attempted to broadcast a null TrafficCameraRecord for label: {}", label);
            return;
        }

        TrafficCameraKafkaRecord kafkaRecord = new TrafficCameraKafkaRecord(label, record.getTimestamp(), record.getCategories());
        messagingTemplate.convertAndSend("/topic/trafficcamerarecords", kafkaRecord);
    }

    public void sendToCamera(String id, String label, TrafficCameraRecord record) {
        if (record == null) {
            log.warn("Attempted to send a null TrafficCameraRecord for label: {}", label);
            return;
        }

        TrafficCameraKafkaRecord kafkaRecord = new TrafficCameraKafkaRecord(label, record.getTimestamp(), record.getCategories());
        messagingTemplate.convertAndSend("/topic/trafficcamerarecords/" + id, kafkaRecord);
    }

    // Method to broadcast video frames to the frontend via WebSocket
    public void broadcastFrame(String cameraId, byte[] frame) {
        if (frame == null || frame.length == 0) {
            log.warn("Attempted to broadcast an empty frame for camera: {}", cameraId);
            return;
        }

        messagingTemplate.convertAndSend("/topic/camera/frames/" + cameraId, frame);
        log.info("Broadcasted frame for camera: {}", cameraId);
    }
}

