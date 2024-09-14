// src/pages/CamerasPage.tsx
import React, { useState, useEffect } from 'react';
import { addCamera, fetchCameraDetails } from '../../services/camerasService';
import { TextField, Typography, Modal, Box, Grid } from '@mui/material';
import { TrafficCameraDetails, TrafficCameraDetailsId } from '../../interfaces/camera';
import CameraList from '../../components/dashboard/CameraList';
import "../../styles/cameraspage.css";
import DefaultButton from '../../components/buttons/DefaultButton';

// Style for the modal
const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: 1,
  boxShadow: 24,
  p: 4,
};

export default function CamerasPage() {
    const [cameras, setCameras] = useState<TrafficCameraDetailsId[]>([]);
    const [filteredCameras, setFilteredCameras] = useState<TrafficCameraDetailsId[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [newCamera, setNewCamera] = useState<TrafficCameraDetails>({ label: '', location: '', status: '', resolution: '' });
    const [openModal, setOpenModal] = useState(false);

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

    const handleAddCamera = async () => {
        try {
            const addedCamera = await addCamera(newCamera);
            setNewCamera({ label: '', location: '', status: '', resolution: '' });
            setCameras(prevCameras => [...prevCameras, addedCamera]);
            setSearchQuery('');
            setOpenModal(false);
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
            <Grid container spacing={2} alignItems="center">
                <Grid item xs>
                    <TextField
                        label="Search cameras..."
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                </Grid>
                <Grid item>
                    <DefaultButton onClick={() => setOpenModal(true)} label='Add Camera'/>
                </Grid>
            </Grid>
            <CameraList cameras={filteredCameras} />

            <Modal
                open={openModal}
                onClose={() => setOpenModal(false)}
                aria-labelledby="add-camera-modal"
                aria-describedby="modal-for-adding-new-camera"
            >
                <Box sx={modalStyle}>
                    <Typography variant="h6" gutterBottom>
                        Add New Camera
                    </Typography>
                    <Grid container spacing={1}>
                        <Grid item xs={12}>
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
                        </Grid>
                        <Grid item xs={12}>
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
                        </Grid>
                        <Grid item xs={12}>
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
                        </Grid>
                        <Grid item xs={12}>
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
                        </Grid>
                        <Grid item xs={12}>
                            <DefaultButton onClick={handleAddCamera} label='Add Camera'/>
                        </Grid>
                    </Grid> 
                </Box>
            </Modal>
        </div>
    );
}
