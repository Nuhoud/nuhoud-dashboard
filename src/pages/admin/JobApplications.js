import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { getAllJobApplications } from '../../services/api';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';

const AdminJobApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const columns = [
    { field: 'title', headerName: 'Job Title', width: 250 },
    { field: 'jobLocation', headerName: 'Location', width: 150 },
    { field: 'experienceLevel', headerName: 'Experience', width: 130 },
    { field: 'jobType', headerName: 'Type', width: 130 },
    { field: 'workPlaceType', headerName: 'Workplace', width: 130 },
    {
      field: 'salaryRange',
      headerName: 'Salary',
      width: 150,
      valueGetter: (params) => {
        if (!params?.row) return '';
        const salary = params.row.salaryRange;
        return salary ? `${salary.min} - ${salary.max} ${salary.currency}` : 'Not specified';
      },
    },
    {
      field: 'deadline',
      headerName: 'Deadline',
      width: 120,
      valueGetter: (params) => params?.row ? new Date(params.row.deadline).toLocaleDateString() : '',
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => {
        if (!params?.row) return null;
        return (
          <Chip
            label={params.value}
            color={params.value === 'مفتوح' ? 'success' : 'default'}
            size="small"
          />
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Tooltip title="View Details">
          <IconButton
            onClick={() => handleViewDetails(params.row._id)}
            color="primary"
            size="small"
          >
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await getAllJobApplications();
      console.log('Fetched applications:', response);
      setApplications(Array.isArray(response) ? response : response.data || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load job applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleViewDetails = (jobId) => {
    navigate(`/admin/job-offers/${jobId}/details`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, color: '#1976d2', mb: 3 }}>
        All Job Applications
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={applications.map(app => ({ ...app, id: app._id }))}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          checkboxSelection
          disableSelectionOnClick
          components={{
            Toolbar: GridToolbar,
          }}
          componentsProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
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

export default AdminJobApplications; 