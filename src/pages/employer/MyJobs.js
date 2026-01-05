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
  Grid,
  TablePagination,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PeopleIcon from '@mui/icons-material/People';
import { 
  deleteJobOffer,
  getApiErrorMessage,
  getEmployerJobStatistics,
  getEmployerJobs,
  getExpiringSoonJobs,
  JOB_STATUS_OPTIONS,
  updateJobOffer
} from '../../services/api';

const experienceLevels = [
  'Entry Level',
  'Intership',
  'Mid Level',
  'Senior Level',
  'Associate',
  'Director',
  'Executive'
];

const statusOptions = JOB_STATUS_OPTIONS;

const MyJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [editedJob, setEditedJob] = useState(null);
  const [page, setPage] = useState(0); // TablePagination is 0-based
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState('postedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filters, setFilters] = useState({
    status: '',
    jobLocation: '',
    experienceLevel: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    closed: 0,
    expired: 0,
    draft: 0,
    totalApplications: 0
  });
  const [statsLoading, setStatsLoading] = useState(false);
  const [expiringDays, setExpiringDays] = useState(7);
  const [expiringJobs, setExpiringJobs] = useState([]);
  const [expiringLoading, setExpiringLoading] = useState(false);
  const [expiringError, setExpiringError] = useState('');

  const buildQueryParams = () => {
    const params = {
      page: page + 1,
      limit,
      sortBy,
      sortOrder
    };

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        params[key] = value;
      }
    });

    return params;
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getEmployerJobs(buildQueryParams());
      setJobs(response.data || []);
      setTotal(response.total || 0);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load jobs. Please try again.'));
      setJobs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await getEmployerJobStatistics();
      setStats(response || {});
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load job statistics.'));
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchExpiringSoon = async () => {
    try {
      setExpiringLoading(true);
      setExpiringError('');
      const response = await getExpiringSoonJobs(expiringDays);
      setExpiringJobs(Array.isArray(response) ? response : response?.data || []);
    } catch (err) {
      setExpiringError(getApiErrorMessage(err, 'Failed to load expiring jobs.'));
      setExpiringJobs([]);
    } finally {
      setExpiringLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line
  }, [page, limit, sortBy, sortOrder, filters]);

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchExpiringSoon();
    // eslint-disable-next-line
  }, [expiringDays]);

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
      fetchStats();
      fetchExpiringSoon();
    } catch (err) {
      console.error('Error deleting job:', err);
      setError(getApiErrorMessage(err, 'Failed to delete job. Please try again.'));
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
      fetchStats();
      fetchExpiringSoon();
    } catch (err) {
      console.error('Error updating job:', err);
      setError(getApiErrorMessage(err, 'Failed to update job. Please try again.'));
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

  const handleFilterChange = (field) => (event) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    setPage(0);
  };

  const handleResetFilters = () => {
    setFilters({
      status: '',
      jobLocation: '',
      experienceLevel: ''
    });
    setPage(0);
  };

  const handleExpiringDaysChange = (event) => {
    setExpiringDays(Number(event.target.value));
  };

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
      renderCell: (params) => {
        if (!params?.row) return null;
        return (
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
        );
      },
    },
  ];

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 600 }}>
          My Job Offers
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/employer/jobs/create')}
          sx={(theme) => ({
            borderRadius: 2,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            '&:hover': { 
              background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`
            }
          })}
        >
          Create New Job
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statsLoading ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <CircularProgress size={24} />
            </Paper>
          </Grid>
        ) : (
          [
            { label: 'Total Jobs', value: stats.total ?? 0 },
            { label: 'Active', value: stats.active ?? 0 },
            { label: 'Closed', value: stats.closed ?? 0 },
            { label: 'Expired', value: stats.expired ?? 0 },
            { label: 'Draft', value: stats.draft ?? 0 },
            { label: 'Applications', value: stats.totalApplications ?? 0 }
          ].map((item) => (
            <Grid item xs={6} md={2} key={item.label}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  {item.label}
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  {item.value}
                </Typography>
              </Paper>
            </Grid>
          ))
        )}
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardHeader
          title="Filters"
          action={
            <Button variant="outlined" onClick={handleResetFilters}>
              Reset
            </Button>
          }
        />
        <Divider />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={handleFilterChange('status')}
                  label="Status"
                >
                  <MenuItem value="">All</MenuItem>
                  {statusOptions.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Experience</InputLabel>
                <Select
                  value={filters.experienceLevel}
                  onChange={handleFilterChange('experienceLevel')}
                  label="Experience"
                >
                  <MenuItem value="">All</MenuItem>
                  {experienceLevels.map((level) => (
                    <MenuItem key={level} value={level}>
                      {level}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Location"
                value={filters.jobLocation}
                onChange={handleFilterChange('jobLocation')}
                placeholder="City or country"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardHeader
          title="Expiring Soon"
          action={
            <FormControl size="small">
              <Select value={expiringDays} onChange={handleExpiringDaysChange}>
                <MenuItem value={7}>Next 7 days</MenuItem>
                <MenuItem value={14}>Next 14 days</MenuItem>
                <MenuItem value={30}>Next 30 days</MenuItem>
              </Select>
            </FormControl>
          }
        />
        <Divider />
        <CardContent>
          {expiringLoading && (
            <Box display="flex" justifyContent="center">
              <CircularProgress size={24} />
            </Box>
          )}
          {!expiringLoading && expiringError && (
            <Alert severity="error">{expiringError}</Alert>
          )}
          {!expiringLoading && !expiringError && expiringJobs.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No job offers are expiring in the selected window.
            </Typography>
          )}
          {!expiringLoading && !expiringError && expiringJobs.length > 0 && (
            <Box display="flex" flexDirection="column" gap={2}>
              {expiringJobs.map((job) => (
                <Box
                  key={job._id}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography variant="subtitle2">{job.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {job.jobLocation} • {job.jobType}
                    </Typography>
                  </Box>
                  <Chip
                    label={new Date(job.deadline).toLocaleDateString()}
                    size="small"
                    color="warning"
                    variant="outlined"
                  />
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

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
                  <TableCell>Status</TableCell>
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
                    <TableCell>
                      <Chip label={job.status || 'N/A'} size="small" variant="outlined" />
                    </TableCell>
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
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={limit}
            onRowsPerPageChange={e => { setLimit(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
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
