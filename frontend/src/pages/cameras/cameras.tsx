// src/pages/CamerasPage.tsx
import React, { useState, useEffect } from 'react';
import { addCamera, fetchCameraDetails } from '../../services/camerasService';
import { TextField, Button, Typography } from '@mui/material';
import "../../styles/cameraspage.css";
import { TrafficCameraDetails, TrafficCameraDetailsId } from '../../interfaces/camera';
import CameraList from '../../components/dashboard/CameraList';

export default function CamerasPage() {
    const [cameras, setCameras] = useState<TrafficCameraDetailsId[]>([]);
    const [filteredCameras, setFilteredCameras] = useState<TrafficCameraDetailsId[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [newCamera, setNewCamera] = useState<TrafficCameraDetails>({label: '', location: '', status: '', resolution: '' });

    useEffect(() => {
        const fetchCamerasData = async () => {
            try {
                const cameras = await fetchCameraDetails();
                setCameras(cameras);
                setFilteredCameras(cameras);
            } catch (e) {
                setCameras([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCamerasData();
    }, []);

    useEffect(() => {
        setFilteredCameras(cameras.filter(camera =>
            camera.label.toLowerCase().includes(searchQuery.toLowerCase())
        ));
    }, [searchQuery, cameras]);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setNewCamera(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleAddCamera = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            const addedCamera = await addCamera(newCamera);
            setNewCamera({ label: '', location: '', status: '', resolution: '' });
            setCameras(prevCameras => [...prevCameras, addedCamera]);
            setSearchQuery('');
        } catch (e) {
            setError('Error adding camera.');
        }
    };

    if (loading) {
        return (
            <div className="loading">Loading...</div>
        );
    }

    if (error) {
        return (
            <div className="error">{error}</div>
        );
    }

    return (
        <div className="cameras-page">
            <Typography variant="h4" gutterBottom>Camera List</Typography>
            <TextField
                label="Search cameras..."
                variant="outlined"
                fullWidth
                margin="normal"
                value={searchQuery}
                onChange={handleSearchChange}
            />
            <CameraList cameras={filteredCameras}/>
            <div className="add-camera-form">
                <Typography variant="h6" mt={2} gutterBottom>Add New Camera</Typography>
                <form onSubmit={handleAddCamera}>
                    <TextField
                        label="Camera Label"
                        name="label"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={newCamera.label}
                        onChange={handleInputChange}
                        required
                    />
                    <TextField
                        label="Camera Location"
                        name="location"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={newCamera.location}
                        onChange={handleInputChange}
                        required
                    />
                    <TextField
                        label="Camera Status"
                        name="status"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={newCamera.status}
                        onChange={handleInputChange}
                        required
                    />
                    <TextField
                        label="Camera Resolution"
                        name="resolution"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={newCamera.resolution}
                        onChange={handleInputChange}
                        required
                    />
                    <Button type="submit" variant="contained" color="primary" fullWidth>
                        Add Camera
                    </Button>
                </form>
            </div>
        </div>
    );
}
