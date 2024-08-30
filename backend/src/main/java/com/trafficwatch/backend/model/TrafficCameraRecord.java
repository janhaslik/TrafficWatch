package com.trafficwatch.backend.model;

import com.trafficwatch.backend.persistence.TrafficCameraRecordCategory;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TrafficCameraRecord {

    private String timestamp;
    private List<TrafficCameraRecordCategory> categories;
}
