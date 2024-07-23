import { TrafficCamera } from '../interfaces/camera';
import { TrafficCameraRecordWebSocket } from '../interfaces/cameraRecord';

export const fetchCameraRecords = async (): Promise<TrafficCamera[]> => {
    try {
        const response = await fetch('http://localhost:8080/api/v1/cameras');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching camera records:', error);
        throw error;
    }
};

export const initializeWebSocketClient = (onMessage: (message: TrafficCameraRecordWebSocket) => void) => {
    const ws = new WebSocket('ws://localhost:8080/ws');

    ws.addEventListener("open", () => {
        console.log('WebSocket connection opened');
    });

    ws.addEventListener("message", event => {
        try {
            const updatedRecord: TrafficCameraRecordWebSocket = JSON.parse(event.data);
            onMessage(updatedRecord);
        } catch (e) {
            console.error('Error parsing WebSocket message:', e);
        }
    });

    ws.addEventListener("error", error => {
        console.error('WebSocket error:', error);
    });

    ws.addEventListener("close", () => {
        console.log('WebSocket connection closed');
    });

    return ws;
};
