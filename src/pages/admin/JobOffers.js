import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert, CircularProgress, MenuItem, Chip, InputLabel, Select, FormControl, OutlinedInput, Paper, IconButton, Tooltip } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { getJobOffers, createJobOffer, deleteJobOffer } from '../../services/api';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PeopleIcon from '@mui/icons-material/People';
import { useNavigate } from 'react-router-dom';

const skillsList = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'MongoDB', 'Python', 'Django', 'SQL', 'AWS', 'Docker', 'Other'
];
const experienceLevels = ['Entry Level', 'Intership', 'Mid Level', 'Senior Level', 'Associate', 'Director', 'Executive'];
const workPlaceTypes = ['Onsite', 'Remote', 'مزيج'];
const jobTypes = ['دوام كامل', 'دوام جزئي', 'عقد', 'مستقل', 'تدريب'];

const JobOffers = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '', experienceLevel: '', workPlaceType: '', jobType: '', jobLocation: '', description: '', requirements: [], skillsRequired: [], salaryRange: { min: '', max: '', currency: 'SYP' }, deadline: '', status: 'مفتوح',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState('');

  const columns = [
    { 
      field: 'title', 
      headerName: 'Job Title', 
      width: 250,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {params.value}
        </Typography>
      )
    },
    { 
      field: 'company', 
      headerName: 'Company', 
      width: 200,
      valueGetter: (params) => {
        if (!params?.row) return 'N/A';
        return params.row.employer?.company || 'N/A';
      }
    },
    { 
      field: 'jobLocation', 
      headerName: 'Location', 
      width: 150 
    },
    { 
      field: 'jobType', 
      headerName: 'Type', 
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color="primary"
          variant="outlined"
        />
      )
    },
    { 
      field: 'experienceLevel', 
      headerName: 'Experience', 
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color="secondary"
          variant="outlined"
        />
      )
    },
    { 
      field: 'workPlaceType', 
      headerName: 'Workplace', 
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color="info"
          variant="outlined"
        />
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 'Active' ? 'success' : 'error'}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View Applications">
            <IconButton
              onClick={() => navigate(`/admin/job-offers/${params.row._id}/applications`)}
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

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await getJobOffers();
      setJobs(response.data || []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load job offers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleAddJob = async () => {
    try {
      const jobToSend = {
        ...newJob,
        requirements: newJob.requirements.filter(r => r.trim() !== ''),
        salaryRange: {
          min: Number(newJob.salaryRange.min) || 0,
          max: Number(newJob.salaryRange.max) || 0,
          currency: newJob.salaryRange.currency || 'SYP',
        },
      };
      await createJobOffer(jobToSend);
      setSnackbar({ open: true, message: 'Job created!', severity: 'success' });
      setOpenAdd(false);
      setNewJob({
        title: '', experienceLevel: '', workPlaceType: '', jobType: '', jobLocation: '', description: '', requirements: [], skillsRequired: [], salaryRange: { min: '', max: '', currency: 'SYP' }, deadline: '', status: 'مفتوح',
      });
      fetchJobs();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create job');
    }
  };

  const handleDeleteJob = async () => {
    try {
      await deleteJobOffer(deleteId);
      setSnackbar({ open: true, message: 'Job deleted!', severity: 'success' });
      setDeleteId(null);
      fetchJobs();
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete job', severity: 'error' });
    }
  };

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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom sx={{ color: '#1976d2', fontWeight: 600 }}>
        Job Offers
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={jobs.map(job => ({ ...job, id: job._id }))}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          components={{
            Toolbar: GridToolbar,
          }}
          componentsProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
          disableSelectionOnClick
          sx={{
            '& .MuiDataGrid-toolbarContainer': {
              padding: 2,
              backgroundColor: '#f5f5f5',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f5f5f5',
              fontWeight: 'bold',
            },
          }}
        />
      </Paper>
    </Box>
  );
};

export default JobOffers;
