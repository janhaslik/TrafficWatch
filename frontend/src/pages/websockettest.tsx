import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, CircularProgress, Button, ButtonGroup, Grid } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrafficCameraRecordWebSocket } from '../interfaces/cameraRecord';  // Update this import if necessary
import { fetchCameraRecords, initializeWebSocketClient } from '../services/cameraWebsocket';

export default function WebSocketTest() {
    const [records, setRecords] = useState<TrafficCameraRecordWebSocket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'day' | 'hour' | 'minute'>('hour');

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const cameras = await fetchCameraRecords();
                const allRecords: TrafficCameraRecordWebSocket[] = cameras.flatMap(camera =>
                    camera.records.map(record => ({
                        label: camera.label,
                        timestamp: record.timestamp,
                        categories: record.categories || []
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
        const ws = initializeWebSocketClient(updatedRecord => {
            setRecords(prevRecords => {
                const existingRecordIndex = prevRecords.findIndex(record =>
                    record.label === updatedRecord.label && record.timestamp === updatedRecord.timestamp
                );

                if (existingRecordIndex >= 0) {
                    const updatedRecords = [...prevRecords];
                    updatedRecords[existingRecordIndex] = updatedRecord;
                    return updatedRecords;
                } else {
                    return [updatedRecord, ...prevRecords];
                }
            });
        });

        return () => {
            ws.close();
        };
    }, []);

    const aggregateData = (records: TrafficCameraRecordWebSocket[], filter: 'day' | 'minute' | 'hour') => {
        const aggregated: Record<string, number> = {};

        records.forEach(record => {
            const date = new Date(record.timestamp);
            let dateString: string;

            if (filter === 'day') {
                dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
            } else if (filter === 'minute') {
                dateString = date.toISOString().split('T')[0] + ' ' + date.toTimeString().split(' ')[0]; // YYYY-MM-DD HH:MM:SS
            } else {
                dateString = date.toISOString().split('T')[0] + ' ' + date.toTimeString().split(' ')[0].split(':')[0]; // YYYY-MM-DD HH
            }

            if (!aggregated[dateString]) {
                aggregated[dateString] = 0;
            }

            aggregated[dateString] += record.categories.reduce((acc, category) => acc + category.objectsDetected, 0);
        });

        return Object.entries(aggregated).map(([date, totalObjectsDetected]) => ({
            date,
            totalObjectsDetected
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    };

    const aggregateCategoryData = (records: TrafficCameraRecordWebSocket[], filter: 'day' | 'minute' | 'hour') => {
        const aggregatedByCategory: Record<string, Record<string, number>> = {};

        records.forEach(record => {
            const date = new Date(record.timestamp);
            let dateString: string;

            if (filter === 'day') {
                dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
            } else if (filter === 'minute') {
                dateString = date.toISOString().split('T')[0] + ' ' + date.toTimeString().split(' ')[0]; // YYYY-MM-DD HH:MM:SS
            } else {
                dateString = date.toISOString().split('T')[0] + ' ' + date.toTimeString().split(' ')[0].split(':')[0]; // YYYY-MM-DD HH
            }

            if (!aggregatedByCategory[dateString]) {
                aggregatedByCategory[dateString] = { Car: 0, Bus: 0, Motorbike: 0 };
            }

            record.categories.forEach(category => {
                aggregatedByCategory[dateString][category.category] += category.objectsDetected;
            });
        });

        return Object.entries(aggregatedByCategory).map(([date, categories]) => ({
            date,
            ...categories
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    };

    const aggregateCategoryDistribution = (records: TrafficCameraRecordWebSocket[]) => {
        const categoryCounts: Record<string, number> = { 'Car': 0, 'Bus': 0, 'Motorbike': 0 };
        let totalObjectsDetected = 0;

        records.forEach(record => {
            record.categories.forEach(category => {
                categoryCounts[category.category] += category.objectsDetected;
                totalObjectsDetected += category.objectsDetected
            });
        });


        return Object.entries(categoryCounts).map(([category, count]) => ({
            category,
            value: (count / totalObjectsDetected) * 100
        }));
    };

    const aggregatedRecords = aggregateData(records, filter);
    const aggregatedByCategory = aggregateCategoryData(records, filter);
    const categoryDistribution = aggregateCategoryDistribution(records);

    if (loading) {
        return (
            <Container component="main" maxWidth={false} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', padding: 2 }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container component="main" maxWidth={false} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', padding: 2 }}>
                <Paper elevation={3} sx={{ padding: 3, textAlign: 'center' }}>
                    <Typography variant="h5" color="error">
                        {error}
                    </Typography>
                </Paper>
            </Container>
        );
    }

    return (
        <Container component="main" maxWidth={false} sx={{ padding: 2 }}>
            <Paper elevation={3} sx={{ padding: 3 }}>
                <Typography variant="h4" gutterBottom textAlign={'center'}>
                    Aggregated Traffic Camera Records
                </Typography>
                <ButtonGroup variant="contained" aria-label="filter buttons" sx={{ marginBottom: 2 }}>
                    <Button onClick={() => setFilter('day')}>By Day</Button>
                    <Button onClick={() => setFilter('hour')}>By Hour</Button>
                    <Button onClick={() => setFilter('minute')}>By Minute</Button>
                </ButtonGroup>

                <Grid container spacing={4}>
                    <Grid item xs={12} sm={6}>
                        <Paper elevation={3} sx={{ padding: 3 }}>
                            <Typography variant="h6" gutterBottom textAlign={'center'}>
                                Total Objects Detected
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
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Paper elevation={3} sx={{ padding: 3 }}>
                            <Typography variant="h6" gutterBottom textAlign={'center'}>
                                Objects Detected by Category
                            </Typography>
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart data={aggregatedByCategory}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="Car" stroke="#8884d8" />
                                    <Line type="monotone" dataKey="Bus" stroke="#82ca9d" />
                                    <Line type="monotone" dataKey="Motorbike" stroke="#ffc658" />
                                </LineChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Paper elevation={3} sx={{ padding: 3}}>
                            <Typography variant="h6" gutterBottom textAlign={'center'}>
                                Cameras List
                            </Typography>
                            <ResponsiveContainer width="100%" height={400}>
                                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
                                    {["Camera 1", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a"].map((m: string) => (
                                        <span key={m} style={{ padding: '8px 0' }}>{m}</span>
                                    ))}
                                </div>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Paper elevation={3} sx={{ padding: 3 }}>
                            <Typography variant="h6" gutterBottom textAlign={'center'}>
                                Category Distribution
                            </Typography>
                            <ResponsiveContainer width="100%" height={400}>
                                <PieChart>
                                    <Pie data={categoryDistribution}
                                        dataKey="value"
                                        nameKey="category"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={150}
                                        label={({ name, percent }) => `${name}: ${Math.round(percent * 100)}%`}>
                                        {categoryDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={['#8884d8', '#82ca9d', '#ffc658'][index]} />
                                        ))}
                                    </Pie>
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
}
