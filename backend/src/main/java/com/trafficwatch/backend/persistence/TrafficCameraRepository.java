package com.trafficwatch.backend.persistence;

import com.trafficwatch.backend.dtos.TrafficCameraDetailsDTO;
import com.trafficwatch.backend.model.TrafficCamera;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TrafficCameraRepository extends MongoRepository<TrafficCamera, String> {

    @Query(value = "{ 'records.timestamp' : { $gte: ?0 } }")
    List<TrafficCamera> findCamerasWithRecentRecords(LocalDateTime from);

    @Query(value = "{ 'status': 'Active'}")
    List<TrafficCamera> findActiveCameras();

    @Query(value = "{}", fields = "{ 'label': 1, '_id': 0 }")
    List<String> findAllLabels();

    @Query(fields = "{'label' : 1}")
    String findByLabel(String label);

    @Query(value = "{}", fields = "{ 'id': '$_id', 'label': 1, 'location': 1, 'status': 1, 'resolution': 1}")
    List<TrafficCameraDetailsDTO> findCameraDetails();
}
