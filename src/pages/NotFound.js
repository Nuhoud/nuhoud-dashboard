import React from 'react';
import { Box, Button, Container, Paper, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const getHomePath = () => {
  if (typeof window === 'undefined') return '/login';
  const role = localStorage.getItem('userRole');
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'employer') return '/employer/dashboard';
  return '/login';
};

const NotFound = () => {
  const homePath = getHomePath();
  const buttonLabel = homePath === '/login' ? 'Go to Login' : 'Go to Dashboard';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #eef2f7 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          sx={{
            p: 4,
            borderRadius: 4,
            textAlign: 'center',
            boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
          }}
        >
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: '#667eea' }}>
            404
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            Page not found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            The page you are looking for does not exist or has moved.
          </Typography>
          <Button
            component={RouterLink}
            to={homePath}
            variant="contained"
            sx={{
              px: 4,
              py: 1.25,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8, #6a4c93)',
              },
            }}
          >
            {buttonLabel}
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default NotFound;
