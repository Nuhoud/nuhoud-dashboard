import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Avatar,
  Grid,
  Divider,
  Chip,
  Snackbar,
  Alert,
  Card,
  CardContent,
  IconButton,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { getUserProfile, updateUserProfile, getMyProfile } from '../services/api';

const Profile = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    company: {
      name: '',
      industry: '',
      website: '',
      description: '',
      location: '',
      size: ''
    },
    location: '',
    website: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setFetchingProfile(true);
      const userData = await getMyProfile();
      setUserRole(userData.role);
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        mobile: userData.mobile || '',
        password: '',
        company: userData.company || {
          name: '',
          industry: '',
          website: '',
          description: '',
          location: '',
          size: ''
        },
        location: userData.location || '',
        website: userData.website || '',
        description: userData.description || '',
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data. Please refresh the page.');
    } finally {
      setFetchingProfile(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('company.')) {
      const companyField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        company: {
          ...prev.company,
          [companyField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Only include fields that have values
      const updateData = {};
      Object.keys(formData).forEach(key => {
        if (key === 'company') {
          if (Object.values(formData.company).some(val => val)) {
            updateData.company = formData.company;
          }
        } else if (formData[key] && key !== 'password') {
          updateData[key] = formData[key];
        }
      });
      
      // Only include password if it was changed
      if (formData.password) {
        updateData.password = formData.password;
      }

      await updateUserProfile(updateData);

      setSuccess(true);
      // Clear password field after successful update
      setFormData(prev => ({
        ...prev,
        password: ''
      }));
      
      // Refresh profile data
      await fetchUserProfile();

      // Update localStorage with new basic info
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = {
        ...currentUser,
        name: updateData.name || currentUser.name,
        email: updateData.email || currentUser.email,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingProfile) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom sx={{ color: '#667eea', mb: 3 }}>
        Profile Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Header */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 4,
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}
          >
            <Avatar
              sx={{
                width: 120,
                height: 120,
                mx: 'auto',
                mb: 2,
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                fontSize: '3rem',
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
              }}
            >
              {formData.name?.charAt(0) || 'U'}
            </Avatar>
            <Typography variant="h5" fontWeight={600} sx={{ color: '#667eea', mb: 1 }}>
              {formData.name || 'User Name'}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {formData.email || 'user@example.com'}
            </Typography>
            {userRole === 'employer' && formData.company?.name && (
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {formData.company.name}
              </Typography>
            )}
            <Chip
              label={userRole === 'employer' ? 'Employer' : 'User'}
              sx={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                fontWeight: 500,
                px: 2
              }}
            />
          </Paper>
        </Grid>

        {/* Profile Form */}
        <Grid item xs={12} lg={8}>
          <Paper
            sx={{
              p: 4,
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight={600} sx={{ color: '#667eea' }}>
                Personal Information
              </Typography>
              <Box>
                <Button
                  type="submit"
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  sx={{
                    color: '#fff',
                    '&:hover': { backgroundColor: '#4a148c' },
                    mr: 1
                  }}
                >
                  {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Update Profile'}
                </Button>
              </Box>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="New Password (leave empty to keep current)"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>

              {userRole === 'employer' && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" fontWeight={600} sx={{ color: '#667eea', mt: 2, mb: 2 }}>
                      Company Information
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Company Name"
                      name="company.name"
                      value={formData.company.name}
                      onChange={handleChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Industry"
                      name="company.industry"
                      value={formData.company.industry}
                      onChange={handleChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Company Website"
                      name="company.website"
                      value={formData.company.website}
                      onChange={handleChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Company Location"
                      name="company.location"
                      value={formData.company.location}
                      onChange={handleChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Company Size</InputLabel>
                      <Select
                        name="company.size"
                        value={formData.company.size}
                        onChange={handleChange}
                        label="Company Size"
                      >
                        <MenuItem value="1-10">1-10 employees</MenuItem>
                        <MenuItem value="11-50">11-50 employees</MenuItem>
                        <MenuItem value="51-200">51-200 employees</MenuItem>
                        <MenuItem value="201-500">201-500 employees</MenuItem>
                        <MenuItem value="501-1000">501-1000 employees</MenuItem>
                        <MenuItem value="1000+">1000+ employees</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Company Description"
                      name="company.description"
                      value={formData.company.description}
                      onChange={handleChange}
                      multiline
                      rows={4}
                      variant="outlined"
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Paper>
        </Grid>

        {/* Account Stats */}
        <Grid item xs={12} lg={4}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              height: 'fit-content'
            }}
          >
            <Typography variant="h6" fontWeight={600} sx={{ color: '#667eea', mb: 3 }}>
              Account Statistics
            </Typography>
            
            <Box sx={{ space: 2 }}>
              <Card sx={{ mb: 2, background: 'rgba(102, 126, 234, 0.05)', border: '1px solid rgba(102, 126, 234, 0.1)' }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography variant="h4" fontWeight={700} sx={{ color: '#667eea' }}>
                    {formData.jobsCount || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Jobs Posted
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={{ mb: 2, background: 'rgba(118, 75, 162, 0.05)', border: '1px solid rgba(118, 75, 162, 0.1)' }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography variant="h4" fontWeight={700} sx={{ color: '#764ba2' }}>
                    {formData.applicationsCount || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Applications Received
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={{ background: 'rgba(54, 179, 126, 0.05)', border: '1px solid rgba(54, 179, 126, 0.1)' }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography variant="h4" fontWeight={700} sx={{ color: '#36b37e' }}>
                    {formData.hiredCount || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Successful Hires
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Profile updated successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile; 