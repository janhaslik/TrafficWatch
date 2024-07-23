package com.trafficwatch.backend.dtos;

import com.trafficwatch.backend.persistence.TrafficCameraRecordCategory;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TrafficCameraKafkaRecord {

    private String label;
    private String timestamp;
    private List<TrafficCameraRecordCategory> categories;

}
