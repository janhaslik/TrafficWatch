// src/components/Sidebar.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Box, List, ListItem, ListItemIcon, ListItemText, Divider, Drawer, Typography } from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import DashboardIcon from '@mui/icons-material/Dashboard';

const drawerWidth = 240;

const Sidebar: React.FC = () => {
    return (
        <Drawer
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                },
            }}
            variant="permanent"
            anchor="left"
        >
            <Box sx={{ overflow: 'auto' }}>
                <Typography variant="h6" sx={{ padding: 2 }}>TrafficWatch</Typography>
                <Divider />
                <List>
                    <ListItem button component={Link} to="/dashboard">
                        <ListItemIcon>
                            <DashboardIcon />
                        </ListItemIcon>
                        <ListItemText primary="Dashboard" />
                    </ListItem>
                    <ListItem button component={Link} to="/cameras">
                        <ListItemIcon>
                            <CameraAltIcon />
                        </ListItemIcon>
                        <ListItemText primary="Cameras" />
                    </ListItem>
                </List>
            </Box>
        </Drawer>
    );
};

export default Sidebar;
