import { Typography, Paper} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from 'recharts';

interface MultiLineChartProps{
    records: any
}

export default function MultiLineChart(data: MultiLineChartProps) {

    return (
        <Paper elevation={3} sx={{ padding: 3 }}>
            <Typography variant="h6" gutterBottom textAlign={'center'}>
                Objects Detected by Category
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data.records}>
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
    );
}
