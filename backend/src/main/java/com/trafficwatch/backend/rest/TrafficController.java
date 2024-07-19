package com.trafficwatch.backend.rest;

import com.trafficwatch.backend.dtos.NewTrafficCameraDTO;
import com.trafficwatch.backend.dtos.TrafficCameraDTO;
import com.trafficwatch.backend.persistence.TrafficCamera;
import com.trafficwatch.backend.service.TrafficService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class TrafficController {

    private final TrafficService trafficService;

    @GetMapping("/cameras")
    public ResponseEntity<List<TrafficCameraDTO>> getAllTrafficCameras() {
        return ResponseEntity.ok().body(trafficService.getAllTrafficCameras());
    }

    @GetMapping("/cameras/details")
    public ResponseEntity<List<String>> getAllTrafficCameraDetails() {
        return ResponseEntity.ok().body(trafficService.getAllTrafficCameraLabels());
    }

    @GetMapping("/cameras/{label}")
    public ResponseEntity<TrafficCameraDTO> getTrafficCamera(@PathVariable String label) {
        return ResponseEntity.ok().body(trafficService.getCurrentDataForTrafficCamera(label));
    }

    @PostMapping("/cameras")
    public ResponseEntity<TrafficCamera> getTrafficCamera(@RequestBody NewTrafficCameraDTO trafficCamera) {
        return ResponseEntity.ok().body(trafficService.insertNewTrafficCamera(trafficCamera));
    }
}
