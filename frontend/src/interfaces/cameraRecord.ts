export interface TrafficCameraRecordWebSocket {
    label: string; 
    timestamp: string;
    categories: TrafficCameraRecordCategory[]
}

export interface TrafficCameraRecord {
    timestamp: string;
    categories: TrafficCameraRecordCategory[]
}

interface TrafficCameraRecordCategory{
    category: 'Car' | 'Bus' | 'Motorbike'
    objectsDetected: number
}