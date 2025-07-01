import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Alert, Paper, Grid } from '@mui/material';
import { createEmployer } from '../../services/api';

// Helper to render error messages safely
function renderErrorMessages(error) {
  if (!error) return null;
  if (typeof error === 'string') return error;
  if (Array.isArray(error)) {
    return (
      <ul style={{ margin: 0, paddingLeft: 20 }}>
        {error.map((e, i) => <li key={i}>{renderErrorMessages(e)}</li>)}
      </ul>
    );
  }
  if (typeof error === 'object') {
    return (
      <ul style={{ margin: 0, paddingLeft: 20 }}>
        {Object.entries(error).map(([key, value]) => (
          <li key={key}><b>{key}:</b> {renderErrorMessages(value)}</li>
        ))}
      </ul>
    );
  }
  return String(error);
}

const initialFormData = {
  name: '',
  email: '',
  password: '',
  company: {
    name: '',
    industry: '',
    website: '',
    description: '',
    location: '',
    size: '',
  },
};

const CreateEmployer = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle top-level fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle nested company fields
  const handleCompanyChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      company: { ...prev.company, [name]: value },
    }));
  };

  // Validate required fields before submit
  const validate = () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.company.name ||
      !formData.company.size
    ) {
      return 'Please fill in all required fields.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setLoading(true);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      await createEmployer(formData);
      setSuccess('Employer created successfully!');
      setFormData(initialFormData);
    } catch (err) {
      let errorMsg;
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (Array.isArray(err.response?.data)) {
        errorMsg = err.response.data;
      } else {
        errorMsg = 'Failed to create employer. Please try again.';
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, color: '#1976d2', mb: 3 }}>
        Create New Employer
      </Typography>
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <Box component="form" onSubmit={handleSubmit} autoComplete="off">
          <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 600, mb: 2 }}>
            Employer Details
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Employer Name"
                name="name"
                fullWidth
                required
                value={formData.name}
                onChange={handleChange}
                autoComplete="off"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Email"
                name="email"
                type="email"
                fullWidth
                required
                value={formData.email}
                onChange={handleChange}
                autoComplete="off"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Password"
                name="password"
                type="password"
                fullWidth
                required
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </Grid>
          </Grid>

          <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 600, mt: 4, mb: 2 }}>
            Company Details
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Company Name"
                name="name"
                fullWidth
                required
                value={formData.company.name}
                onChange={handleCompanyChange}
                autoComplete="off"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Industry"
                name="industry"
                fullWidth
                value={formData.company.industry}
                onChange={handleCompanyChange}
                autoComplete="off"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Website"
                name="website"
                type="url"
                fullWidth
                value={formData.company.website}
                onChange={handleCompanyChange}
                autoComplete="off"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Location"
                name="location"
                fullWidth
                value={formData.company.location}
                onChange={handleCompanyChange}
                autoComplete="off"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Company Size"
                name="size"
                fullWidth
                required
                value={formData.company.size}
                onChange={handleCompanyChange}
                autoComplete="off"
                placeholder="e.g. 1-10, 11-50, 51-200"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                fullWidth
                multiline
                minRows={3}
                value={formData.company.description}
                onChange={handleCompanyChange}
                autoComplete="off"
              />
            </Grid>
          </Grid>

          {success && (
            <Alert severity="success" sx={{ mt: 3 }}>
              {success}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {renderErrorMessages(error)}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              mt: 3,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
              '&:hover': { background: 'linear-gradient(135deg, #1565c0, #1976d2)' }
            }}
          >
            {loading ? 'Creating...' : 'Create Employer'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default CreateEmployer; 