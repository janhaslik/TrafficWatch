package com.trafficwatch.backend.persistence;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TrafficCameraRecordCategory {

    private String category;
    private int objectsDetected;

}
