export interface TrafficCameraRecordWebSocket {
    label: string; 
    timestamp: string;
    objectsDetected: number;
}

export interface TrafficCameraRecord {
    timestamp: string;
    objectsDetected: number;
}
