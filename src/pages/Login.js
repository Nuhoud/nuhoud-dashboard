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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { getMyProfile, login } from '../services/api';
import jwtDecode from 'jwt-decode';
import config from '../config/environment';
import { registerAndSendFcmToken } from '../fcmClient';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BusinessIcon from '@mui/icons-material/Business';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import logo from '../assets/logo-nuhoud2.svg';
import { requestResetPassword, verifyResetPasswordOtp, resetPassword } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('admin');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [forgotStep, setForgotStep] = useState('identifier'); // identifier | otp | newPassword
  const [fpIdentifier, setFpIdentifier] = useState('');
  const [fpOtp, setFpOtp] = useState('');
  const [fpPassword, setFpPassword] = useState('');
  const [fpError, setFpError] = useState('');
  const [fpSuccess, setFpSuccess] = useState('');
  const [fpLoading, setFpLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [fpToken, setFpToken] = useState('');

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
        // Save user data to localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('userRole', decoded.role);
        localStorage.setItem('userName', decoded.name || '');
        localStorage.setItem('userId', decoded._id || '');
        
        // Determine and save email
        const userEmail = decoded.email || (identifier.includes('@') ? identifier : '');
        console.log('Saving email to localStorage:', userEmail);
        localStorage.setItem('userEmail', userEmail);

        // Hydrate profile data so avatar persists after re-login
        try {
          const profile = await getMyProfile();
          const avatarUrl = profile?.photo || profile?.avatar || profile?.avatarUrl || profile?.image || profile?.url || '';
          if (profile?.name) {
            localStorage.setItem('userName', profile.name);
          }
          if (profile?.email) {
            localStorage.setItem('userEmail', profile.email);
          }
          if (avatarUrl) {
            localStorage.setItem('userAvatar', avatarUrl);
            window.dispatchEvent(new Event('profile-avatar-updated'));
          }
        } catch (profileErr) {
          console.error('Failed to fetch profile after login:', profileErr);
        }

        // Register FCM and send token to backend (runs only after login)
        registerAndSendFcmToken();
        
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
      const data = err.response?.data;
      let errorMessage =
        (typeof data?.message === 'string' && data.message) ||
        (Array.isArray(data?.message) && data.message.join(', ')) ||
        (typeof data === 'string' && data) ||
        (typeof data?.error === 'string' && data.error) ||
        err.message ||
        'Invalid credentials';

      setError(errorMessage);
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

  const handleForgotOpen = () => {
    setShowForgot(true);
    setForgotStep('identifier');
    setFpIdentifier('');
    setFpOtp('');
    setFpPassword('');
    setFpError('');
    setFpSuccess('');
    setFpToken('');
  };

  const handleForgotClose = () => {
    setShowForgot(false);
  };

  const handleForgotIdentifier = async () => {
    if (!fpIdentifier.trim()) {
      setFpError('Email or mobile is required');
      return;
    }
    setFpLoading(true);
    setFpError('');
    setFpSuccess('');
    try {
      await requestResetPassword(fpIdentifier);
      setFpSuccess('OTP sent to your identifier.');
      setForgotStep('otp');
    } catch (err) {
      const data = err.response?.data;
      const message =
        (typeof data?.message === 'string' && data.message) ||
        (Array.isArray(data?.message) && data.message.join(', ')) ||
        (typeof data?.error === 'string' && data.error) ||
        err.message ||
        'Failed to send OTP';
      setFpError(message);
    } finally {
      setFpLoading(false);
    }
  };

  const handleForgotVerifyOtp = async () => {
    if (!fpOtp.trim()) {
      setFpError('OTP is required');
      return;
    }
    setFpLoading(true);
    setFpError('');
    setFpSuccess('');
    try {
      const response = await verifyResetPasswordOtp(fpIdentifier, fpOtp);
      // Some backends return a token after verification; capture it if present
      if (response?.token) {
        setFpToken(response.token);
      }
      setFpSuccess('OTP verified. Please set your new password.');
      setForgotStep('newPassword');
    } catch (err) {
      const data = err.response?.data;
      const message =
        (typeof data?.message === 'string' && data.message) ||
        (Array.isArray(data?.message) && data.message.join(', ')) ||
        (typeof data?.error === 'string' && data.error) ||
        err.message ||
        'Failed to verify OTP';
      setFpError(message);
    } finally {
      setFpLoading(false);
    }
  };

  const handleForgotResetPassword = async () => {
    if (!fpPassword.trim()) {
      setFpError('New password is required');
      return;
    }
    if (fpPassword.length < 6) {
      setFpError('Password must be at least 6 characters long');
      return;
    }
    setFpLoading(true);
    setFpError('');
    setFpSuccess('');
    try {
      await resetPassword(fpPassword, fpToken || null);
      setFpSuccess('Password reset successfully. Please log in with your new password.');
      setForgotStep('identifier');
    } catch (err) {
      const data = err.response?.data;
      const message =
        (typeof data?.message === 'string' && data.message) ||
        (Array.isArray(data?.message) && data.message.join(', ')) ||
        (typeof data?.error === 'string' && data.error) ||
        err.message ||
        'Failed to reset password';
      setFpError(message);
    } finally {
      setFpLoading(false);
    }
  };

  return (
    <Box sx={(theme) => ({
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      py: 4,
      px: 2
    })}>
      <Container maxWidth="sm">
        <Paper sx={(theme) => ({ 
          p: { xs: 3, sm: 4 }, 
          borderRadius: 4, 
          boxShadow: theme.shadows[4],
          backgroundColor: alpha(theme.palette.background.paper, 0.96),
          backdropFilter: 'blur(10px)'
        })}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              component="img"
              src={logo}
              alt="Nuhoud logo"
              sx={{ height: 115, mb: 1 }}
            />
            
            <Typography 
              component="h2" 
              variant="h6" 
              sx={{ 
                color: 'text.secondary',
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
                gap: 1.5,
                '& .MuiToggleButton-root': {
                  borderRadius: 3,
                  px: { xs: 2, sm: 4 },
                  py: 1.5,
                  fontWeight: 600,
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  border: (theme) => `2px solid ${theme.palette.divider}`,
                  '&.Mui-selected': {
                    backgroundColor: (theme) => theme.palette.primary.main,
                    color: 'white',
                    borderColor: (theme) => theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: (theme) => theme.palette.primary.dark,
                    }
                  },
                  '&:hover': {
                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
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
                    <EmailIcon sx={{ color: 'primary.main' }} />
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
                    <LockIcon sx={{ color: 'primary.main' }} />
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
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                '&:hover': {
                  background: (theme) =>
                    `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                }
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Button
                variant="text"
                size="small"
                onClick={handleForgotOpen}
                sx={{ color: 'primary.main' }}
              >
                Forgot password?
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>

      <Dialog open={showForgot} onClose={handleForgotClose} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'primary.main' }}>
          Reset Password
        </DialogTitle>
        <DialogContent dividers>
          {fpError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {fpError}
            </Alert>
          )}
          {fpSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {fpSuccess}
            </Alert>
          )}

          {forgotStep === 'identifier' && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Enter your email or mobile to receive a reset OTP.
              </Typography>
              <TextField
                fullWidth
                label="Email or Mobile"
                value={fpIdentifier}
                onChange={(e) => setFpIdentifier(e.target.value)}
                margin="normal"
              />
            </Box>
          )}

          {forgotStep === 'otp' && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Enter the 5-digit OTP sent to {fpIdentifier}.
              </Typography>
              <TextField
                fullWidth
                label="OTP"
                value={fpOtp}
                onChange={(e) => setFpOtp(e.target.value)}
                margin="normal"
              />
            </Box>
          )}

          {forgotStep === 'newPassword' && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Create a new password.
              </Typography>
              <TextField
                fullWidth
                label="New Password"
                type="password"
                value={fpPassword}
                onChange={(e) => setFpPassword(e.target.value)}
                margin="normal"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleForgotClose}>Cancel</Button>
          {forgotStep === 'identifier' && (
            <Button onClick={handleForgotIdentifier} variant="contained" disabled={fpLoading}>
              {fpLoading ? 'Sending...' : 'Send OTP'}
            </Button>
          )}
          {forgotStep === 'otp' && (
            <Button onClick={handleForgotVerifyOtp} variant="contained" disabled={fpLoading}>
              {fpLoading ? 'Verifying...' : 'Verify OTP'}
            </Button>
          )}
          {forgotStep === 'newPassword' && (
            <Button onClick={handleForgotResetPassword} variant="contained" disabled={fpLoading}>
              {fpLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Login;
