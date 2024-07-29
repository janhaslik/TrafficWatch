package com.trafficwatch.backend.dtos;

import com.trafficwatch.backend.persistence.TrafficCameraRecord;
import lombok.Data;

import java.util.List;

@Data
public class TrafficCameraDetailsDTO {
    private String id;

    private String label;

    private String location;

    private String status;

    private String resolution;

    public TrafficCameraDetailsDTO(String id, String label, String location, String status, String resolution) {
        this.id = id;
        this.label = label;
        this.location = location;
        this.status = status;
        this.resolution = resolution;
    }
}
