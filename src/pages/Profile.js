import React, { useState, useEffect, useRef } from 'react';
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
import { alpha } from '@mui/material/styles';
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
import { getUserProfile, updateUserProfile, getMyProfile, getEmployerJobStatistics, uploadProfilePhoto, getApiErrorMessage } from '../services/api';

const Profile = () => {
  const MAX_PHOTO_SIZE_MB = 5;
  const MAX_PHOTO_SIZE_BYTES = MAX_PHOTO_SIZE_MB * 1024 * 1024;
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
    totalJobs: 0,
    activeJobs: 0,
    closedJobs: 0,
    expiredJobs: 0,
    draftJobs: 0,
    totalApplications: 0
  });
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [userRole, setUserRole] = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    return () => {
      if (photoPreviewUrl) {
        URL.revokeObjectURL(photoPreviewUrl);
      }
    };
  }, [photoPreviewUrl]);

  const fetchUserProfile = async () => {
    try {
      setFetchingProfile(true);
      const [userResponse, stats] = await Promise.all([
        getMyProfile(),
        getEmployerJobStatistics()
      ]);

      const userData = userResponse?.data ?? userResponse ?? {};
      
      setUserRole(userData.role || localStorage.getItem('userRole') || '');
      const storedAvatar = localStorage.getItem('userAvatar') || '';
      const fetchedAvatar = userData.photo || userData.avatar || userData.avatarUrl || userData.image || userData.url || storedAvatar;
      if (fetchedAvatar && fetchedAvatar !== storedAvatar) {
        localStorage.setItem('userAvatar', fetchedAvatar);
        window.dispatchEvent(new Event('profile-avatar-updated'));
      }
      setProfilePhotoUrl(fetchedAvatar || '');
      setFormData(prev => ({
        ...prev,
        name: userData.name || localStorage.getItem('userName') || '',
        email: userData.email || localStorage.getItem('userEmail') || '',
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
        totalJobs: stats.total || 0,
        activeJobs: stats.active || 0,
        closedJobs: stats.closed || 0,
        expiredJobs: stats.expired || 0,
        draftJobs: stats.draft || 0,
        totalApplications: stats.totalApplications || 0
      }));
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

  const clearPhotoSelection = () => {
    setSelectedPhoto(null);
    setPhotoPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePhotoSelectClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccess(false);
    setSuccessMessage('');

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      clearPhotoSelection();
      return;
    }

    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      setError(`Image must be smaller than ${MAX_PHOTO_SIZE_MB}MB.`);
      clearPhotoSelection();
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setSelectedPhoto(file);
    setPhotoPreviewUrl(previewUrl);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadPhoto = async () => {
    if (!selectedPhoto) return;
    setUploadingPhoto(true);
    setError('');
    setSuccess(false);
    setSuccessMessage('');

    try {
      const response = await uploadProfilePhoto(selectedPhoto);
      const newUrl = response?.url;

      if (!newUrl) {
        throw new Error('Upload succeeded but no photo URL was returned.');
      }

      setProfilePhotoUrl(newUrl);
      localStorage.setItem('userAvatar', newUrl);
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...currentUser, avatarUrl: newUrl }));
      window.dispatchEvent(new Event('profile-avatar-updated'));
      clearPhotoSelection();
      setSuccessMessage('Profile photo updated successfully!');
      setSuccess(true);
    } catch (err) {
      const status = err.response?.status;
      if (status === 413) {
        setError(`Upload failed. Image must be smaller than ${MAX_PHOTO_SIZE_MB}MB.`);
      } else if (status === 401) {
        setError('Your session has expired. Please log in again.');
      } else {
        setError(getApiErrorMessage(err, 'Failed to upload profile photo. Please try again.'));
      }
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    setSuccessMessage('');

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

      setSuccessMessage('Profile updated successfully!');
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
      <Typography variant="h4" fontWeight={700} gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
        Profile Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Header */}
        <Grid item xs={12}>
          <Paper
            sx={(theme) => ({
              p: 4,
              borderRadius: 4,
              backgroundColor: theme.palette.background.paper,
              backdropFilter: 'blur(10px)',
              boxShadow: theme.shadows[3],
              textAlign: 'center'
            })}
          >
            <Avatar
              src={photoPreviewUrl || profilePhotoUrl || undefined}
              sx={{
                width: 120,
                height: 120,
                mx: 'auto',
                mb: 2,
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                fontSize: '3rem',
                boxShadow: (theme) => `0 8px 32px ${alpha(theme.palette.primary.main, 0.25)}`
              }}
            >
              {formData.name?.charAt(0) || 'U'}
            </Avatar>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handlePhotoChange}
              disabled={uploadingPhoto}
            />
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap', mb: 1 }}>
              <Button
                variant="outlined"
                onClick={handlePhotoSelectClick}
                disabled={uploadingPhoto}
                sx={{ textTransform: 'none' }}
              >
                Upload / Change photo
              </Button>
              <Button
                variant="contained"
                onClick={handleUploadPhoto}
                disabled={!selectedPhoto || uploadingPhoto}
                sx={{ color: '#fff', textTransform: 'none' }}
              >
                {uploadingPhoto ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Save Photo'}
              </Button>
              {selectedPhoto && (
                <Button
                  variant="text"
                  onClick={clearPhotoSelection}
                  disabled={uploadingPhoto}
                  sx={{ textTransform: 'none' }}
                >
                  Cancel
                </Button>
              )}
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              JPG/PNG up to {MAX_PHOTO_SIZE_MB}MB
            </Typography>
            {selectedPhoto && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Selected: {selectedPhoto.name}
              </Typography>
            )}
            <Typography variant="h5" fontWeight={600} sx={{ color: 'primary.main', mb: 1 }}>
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
              label={userRole === 'employer' ? 'Employer' : 'Admin'}
              sx={(theme) => ({
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                color: 'white',
                fontWeight: 500,
                px: 2
              })}
            />
          </Paper>
        </Grid>

        {/* Profile Form */}
        <Grid item xs={12} lg={8}>
          <Paper
            sx={(theme) => ({
              p: 4,
              borderRadius: 4,
              backgroundColor: theme.palette.background.paper,
              backdropFilter: 'blur(10px)',
              boxShadow: theme.shadows[3]
            })}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight={600} sx={{ color: 'primary.main' }}>
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
                    '&:hover': { backgroundColor: 'primary.dark' },
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
                    <Typography variant="h6" fontWeight={600} sx={{ color: 'primary.main', mt: 2, mb: 2 }}>
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

        {/* Job Statistics */}
        <Grid item xs={12} lg={4}>
          <Paper
            sx={(theme) => ({
              p: 3,
              borderRadius: 4,
              backgroundColor: theme.palette.background.paper,
              backdropFilter: 'blur(10px)',
              boxShadow: theme.shadows[3],
              height: 'fit-content'
            })}
          >
            <Typography variant="h6" fontWeight={600} sx={{ color: 'primary.main', mb: 3 }}>
              Job Statistics
            </Typography>
            
            <Box sx={{ space: 2 }}>
              <Card sx={(theme) => ({
                mb: 2,
                backgroundColor: alpha(theme.palette.primary.main, 0.06),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`
              })}>
                <CardContent sx={{ py: 2 }}>
                  <Typography variant="h4" fontWeight={700} sx={{ color: 'primary.main' }}>
                    {formData.totalJobs}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Jobs Posted
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={(theme) => ({
                mb: 2,
                backgroundColor: alpha(theme.palette.secondary.main, 0.08),
                border: `1px solid ${alpha(theme.palette.secondary.main, 0.16)}`
              })}>
                <CardContent sx={{ py: 2 }}>
                  <Typography variant="h4" fontWeight={700} sx={{ color: 'secondary.main' }}>
                    {formData.activeJobs}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Jobs
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={(theme) => ({
                mb: 2,
                backgroundColor: alpha(theme.palette.error.main, 0.08),
                border: `1px solid ${alpha(theme.palette.error.main, 0.16)}`
              })}>
                <CardContent sx={{ py: 2 }}>
                  <Typography variant="h4" fontWeight={700} sx={{ color: 'error.main' }}>
                    {formData.closedJobs}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Closed Jobs
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={(theme) => ({
                mb: 2,
                backgroundColor: alpha(theme.palette.warning.main, 0.08),
                border: `1px solid ${alpha(theme.palette.warning.main, 0.16)}`
              })}>
                <CardContent sx={{ py: 2 }}>
                  <Typography variant="h4" fontWeight={700} sx={{ color: 'warning.main' }}>
                    {formData.expiredJobs}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Expired Jobs
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={(theme) => ({
                mb: 2,
                backgroundColor: alpha(theme.palette.success.main, 0.08),
                border: `1px solid ${alpha(theme.palette.success.main, 0.16)}`
              })}>
                <CardContent sx={{ py: 2 }}>
                  <Typography variant="h4" fontWeight={700} sx={{ color: 'success.main' }}>
                    {formData.totalApplications}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Applications
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
          {successMessage || 'Profile updated successfully!'}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile; 
