import { Typography, Paper} from '@mui/material';
import { ResponsiveContainer, Cell, Pie, PieChart, Legend} from 'recharts';

interface PieChartProps{
    records: { category: string; value: number; }[]
}

export default function DistributionPieChart(data: PieChartProps) {

    return (
        <Paper elevation={3} sx={{ padding: 3 }}>
            <Typography variant="h6" gutterBottom textAlign={'center'}>
                Category Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                    <Pie data={data.records}
                        dataKey="value"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={150}
                        label={({ name, percent }) => `${name}: ${Math.round(percent * 100)}%`}>
                        {data.records.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#8884d8', '#82ca9d', '#ffc658'][index]} />
                        ))}
                    </Pie>
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </Paper>
    );
}
