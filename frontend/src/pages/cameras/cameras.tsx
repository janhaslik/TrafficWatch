// src/pages/CamerasPage.tsx
import React, { useState, useEffect } from 'react';
import { fetchCameras, addCamera, CameraItemInterface } from '../../services/camerasService';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Button, Typography } from '@mui/material';
import "../../styles/cameraspage.css";

export default function CamerasPage() {
    const [cameras, setCameras] = useState<CameraItemInterface[]>([]);
    const [filteredCameras, setFilteredCameras] = useState<CameraItemInterface[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [newCamera, setNewCamera] = useState<{ label: string; location: string }>({ label: '', location: '' });

    useEffect(() => {
        const fetchCamerasData = async () => {
            try {
                const cameras = await fetchCameras();
                setCameras(cameras);
                setFilteredCameras(cameras);
            } catch (e) {
                //setError("Error fetching cameras")
                setCameras([{ label: "Camera 1", location: "Zurich" }, { label: "Camera 2", location: "Zurich" }]);
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
            setNewCamera({ label: '', location: '' });
            setCameras(prevCameras => [...prevCameras, addedCamera]);
            setSearchQuery(''); // Reset search query
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
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Label</TableCell>
                            <TableCell>Location</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredCameras.length > 0 ? (
                            filteredCameras.map((camera, index) => (
                                <TableRow key={index}>
                                    <TableCell>{camera.label}</TableCell>
                                    <TableCell>{camera.location}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={2}>No cameras available.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <div className="add-camera-form">
                <Typography variant="h6" gutterBottom>Add New Camera</Typography>
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
                    <Button type="submit" variant="contained" color="primary" fullWidth>
                        Add Camera
                    </Button>
                </form>
            </div>
        </div>
    );
}
