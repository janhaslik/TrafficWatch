package com.trafficwatch.backend.persistence;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TrafficCameraRecord {

    private String timestamp;
    private int objectsDetected;
}
