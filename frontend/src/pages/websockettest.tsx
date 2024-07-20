import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, CircularProgress } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrafficCamera } from '../interfaces/camera';
import { TrafficCameraRecordWebSocket, TrafficCameraRecord } from '../interfaces/cameraRecord';

// Define an interface to unify records with or without labels
interface UnifiedTrafficCameraRecord {
    label: string;
    timestamp: string;
    objectsDetected: number;
}

const WebSocketTest: React.FC = () => {
    const [records, setRecords] = useState<UnifiedTrafficCameraRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Fetch all traffic cameras and their records
        const fetchInitialData = async () => {
            try {
                const responseCameras = await fetch('http://localhost:8080/api/v1/cameras');
                if (!responseCameras.ok) {
                    throw new Error('Network response was not ok');
                }
                const cameras: TrafficCamera[] = await responseCameras.json();

                // Flatten all records into a single list
                const allRecords: UnifiedTrafficCameraRecord[] = cameras.flatMap(camera =>
                    camera.records.map(record => ({
                        label: camera.label,  // Use camera label for identification
                        timestamp: record.timestamp,
                        objectsDetected: record.objectsDetected
                    }))
                );

                setRecords(allRecords);
            } catch (e) {
                console.error('Error fetching data:', e);
                setError('Error fetching data.');
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    useEffect(() => {
        // WebSocket connection
        const connectWebSocket = () => {
            const socket = new WebSocket('ws://localhost:8080/trafficcamerarecords');

            socket.onopen = () => {
                console.log('WebSocket is open now.');
            };

            socket.onmessage = (event) => {
                try {
                    const updatedRecord: TrafficCameraRecordWebSocket = JSON.parse(event.data);
                    setRecords(prevRecords => {
                        // Replace or add the WebSocket record in the state
                        const existingRecordIndex = prevRecords.findIndex(record => 
                            record.label === updatedRecord.label && record.timestamp === updatedRecord.timestamp
                        );

                        if (existingRecordIndex >= 0) {
                            // Replace the existing record with the updated one
                            const updatedRecords = [...prevRecords];
                            updatedRecords[existingRecordIndex] = updatedRecord;
                            return updatedRecords;
                        } else {
                            // Add the new record
                            return [updatedRecord, ...prevRecords];
                        }
                    });
                } catch (e) {
                    console.error('Error parsing WebSocket message:', e);
                    setError('Error processing data from WebSocket.');
                }
            };

            socket.onclose = () => {
                console.log('WebSocket is closed now.');
                setTimeout(connectWebSocket, 5000);
            };

            socket.onerror = (error) => {
                console.error('WebSocket error:', error);
                setError('WebSocket error. Please check your connection.');
            };

            return socket;
        };

        const socket = connectWebSocket();

        return () => {
            socket.close();
        };
    }, []);

    const aggregateData = (records: UnifiedTrafficCameraRecord[]) => {
        const aggregated: Record<string, number> = {};

        records.forEach(record => {
            // Extract the date part of the timestamp
            const date = new Date(record.timestamp);
            const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD

            if (!aggregated[dateString]) {
                aggregated[dateString] = 0;
            }
            aggregated[dateString] += record.objectsDetected;
        });

        return Object.entries(aggregated).map(([date, totalObjectsDetected]) => ({
            date,
            totalObjectsDetected
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    };

    const aggregatedRecords = aggregateData(records);

    if (loading) {
        return (
            <Container component="main" maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container component="main" maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Paper elevation={3} sx={{ padding: 3, textAlign: 'center' }}>
                    <Typography variant="h5" color="error">
                        {error}
                    </Typography>
                </Paper>
            </Container>
        );
    }

    return (
        <Container component="main" maxWidth="md">
            <Paper elevation={3} sx={{ padding: 3, marginTop: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Aggregated Traffic Camera Records
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={aggregatedRecords}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="totalObjectsDetected" stroke="#8884d8" />
                    </LineChart>
                </ResponsiveContainer>
            </Paper>
        </Container>
    );
};

export default WebSocketTest;
