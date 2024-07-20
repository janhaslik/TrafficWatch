package com.trafficwatch.backend.websocket;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.trafficwatch.backend.dtos.TrafficCameraKafkaRecord;
import com.trafficwatch.backend.persistence.TrafficCameraRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.HashSet;
import java.util.Set;

@Component
public class WebSocketHandler extends TextWebSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(WebSocketHandler.class);
    private final ObjectMapper mapper = new ObjectMapper();
    private final Set<WebSocketSession> sessions = new HashSet<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.add(session);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        sessions.remove(session);
    }

    public void broadcast(String label, TrafficCameraRecord message){
        synchronized (sessions) {
            for (WebSocketSession session : sessions) {
                if(!session.isOpen())continue;

                try {
                    session.sendMessage(new TextMessage(mapper.writeValueAsString(toTrafficCameraKafkaRecord(label, message))));
                }catch (IOException e){
                    log.error("Broadcast error: {}", e.getMessage());
                }
            }
        }
    }

    private TrafficCameraKafkaRecord toTrafficCameraKafkaRecord(String label, TrafficCameraRecord record){
        return new TrafficCameraKafkaRecord(label, record.getTimestamp(), record.getObjectsDetected());
    }

}
