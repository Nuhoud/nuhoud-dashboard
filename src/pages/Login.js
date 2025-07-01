import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  InputAdornment,
  IconButton,
  Alert,
} from '@mui/material';
import { login } from '../services/api';
import jwtDecode from 'jwt-decode';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BusinessIcon from '@mui/icons-material/Business';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const Login = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('admin');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (event, newRole) => {
    if (newRole !== null) {
      setSelectedRole(newRole);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!identifier.trim()) {
      errors.identifier = 'Email or mobile is required';
    } else if (!identifier.includes('@') && !/^\d{10,}$/.test(identifier)) {
      errors.identifier = 'Please enter a valid email or mobile number';
    }
    if (!password) {
      errors.password = 'Password is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await login(identifier, password);
      console.log('Login response:', response); // For debugging
      
      if (!response || !response.token) {
        throw new Error('Invalid response from server');
      }

      const decoded = jwtDecode(response.token);
      
      if (decoded.role === selectedRole) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('userRole', decoded.role);
        localStorage.setItem('userName', decoded.name || '');
        localStorage.setItem('userId', decoded._id || '');
        
        if (decoded.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (decoded.role === 'employer') {
          navigate('/employer/dashboard');
        }
      } else {
        setError(`Please select the correct role. You are logged in as ${decoded.role}`);
      }
    } catch (err) {
      console.error('Login error:', err); // For debugging
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field === 'identifier') {
      setIdentifier(value);
    } else if (field === 'password') {
      setPassword(value);
    }
    // Clear error when user types
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      py: 4,
      px: 2
    }}>
      <Container maxWidth="sm">
        <Paper sx={{ 
          p: { xs: 3, sm: 4 }, 
          borderRadius: 4, 
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)'
        }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography 
              component="h1" 
              variant="h3" 
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
                fontSize: { xs: '2rem', sm: '2.5rem' }
              }}
            >
              NUHOUD Platform
            </Typography>
            
            <Typography 
              component="h2" 
              variant="h6" 
              sx={{ 
                color: '#666',
                fontWeight: 400,
                fontSize: { xs: '1rem', sm: '1.1rem' }
              }}
            >
              Welcome back! Please sign in to your account
            </Typography>
          </Box>

          {/* Role Selector */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <ToggleButtonGroup
              value={selectedRole}
              exclusive
              onChange={handleRoleChange}
              aria-label="role selection"
              sx={{
                '& .MuiToggleButton-root': {
                  borderRadius: 3,
                  px: { xs: 2, sm: 4 },
                  py: 1.5,
                  fontWeight: 600,
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  border: '2px solid #e0e0e0',
                  '&.Mui-selected': {
                    backgroundColor: '#667eea',
                    color: 'white',
                    borderColor: '#667eea',
                    '&:hover': {
                      backgroundColor: '#5a6fd8',
                    }
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                  }
                }
              }}
            >
              <ToggleButton value="admin" aria-label="admin">
                <AdminPanelSettingsIcon sx={{ mr: 1 }} />
                Admin
              </ToggleButton>
              <ToggleButton value="employer" aria-label="employer">
                <BusinessIcon sx={{ mr: 1 }} />
                Employer
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email or Mobile"
              value={identifier}
              onChange={(e) => handleInputChange('identifier', e.target.value)}
              error={!!formErrors.identifier}
              helperText={formErrors.identifier}
              autoFocus
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: '#667eea' }} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              error={!!formErrors.password}
              helperText={formErrors.password}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: '#667eea' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 2, 
                mb: 2,
                py: 1.5,
                borderRadius: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8, #6a4c93)',
                }
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
