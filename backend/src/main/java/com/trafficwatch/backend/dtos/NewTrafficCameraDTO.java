package com.trafficwatch.backend.dtos;

import lombok.Data;

@Data
public class NewTrafficCameraDTO {
    private String label;
    private String location;
    private String status;
    private String resolution;
}
