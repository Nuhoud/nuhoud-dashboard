import React from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useFcmForegroundNotifications } from '../hooks/useFcmForegroundNotifications';

const MainLayout = () => {
  useFcmForegroundNotifications();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          backgroundColor: (theme) => theme.palette.background.default,
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
