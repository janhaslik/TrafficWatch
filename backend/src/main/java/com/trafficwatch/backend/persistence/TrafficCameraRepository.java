package com.trafficwatch.backend.persistence;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrafficCameraRepository extends MongoRepository<TrafficCamera, String> {

    @Query(value = "{}")
    List<TrafficCamera> findAll();

    @Query(value = "{}", fields = "{ 'label': 1, '_id': 0 }")
    List<String> findAllLabels();

    TrafficCamera findByLabel(String label);
}
