import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, Grid, TextField, Button, MenuItem,
  Select, InputLabel, FormControl, Chip, IconButton, Alert, Snackbar
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { createJobOffer } from '../../services/api';

const CreateJobOffer = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [jobDetails, setJobDetails] = useState({
    title: '',
    experienceLevel: 'Mid Level',
    workPlaceType: 'On-site',
    jobType: 'Full-time',
    jobLocation: '',
    description: '',
    requirements: [],
    skillsRequired: [],
    salaryRange: { min: 0, max: 0, currency: 'SYP' },
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });
  const [currentRequirement, setCurrentRequirement] = useState('');
  const [currentSkill, setCurrentSkill] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJobDetails(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    setError('');
  };
  
  const handleSalaryChange = (e) => {
    const { name, value } = e.target;
    setJobDetails(prev => ({
      ...prev,
      salaryRange: { 
        ...prev.salaryRange, 
        [name]: name === 'currency' ? value : Number(value) 
      }
    }));
    setError('');
  };
  
  const handleAddItem = (type) => {
    if (type === 'requirement' && currentRequirement.trim()) {
      setJobDetails(prev => ({ ...prev, requirements: [...prev.requirements, currentRequirement.trim()] }));
      setCurrentRequirement('');
    } else if (type === 'skill' && currentSkill.trim()) {
      setJobDetails(prev => ({ ...prev, skillsRequired: [...prev.skillsRequired, currentSkill.trim()] }));
      setCurrentSkill('');
    }
    setError('');
  };

  const handleDeleteItem = (type, itemToDelete) => {
    if (type === 'requirement') {
      setJobDetails(prev => ({ ...prev, requirements: prev.requirements.filter(r => r !== itemToDelete) }));
    } else if (type === 'skill') {
      setJobDetails(prev => ({ ...prev, skillsRequired: prev.skillsRequired.filter(s => s !== itemToDelete) }));
    }
  };

  const validateForm = () => {
    if (!jobDetails.title.trim()) return 'Job title is required';
    if (!jobDetails.jobLocation.trim()) return 'Job location is required';
    if (!jobDetails.description.trim()) return 'Job description is required';
    if (jobDetails.requirements.length === 0) return 'At least one requirement is needed';
    if (jobDetails.skillsRequired.length === 0) return 'At least one skill is required';
    if (!jobDetails.deadline) return 'Application deadline is required';
    if (jobDetails.salaryRange.min < 0) return 'Minimum salary must be greater than or equal to 0';
    if (jobDetails.salaryRange.max <= jobDetails.salaryRange.min) return 'Maximum salary must be greater than minimum salary';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      console.log('Submitting job details:', jobDetails);
      await createJobOffer(jobDetails);
      setSuccess('Job offer created successfully!');
      setTimeout(() => {
        navigate('/employer/jobs');
      }, 2000);
    } catch (err) {
      console.error('Failed to create job offer:', err);
      let errorMessage = 'Failed to create job offer. Please try again.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (Array.isArray(err.response?.data)) {
        errorMessage = err.response.data.join(', ');
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e, type) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddItem(type);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main', mb: 3 }}>
        Create a Job Offer
      </Typography>
      
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: (theme) => theme.shadows[3] }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Core Details */}
            <Grid item xs={12} md={8}>
              <TextField 
                name="title" 
                label="Job Title" 
                value={jobDetails.title} 
                onChange={handleChange} 
                fullWidth 
                required 
                error={!jobDetails.title.trim()}
                helperText={!jobDetails.title.trim() ? 'Title is required' : ''}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField 
                name="jobLocation" 
                label="Job Location" 
                value={jobDetails.jobLocation} 
                onChange={handleChange} 
                fullWidth 
                required 
                error={!jobDetails.jobLocation.trim()}
                helperText={!jobDetails.jobLocation.trim() ? 'Location is required' : ''}
              />
            </Grid>
            
            {/* Selects */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Experience Level</InputLabel>
                <Select 
                  name="experienceLevel" 
                  value={jobDetails.experienceLevel} 
                  label="Experience Level" 
                  onChange={handleChange}
                >
                  <MenuItem value="Entry Level">Entry Level</MenuItem>
                  <MenuItem value="Internship">Internship</MenuItem>
                  <MenuItem value="Mid Level">Mid Level</MenuItem>
                  <MenuItem value="Senior Level">Senior Level</MenuItem>
                  <MenuItem value="Associate">Associate</MenuItem>
                  <MenuItem value="Director">Director</MenuItem>
                  <MenuItem value="Executive">Executive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Workplace Type</InputLabel>
                <Select 
                  name="workPlaceType" 
                  value={jobDetails.workPlaceType} 
                  label="Workplace Type" 
                  onChange={handleChange}
                >
                  <MenuItem value="On-site">On-site</MenuItem>
                  <MenuItem value="Hybrid">Hybrid</MenuItem>
                  <MenuItem value="Remote">Remote</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Job Type</InputLabel>
                <Select 
                  name="jobType" 
                  value={jobDetails.jobType} 
                  label="Job Type" 
                  onChange={handleChange}
                >
                  <MenuItem value="Full-time">Full-time</MenuItem>
                  <MenuItem value="Part-time">Part-time</MenuItem>
                  <MenuItem value="Contract">Contract</MenuItem>
                  <MenuItem value="Freelance">Freelance</MenuItem>
                  <MenuItem value="Internship">Internship</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField 
                name="deadline" 
                label="Application Deadline" 
                type="date" 
                value={jobDetails.deadline} 
                onChange={handleChange} 
                fullWidth 
                required
                InputLabelProps={{ shrink: true }} 
                error={!jobDetails.deadline}
                helperText={!jobDetails.deadline ? 'Deadline is required' : ''}
              />
            </Grid>

            {/* Salary */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600 }}>
                Salary Range
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField 
                name="min" 
                label="Minimum" 
                type="number" 
                value={jobDetails.salaryRange.min} 
                onChange={handleSalaryChange} 
                fullWidth 
                required
                error={jobDetails.salaryRange.min < 0}
                helperText={jobDetails.salaryRange.min < 0 ? 'Must be greater than or equal to 0' : ''}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField 
                name="max" 
                label="Maximum" 
                type="number" 
                value={jobDetails.salaryRange.max} 
                onChange={handleSalaryChange} 
                fullWidth 
                required
                error={jobDetails.salaryRange.max <= jobDetails.salaryRange.min}
                helperText={jobDetails.salaryRange.max <= jobDetails.salaryRange.min ? 'Must be greater than minimum' : ''}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select 
                  name="currency" 
                  value={jobDetails.salaryRange.currency} 
                  label="Currency" 
                  onChange={handleSalaryChange}
                >
                  <MenuItem value="SYP">SYP</MenuItem>
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="EUR">EUR</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* Description */}
            <Grid item xs={12}>
              <TextField 
                name="description" 
                label="Job Description" 
                value={jobDetails.description} 
                onChange={handleChange} 
                fullWidth 
                required 
                multiline 
                rows={6}
                error={!jobDetails.description.trim()}
                helperText={!jobDetails.description.trim() ? 'Description is required' : ''} 
              />
            </Grid>

            {/* Requirements */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                Requirements
              </Typography>
              <Box display="flex" alignItems="center" mb={1}>
                <TextField 
                  value={currentRequirement} 
                  onChange={(e) => setCurrentRequirement(e.target.value)} 
                  onKeyPress={(e) => handleKeyPress(e, 'requirement')}
                  fullWidth 
                  placeholder="Add a requirement..." 
                />
                <IconButton 
                  onClick={() => handleAddItem('requirement')}
                  sx={{ ml: 1, color: 'primary.main' }}
                >
                  <AddCircleOutlineIcon />
                </IconButton>
              </Box>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {jobDetails.requirements.map(r => (
                  <Chip 
                    key={r} 
                    label={r} 
                    onDelete={() => handleDeleteItem('requirement', r)}
                    sx={(theme) => ({ bgcolor: alpha(theme.palette.primary.main, 0.12) })}
                  />
                ))}
              </Box>
              {jobDetails.requirements.length === 0 && (
                <Typography color="error" variant="caption">
                  At least one requirement is needed
                </Typography>
              )}
            </Grid>

            {/* Skills */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                Skills Required
              </Typography>
              <Box display="flex" alignItems="center" mb={1}>
                <TextField 
                  value={currentSkill} 
                  onChange={(e) => setCurrentSkill(e.target.value)} 
                  onKeyPress={(e) => handleKeyPress(e, 'skill')}
                  fullWidth 
                  placeholder="Add a skill..." 
                />
                <IconButton 
                  onClick={() => handleAddItem('skill')}
                  sx={{ ml: 1, color: 'primary.main' }}
                >
                  <AddCircleOutlineIcon />
                </IconButton>
              </Box>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {jobDetails.skillsRequired.map(s => (
                  <Chip 
                    key={s} 
                    label={s} 
                    onDelete={() => handleDeleteItem('skill', s)}
                    sx={(theme) => ({ bgcolor: alpha(theme.palette.primary.main, 0.12) })}
                  />
                ))}
              </Box>
              {jobDetails.skillsRequired.length === 0 && (
                <Typography color="error" variant="caption">
                  At least one skill is required
                </Typography>
              )}
            </Grid>
          </Grid>

          {error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mt: 3 }}>
              {success}
            </Alert>
          )}
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/employer/jobs')}
              sx={{ borderRadius: 2 }}
            >
              Back to Jobs
            </Button>
            <Button 
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ 
                borderRadius: 2,
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                '&:hover': { 
                  background: (theme) =>
                    `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})` 
                }
              }}
            >
              {loading ? 'Creating...' : 'Create Job Offer'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateJobOffer;
