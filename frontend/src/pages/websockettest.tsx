import React, { useState, useEffect } from 'react';
import { Client, Message } from '@stomp/stompjs';
import { Container, Typography, Paper, CircularProgress, Button, ButtonGroup, Grid } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrafficCameraRecordWebSocket } from '../interfaces/cameraRecord';
import { fetchCameraRecords } from '../services/cameraWebsocket';

const SOCKET_URL = 'ws://localhost:8080/ws';
const TOPIC = '/topic/trafficcamerarecords';

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
        const client = new Client({
            brokerURL: SOCKET_URL,
            connectHeaders: {},
            debug: function (str) {
                console.log('STOMP: ' + str);
            },
            onConnect: () => {
                client.subscribe(TOPIC, (message: Message) => {
                    try {
                        const updatedRecord: TrafficCameraRecordWebSocket = JSON.parse(message.body);
                        setRecords(prevRecords => {
                            const existingRecordIndex = prevRecords.findIndex(record =>
                                record.label === updatedRecord.label && record.timestamp === updatedRecord.timestamp
                            );

                            if (existingRecordIndex >= 0) {
                                const updatedRecords = [...prevRecords];
                                updatedRecords[existingRecordIndex] = updatedRecord;
                                return updatedRecords;
                            } else {
                                return [...prevRecords, updatedRecord];
                            }
                        });
                    } catch (e) {
                        console.error('Error parsing WebSocket message:', e);
                    }
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error:', frame.headers['message']);
                console.error('Additional details:', frame.body);
            },
            reconnectDelay: 5000,
        });

        client.activate();

        return () => {
            client.deactivate();
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
                totalObjectsDetected += category.objectsDetected;
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
                                    {['Car', 'Bus', 'Motorbike'].map((category, index) => (
                                        <Line key={index} type="monotone" dataKey={category} stroke={['#ffbb28', '#00c49f', '#ff8042'][index]} />
                                    ))}
                                </LineChart>
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
                                    <Pie
                                        data={categoryDistribution}
                                        dataKey="value"
                                        nameKey="category"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={150}
                                        fill="#8884d8"
                                        label
                                    >
                                        {categoryDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={['#ffbb28', '#00c49f', '#ff8042'][index]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
}
