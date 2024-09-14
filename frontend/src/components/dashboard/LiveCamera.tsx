import { Typography, Paper} from "@mui/material";
import { ResponsiveContainer } from "recharts";

interface LiveCameraProps {
    frameUrl: string | null;
}

export default function LiveCamera({ frameUrl }: LiveCameraProps) {
    if (!frameUrl) {
        return <div>No live stream available</div>;
    }

    return (
        <Paper elevation={3} sx={{ padding: 3 }}>
            <Typography variant="h6" gutterBottom textAlign={'center'}>
                Live Camera
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
                <img 
                    src={frameUrl} 
                    alt="Live Camera Stream" 
                    style={{ 
                        objectFit: 'cover',
                        borderRadius: 5
                    }} 
                />
            </ResponsiveContainer>
        </Paper>
    );
}
