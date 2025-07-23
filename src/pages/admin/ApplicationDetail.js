import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Stack,
} from '@mui/material';
import { getApplication, updateApplication } from '../../services/api';

const statusOptions = [
  'Pending',
  'Interviewing',
  'Accepted',
  'Rejected',
];

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [note, setNote] = useState('');
  const [status, setStatus] = useState('Pending');
  const [saving, setSaving] = useState(false);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const res = await getApplication(id);
      const app = res.data || res; // API may wrap in .data
      setApplication(app);
      setNote(app.employerNote || '');
      setStatus(app.status || 'Pending');
    } catch (err) {
      console.error('Error loading application', err);
      setError('Failed to load application');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateApplication(id, { status, employerNote: note });
      navigate(-1); // go back to list after save
    } catch (err) {
      console.error('Error updating application', err);
      setError('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">{error}</Alert>
    );
  }

  if (!application) return null;

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}>Application Details</Typography>

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Applicant Info</Typography>
            <Stack spacing={1}>
              <Typography>Name: {application.userSnap?.name || 'N/A'}</Typography>
              <Typography>Email: {application.userSnap?.email || 'N/A'}</Typography>
              <Typography>Phone: {application.userSnap?.mobile || application.userSnap?.phone || 'N/A'}</Typography>
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Job Info</Typography>
            <Stack spacing={1}>
              <Typography>Job Title: {application.jobOffer?.title || 'N/A'}</Typography>
              <Typography>Applied On: {new Date(application.createdAt || application.postedAt).toLocaleString()}</Typography>
              <Chip label={application.status} color={
                application.status === 'Pending' ? 'warning' :
                application.status === 'Accepted' ? 'success' :
                application.status === 'Rejected' ? 'error' :
                'info'
              } />
            </Stack>
          </Grid>

          {/* Note and Status */}
          <Grid item xs={12}>
            <TextField
              label="Employer Note"
              multiline
              rows={4}
              fullWidth
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {statusOptions.map((opt) => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={8} display="flex" alignItems="center" justifyContent="flex-end">
            <Button variant="contained" color="primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Apply Changes'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ApplicationDetail;
