package com.trafficwatch.backend.rest;

import com.trafficwatch.backend.dtos.NewTrafficCameraDTO;
import com.trafficwatch.backend.dtos.TrafficCameraDTO;
import com.trafficwatch.backend.dtos.TrafficCameraDetailsDTO;
import com.trafficwatch.backend.model.TrafficCamera;
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
    public ResponseEntity<List<TrafficCameraDTO>> getAllTrafficCameras(@RequestParam("active") Boolean active) {
        return ResponseEntity.ok().body(trafficService.getAllTrafficCameras(active));
    }

    @GetMapping("/cameras/details")
    public ResponseEntity<List<TrafficCameraDetailsDTO>> getAllTrafficCameraLabels() {
        return ResponseEntity.ok().body(trafficService.getAllTrafficCameraDetails());
    }

    @GetMapping("/cameras/{id}")
    public ResponseEntity<TrafficCameraDTO> getTrafficCamera(@PathVariable String id) throws Exception {
        return ResponseEntity.ok().body(trafficService.getCurrentDataForTrafficCamera(id));
    }

    @PostMapping("/cameras")
    public ResponseEntity<TrafficCamera> getTrafficCamera(@RequestBody NewTrafficCameraDTO trafficCamera) {
        return ResponseEntity.ok().body(trafficService.insertNewTrafficCamera(trafficCamera));
    }
}
