import { useState, useEffect } from 'react';
import { Client, Message } from '@stomp/stompjs';
import { Container, Typography, Paper, CircularProgress, Button, ButtonGroup, Grid } from '@mui/material';
import { TrafficCameraRecord, TrafficCameraRecordWebSocket } from '../../interfaces/cameraRecord';
import { fetchCamera } from '../../services/camerasService';
import SingleLineChart from '../../components/dashboard/SingleLineChart';
import DistributionPieChart from '../../components/dashboard/PieChart';
import MultiLineChart from '../../components/dashboard/MultiLineChart';
import { TrafficCamera } from '../../interfaces/camera';
import { useParams } from 'react-router-dom';
import LiveCamera from '../../components/dashboard/LiveCamera';

const SOCKET_URL: string = 'ws://localhost:8080/ws';

export default function CameraDashboard() {
    const [records, setRecords] = useState<TrafficCameraRecordWebSocket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'day' | 'hour' | 'minute' | 'second'>('minute');
    const params = useParams()
    const id: string | undefined = params["id"]

    const TOPIC: string = `/topic/trafficcamerarecords/${id}`;


    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                if (id) {
                    const camera: TrafficCamera = await fetchCamera(id);
                    const allRecords: TrafficCameraRecordWebSocket[] = [];

                    camera.records.forEach((record: TrafficCameraRecord) => {
                        allRecords.push({label: camera.label, timestamp: record.timestamp, categories: record.categories})
                    })
                    setRecords(allRecords);
                }
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

    const aggregateData = (records: TrafficCameraRecordWebSocket[], filter: 'day' | 'second' | 'minute' | 'hour') => {
        const aggregated: Record<string, number> = {};

        records.forEach(record => {
            const date = new Date(record.timestamp);
            let dateString: string;

            if (filter === 'day') {
                dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
            } else if (filter === 'minute') {
                dateString = date.toISOString().split('T')[0] + ' ' + date.toTimeString().split(' ')[0].split(':')[0] + ":" + date.toTimeString().split(' ')[0].split(':')[1]; // YYYY-MM-DD HH:MM
            } else if (filter === 'second'){
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

    const aggregateCategoryData = (records: TrafficCameraRecordWebSocket[], filter: 'day' | 'second' | 'minute' | 'hour') => {
        const aggregatedByCategory: Record<string, Record<string, number>> = {};

        records.forEach(record => {
            const date = new Date(record.timestamp);
            let dateString: string;

            if (filter === 'day') {
                dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
            } else if (filter === 'minute') {
                dateString = date.toISOString().split('T')[0] + ' ' + date.toTimeString().split(' ')[0].split(':')[0] + ":" + date.toTimeString().split(' ')[0].split(':')[1]; // YYYY-MM-DD HH:MM
            } else if (filter === 'second'){
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
                    Traffic Camera
                </Typography>
                <ButtonGroup variant="contained" aria-label="filter buttons" sx={{ marginBottom: 2 }}>
                    <Button onClick={() => setFilter('day')}>By Day</Button>
                    <Button onClick={() => setFilter('hour')}>By Hour</Button>
                    <Button onClick={() => setFilter('minute')}>By Minute</Button>
                    <Button onClick={() => setFilter('second')}>By Second</Button>
                </ButtonGroup>

                <Grid container spacing={4}>
                    <Grid item xs={12} sm={6}>
                        <SingleLineChart records={aggregatedRecords}/>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <MultiLineChart records={aggregatedByCategory}/>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <LiveCamera/>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <DistributionPieChart records={categoryDistribution}/>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
}
