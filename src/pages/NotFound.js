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
      sx={(theme) => ({
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.info.light} 100%)`,
      })}
    >
      <Container maxWidth="sm">
        <Paper
          sx={(theme) => ({
            p: 4,
            borderRadius: 4,
            textAlign: 'center',
            boxShadow: theme.shadows[3],
            backgroundColor: theme.palette.background.paper,
          })}
        >
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
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
            sx={(theme) => ({
              px: 4,
              py: 1.25,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
              },
            })}
          >
            {buttonLabel}
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default NotFound;
