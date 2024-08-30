// src/services/cameraService.ts

import { TrafficCamera, TrafficCameraDetails, TrafficCameraDetailsId } from "../interfaces/camera";


export const fetchCameras = async (): Promise<TrafficCamera[]> => {
    try {
        const response = await fetch('http://localhost:8080/api/v1/cameras?active=true');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching cameras:', error);
        throw error;
    }
};

export const fetchCamera = async (id: string): Promise<TrafficCamera> => {
    try {
        const response = await fetch(`http://localhost:8080/api/v1/cameras/${id}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching cameras:', error);
        throw error;
    }
};

export const fetchCameraDetails = async (): Promise<TrafficCameraDetailsId[]> => {
    try {
        const response = await fetch('http://localhost:8080/api/v1/cameras/details');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching camera details:', error);
        throw error;
    }
};

export const addCamera = async (camera: TrafficCameraDetails): Promise<TrafficCameraDetailsId> => {
    try {
        const response = await fetch('http://localhost:8080/api/v1/cameras', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(camera),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return await response.json();
    } catch (error) {
        console.error('Error adding camera:', error);
        throw error; // Propagate the error to be handled by the calling function
    }
};
