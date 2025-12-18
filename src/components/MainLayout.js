import React from 'react';
import { Box, CssBaseline } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useFcmForegroundNotifications } from '../hooks/useFcmForegroundNotifications';

const MainLayout = () => {
  useFcmForegroundNotifications();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <Sidebar />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          background: '#f8fafc',
          minHeight: '100vh',
        }}
      >
        <Topbar />
        <Box sx={{ 
          flexGrow: 1, 
          p: 3, 
          pt: 2,
          overflow: 'auto',
        }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout; 
