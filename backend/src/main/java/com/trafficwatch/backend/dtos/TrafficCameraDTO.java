package com.trafficwatch.backend.dtos;

import com.trafficwatch.backend.persistence.TrafficCameraRecord;
import lombok.Data;

import java.util.List;

@Data
public class TrafficCameraDTO {
    private String label;

    private List<TrafficCameraRecord> records;

    public TrafficCameraDTO(String label, List<TrafficCameraRecord> records) {
        this.label = label;
        this.records = records;
    }
}
