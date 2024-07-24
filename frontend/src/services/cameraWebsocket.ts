import { TrafficCamera } from '../interfaces/camera';


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





