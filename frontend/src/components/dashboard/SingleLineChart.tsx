import { Typography, Paper} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from 'recharts';

interface SingleLineChartProps{
    records: { date: string; totalObjectsDetected: number; }[]
}

export default function SingleLineChart(data: SingleLineChartProps) {

    return (
        <Paper elevation={3} sx={{ padding: 3 }}>
            <Typography variant="h6" gutterBottom textAlign={'center'}>
                Total Objects Detected
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data.records}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="totalObjectsDetected" stroke="#8884d8" />
                </LineChart>
            </ResponsiveContainer>
        </Paper>
    );
}
