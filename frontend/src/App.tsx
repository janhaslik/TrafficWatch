import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';

import Dashboard from './pages/dashboard/Dasboard'; 
import Sidebar from './components/Sidebar'; 
import { Box } from '@mui/material';
import CameraDashboard from './pages/dashboard/CameraDashboard';
import CamerasPage from './pages/cameras/Cameras';


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
                            <Route path='/cameras/:id' element={<CameraDashboard/>} />
                        </Routes>
                    </Box>
                </Box>
        </Router>
    );
}

export default App;
