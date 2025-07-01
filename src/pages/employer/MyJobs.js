import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Tooltip,
  Grid
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PeopleIcon from '@mui/icons-material/People';
import { getEmployerJobs, deleteJobOffer, updateJobOffer } from '../../services/api';

const MyJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [editedJob, setEditedJob] = useState(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await getEmployerJobs();
      console.log('Jobs response:', response); // Debug log
      // Ensure we have an array of jobs
      setJobs(Array.isArray(response) ? response : response.data || []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs. Please try again.');
      setJobs([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleEdit = (job) => {
    setSelectedJob(job);
    setEditedJob({
      ...job,
      deadline: new Date(job.deadline).toISOString().split('T')[0]
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (job) => {
    setSelectedJob(job);
    setDeleteDialogOpen(true);
  };

  const handleViewApplications = (jobId) => {
    navigate(`/employer/jobs/${jobId}/applications`);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteJobOffer(selectedJob._id);
      setDeleteDialogOpen(false);
      setSelectedJob(null);
      // Refresh the jobs list
      fetchJobs();
    } catch (err) {
      console.error('Error deleting job:', err);
      setError('Failed to delete job. Please try again.');
    }
  };

  const handleEditSave = async () => {
    try {
      await updateJobOffer(selectedJob._id, editedJob);
      setEditDialogOpen(false);
      setSelectedJob(null);
      setEditedJob(null);
      // Refresh the jobs list
      fetchJobs();
    } catch (err) {
      console.error('Error updating job:', err);
      setError('Failed to update job. Please try again.');
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name === 'salaryRange.min' || name === 'salaryRange.max') {
      const [parent, child] = name.split('.');
      setEditedJob(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: Number(value)
        }
      }));
    } else {
      setEditedJob(prev => ({ ...prev, [name]: value }));
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const columns = [
    { field: 'title', headerName: 'Title', width: 200 },
    { field: 'jobLocation', headerName: 'Location', width: 150 },
    { field: 'jobType', headerName: 'Type', width: 100 },
    { field: 'experienceLevel', headerName: 'Experience', width: 100 },
    { field: 'workPlaceType', headerName: 'Workplace', width: 100 },
    { field: 'deadline', headerName: 'Deadline', width: 120 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View Applications">
            <IconButton
              onClick={() => navigate(`/employer/jobs/${params.row._id}/applications`)}
              color="primary"
              size="small"
            >
              <PeopleIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 600 }}>
          My Job Offers
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/employer/jobs/create')}
          sx={{
            borderRadius: 2,
            background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
            '&:hover': { background: 'linear-gradient(135deg, #1565c0, #1976d2)' }
          }}
        >
          Create New Job
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      ) : jobs.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            No job offers found. Create your first job offer!
          </Typography>
        </Paper>
      ) : (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Experience</TableCell>
                  <TableCell>Workplace</TableCell>
                  <TableCell>Deadline</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job._id}>
                    <TableCell>{job.title}</TableCell>
                    <TableCell>{job.jobLocation}</TableCell>
                    <TableCell>{job.jobType}</TableCell>
                    <TableCell>{job.experienceLevel}</TableCell>
                    <TableCell>{job.workPlaceType}</TableCell>
                    <TableCell>
                      {new Date(job.deadline).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="View Applications">
                          <IconButton 
                            onClick={() => handleViewApplications(job._id)}
                            color="primary"
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton 
                            onClick={() => handleEdit(job)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton 
                            onClick={() => handleDelete(job)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this job offer? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      {editDialogOpen && editedJob && (
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Edit Job Offer</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Title"
                    name="title"
                    value={editedJob.title || ''}
                    onChange={handleEditChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Location"
                    name="jobLocation"
                    value={editedJob.jobLocation || ''}
                    onChange={handleEditChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Job Type</InputLabel>
                    <Select
                      name="jobType"
                      value={editedJob.jobType || ''}
                      onChange={handleEditChange}
                      label="Job Type"
                    >
                      <MenuItem value="Full-time">Full-time</MenuItem>
                      <MenuItem value="Part-time">Part-time</MenuItem>
                      <MenuItem value="Contract">Contract</MenuItem>
                      <MenuItem value="Internship">Internship</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Experience Level</InputLabel>
                    <Select
                      name="experienceLevel"
                      value={editedJob.experienceLevel || ''}
                      onChange={handleEditChange}
                      label="Experience Level"
                    >
                      <MenuItem value="Entry">Entry Level</MenuItem>
                      <MenuItem value="Mid">Mid Level</MenuItem>
                      <MenuItem value="Senior">Senior Level</MenuItem>
                      <MenuItem value="Executive">Executive Level</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Workplace Type</InputLabel>
                    <Select
                      name="workPlaceType"
                      value={editedJob.workPlaceType || ''}
                      onChange={handleEditChange}
                      label="Workplace Type"
                    >
                      <MenuItem value="On-site">On-site</MenuItem>
                      <MenuItem value="Remote">Remote</MenuItem>
                      <MenuItem value="Hybrid">Hybrid</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Deadline"
                    name="deadline"
                    type="date"
                    value={editedJob.deadline || ''}
                    onChange={handleEditChange}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    multiline
                    rows={4}
                    value={editedJob.description || ''}
                    onChange={handleEditChange}
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSave} color="primary" variant="contained">
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default MyJobs;
