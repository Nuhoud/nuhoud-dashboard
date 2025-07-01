import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Grid, Avatar, Divider, Paper } from '@mui/material';
import { getMyProfile } from '../../services/api';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyProfile().then(res => setProfile(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, color: '#1976d2', mb: 3 }}>
        My Profile
      </Typography>
      
      {profile && (
        <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)', maxWidth: 800 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar sx={{ bgcolor: '#1976d2', width: 80, height: 80, mr: 3 }}>
              <AccountCircleIcon sx={{ fontSize: 50 }} />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={600} sx={{ color: '#1976d2' }}>
                {profile.name || 'No Name'}
              </Typography>
              <Typography color="text.secondary" variant="h6">
                {profile.email}
              </Typography>
            </Box>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Role
              </Typography>
              <Typography variant="body1" sx={{ color: '#1976d2', fontWeight: 500 }}>
                {profile.role || '-'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Phone
              </Typography>
              <Typography variant="body1">
                {profile.phone || '-'}
              </Typography>
            </Grid>
            
            {/* Add more fields as needed */}
            {Object.entries(profile).map(([key, value]) => (
              !['name', 'email', 'role', 'phone', 'id'].includes(key) && (
                <Grid item xs={12} sm={6} key={key}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Typography>
                  <Typography variant="body1">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </Typography>
                </Grid>
              )
            ))}
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default Profile;
