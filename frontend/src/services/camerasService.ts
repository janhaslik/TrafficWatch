// src/services/cameraService.ts

export interface CameraItemInterface {
    label: string;
    location: string;
}

export const fetchCameras = async (): Promise<CameraItemInterface[]> => {
    try {
        const response = await fetch('http://localhost:8080/api/v1/cameras');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.map((camera: any) => ({
            label: camera.label,
            location: camera.location || 'Unknown Location', // Adjust based on actual data
        }));
    } catch (error) {
        console.error('Error fetching cameras:', error);
        throw error; // Propagate the error to be handled by the calling function
    }
};

export const addCamera = async (camera: CameraItemInterface): Promise<CameraItemInterface> => {
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
