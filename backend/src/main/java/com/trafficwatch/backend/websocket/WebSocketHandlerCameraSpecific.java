package com.trafficwatch.backend.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.trafficwatch.backend.persistence.TrafficCameraRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@Component
public class WebSocketHandlerCameraSpecific extends TextWebSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(WebSocketHandlerCameraSpecific.class);
    private final ObjectMapper mapper = new ObjectMapper();
    private final Map<String, WebSocketSession> cameraSessions = new HashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String label = (String) session.getAttributes().get("label");
        if (label != null) {
            cameraSessions.put(label, session);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String label = (String) session.getAttributes().get("label");
        if (label != null) {
            cameraSessions.remove(label);
        }
    }

    public void sendToCamera(String label, TrafficCameraRecord record) {
        WebSocketSession session = cameraSessions.get(label);
        if (session != null && session.isOpen()) {
            try {
                session.sendMessage(new TextMessage(mapper.writeValueAsString(record)));
            } catch (IOException e) {
                log.error("Send error: {}", e.getMessage());
            }
        }
    }
}

