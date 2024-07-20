package com.trafficwatch.backend.persistence;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TrafficCameraRepository extends MongoRepository<TrafficCamera, String> {

    @Query(value = "{ 'records.timestamp' : { $gte: ?0 } }")
    List<TrafficCamera> findCamerasWithRecentRecords(LocalDateTime from);

    @Query(value = "{}", fields = "{ 'label': 1, '_id': 0 }")
    List<String> findAllLabels();

    TrafficCamera findByLabel(String label);
}
