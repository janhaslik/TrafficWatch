package com.trafficwatch.backend;

import com.trafficwatch.backend.persistence.TrafficCameraRecord;
import com.trafficwatch.backend.service.TrafficService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDateTime;

@SpringBootTest
public class TrafficServiceTest {
    /*
    @Autowired
    private TrafficService trafficService;

    @Test
    void testInsertTrafficCameraRecord(){
        TrafficCameraRecord trafficCameraRecord = new TrafficCameraRecord(LocalDateTime.now(), 10);
        trafficService.insertTrafficCameraRecord("Camera 1", trafficCameraRecord);
    }*/
}
