package com.trafficwatch.backend.dtos;

import com.trafficwatch.backend.model.TrafficCameraRecord;
import lombok.Data;

import java.util.List;

@Data
public class TrafficCameraDTO {
    private String id;

    private String label;

    private String location;

    private String status;

    private String resolution;

    private List<TrafficCameraRecord> records;

    public TrafficCameraDTO(String id, String label, String location, String status, String resolution, List<TrafficCameraRecord> records) {
        this.id = id;
        this.label = label;
        this.location = location;
        this.records = records;
        this.status = status;
        this.resolution = resolution;
    }
}
