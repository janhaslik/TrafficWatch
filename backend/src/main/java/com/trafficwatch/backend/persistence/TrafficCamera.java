package com.trafficwatch.backend.persistence;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "traffic_cameras")
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class TrafficCamera {

    @Id
    private String id;

    private String label;

    private List<TrafficCameraRecord> records;
}
