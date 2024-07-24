import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import CamerasPage from './pages/cameras/cameras';
import Dashboard from './pages/dashboard/Dasboard'; 
import Sidebar from './components/Sidebar'; 
import { Box } from '@mui/material';


function App() {
    return (
        <Router>
                <Box sx={{ display: 'flex' }}>
                    <Sidebar />
                    <Box
                        component="main"
                        sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}
                    >
                        <Routes>
                            <Route path="/cameras" element={<CamerasPage />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                        </Routes>
                    </Box>
                </Box>
        </Router>
    );
}

export default App;
