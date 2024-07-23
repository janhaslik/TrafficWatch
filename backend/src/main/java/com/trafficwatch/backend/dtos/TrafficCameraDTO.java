package com.trafficwatch.backend.dtos;

import com.trafficwatch.backend.persistence.TrafficCameraRecord;
import lombok.Data;

import java.util.List;

@Data
public class TrafficCameraDTO {
    private String label;

    private String location;

    private List<TrafficCameraRecord> records;

    public TrafficCameraDTO(String label, String location, List<TrafficCameraRecord> records) {
        this.label = label;
        this.location = location;
        this.records = records;
    }
}
