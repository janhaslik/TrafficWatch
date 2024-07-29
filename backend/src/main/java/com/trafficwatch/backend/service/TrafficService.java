package com.trafficwatch.backend.service;

import com.mongodb.client.result.UpdateResult;
import com.trafficwatch.backend.dtos.NewTrafficCameraDTO;
import com.trafficwatch.backend.dtos.TrafficCameraDTO;
import com.trafficwatch.backend.dtos.TrafficCameraDetailsDTO;
import com.trafficwatch.backend.persistence.TrafficCamera;
import com.trafficwatch.backend.persistence.TrafficCameraRepository;
import com.trafficwatch.backend.persistence.TrafficCameraRecord;
import com.trafficwatch.backend.websocket.WebSocketService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor()
@Transactional
public class TrafficService {

    private static final Logger log = LoggerFactory.getLogger(TrafficService.class);
    private final TrafficCameraRepository trafficCameraRepository;

    @Autowired
    private WebSocketService webSocketService;

    @Autowired
    private MongoTemplate mongoTemplate;

    public List<TrafficCameraDTO> getAllTrafficCameras(boolean active) {
        List<TrafficCamera> trafficCameras;

        if (active) {
            trafficCameras = trafficCameraRepository.findActiveCameras();
        } else {
            trafficCameras = trafficCameraRepository.findAll();
        }

        return trafficCameras.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<TrafficCameraDTO> getCamerasWithRecentRecords() {
        LocalDateTime from = LocalDateTime.now().minusDays(1);
        return trafficCameraRepository.findCamerasWithRecentRecords(from)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public TrafficCameraDTO getCurrentDataForTrafficCamera(String label){
        LocalDate localDate = LocalDate.now();
        TrafficCamera camera = trafficCameraRepository.findByLabel(label);
        return convertToDTO(camera);
    }

    public TrafficCamera insertNewTrafficCamera(NewTrafficCameraDTO trafficCamera){
        TrafficCamera newTrafficCamera = new TrafficCamera(null, trafficCamera.getLabel(), trafficCamera.getLocation(), trafficCamera.getStatus(), trafficCamera.getResolution(), Collections.emptyList());
        return trafficCameraRepository.save(newTrafficCamera);
    }

    public void insertTrafficCameraRecord(String label, TrafficCameraRecord record) {
        if (record == null) {
            log.warn("Attempted to insert a null TrafficCameraRecord for label: {}", label);
            return;
        }

        Query query = new Query(Criteria.where("label").is(label));
        Update update = new Update().push("records", record);

        try {
            UpdateResult result = mongoTemplate.updateFirst(query, update, TrafficCamera.class);
            if (result.getModifiedCount() > 0) {
                log.info("Traffic Camera record inserted for Camera: {}, Objects detected: {}", label, record.getCategories());
                webSocketService.broadcast(label, record);
                webSocketService.sendToCamera(label, record);
            }
        } catch (Exception e) {
            log.error("Error inserting Traffic Camera record for Camera: {}", label, e);
        }
    }

    private TrafficCameraDTO convertToDTO(TrafficCamera camera) {
        return new TrafficCameraDTO(camera.getId(), camera.getLabel(), camera.getLocation(), camera.getStatus(), camera.getResolution(),camera.getRecords());
    }

    public List<TrafficCameraDetailsDTO> getAllTrafficCameraDetails() {
        return trafficCameraRepository.findCameraDetails().stream().toList();
    }
}
