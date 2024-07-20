package com.trafficwatch.backend.configs;

import com.trafficwatch.backend.websocket.WebSocketHandler;
import com.trafficwatch.backend.websocket.WebSocketHandlerCameraSpecific;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(new WebSocketHandler(), "/trafficcamerarecords")
                .setAllowedOrigins("http://localhost:5173");
        registry.addHandler(new WebSocketHandlerCameraSpecific(), "/trafficcamerarecords/{label}")
                .setAllowedOrigins("http://localhost:5173");
    }
}
