import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Typography, Box, Alert, Paper } from '@mui/material';
import { login } from '../../services/api';
import jwtDecode from 'jwt-decode';
import logo from '../../assets/logo-nuhoud.svg';

const EmployerLogin = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await login(identifier, password);
      console.log('Server Response:', response);

      const token = response.token;
      if (!token) {
        throw new Error('No token received from server');
      }

      const decodedToken = jwtDecode(token);
      console.log('Decoded token:', decodedToken);

      if (decodedToken.role !== 'employer') {
        throw new Error('This login is only for employers. Please use the appropriate login page.');
      }

      // Store auth data
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', decodedToken.role);
      localStorage.setItem('userName', decodedToken.name || '');
      localStorage.setItem('userEmail', decodedToken.identifier || identifier);
      if (decodedToken.company) {
        localStorage.setItem('companyName', decodedToken.company);
      }

      // Navigate to dashboard
      navigate('/employer/dashboard');
    } catch (err) {
      console.error('Login API Error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ 
        p: 4, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        borderRadius: 2,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <img 
            src={logo} 
            alt="Nuhoud Logo" 
            style={{ 
              height: '60px'
            }} 
          />
        </Box>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            autoFocus
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#667eea',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#667eea',
                },
              },
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#667eea',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#667eea',
                },
              },
            }}
          />
          {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}
          <Button 
            type="submit" 
            fullWidth 
            variant="contained" 
            sx={{ 
              mt: 3, 
              mb: 2,
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8, #6a4c93)',
              },
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem',
              py: 1.5
            }}
          >
            Login
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default EmployerLogin;
