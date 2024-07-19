package com.trafficwatch.backend.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TrafficCameraKafkaRecord {

    private String label;
    private String timestamp;
    private int objectsDetected;
}
