import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  TablePagination,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { getJobApplications, getJobOffer } from '../../services/api';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import { useNavigate } from 'react-router-dom';

const JobApplicationsList = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [jobDetails, setJobDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [sortModel, setSortModel] = useState([{ field: 'postedAt', sort: 'desc' }]);

  const columns = [
    { 
      field: 'applicantName', 
      headerName: 'Applicant Name', 
      width: 200,
      valueGetter: (params) => params.row.applicant?.name || 'N/A'
    },
    { 
      field: 'applicantEmail', 
      headerName: 'Email', 
      width: 200,
      valueGetter: (params) => params.row.applicant?.email || 'N/A'
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={
            params.value === 'Pending' ? 'warning' :
            params.value === 'Accepted' ? 'success' :
            params.value === 'Rejected' ? 'error' : 'default'
          }
          size="small"
        />
      )
    },
    {
      field: 'postedAt',
      headerName: 'Applied On',
      width: 180,
      valueGetter: (params) => new Date(params.row.postedAt).toLocaleString()
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View Application">
            <IconButton
              onClick={() => handleViewApplication(params.row._id)}
              color="primary"
              size="small"
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          {params.row.resume && (
            <Tooltip title="Download Resume">
              <IconButton
                onClick={() => handleDownloadResume(params.row.resume)}
                color="primary"
                size="small"
              >
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  const fetchJobDetails = async () => {
    try {
      const response = await getJobOffer(jobId);
      setJobDetails(response);
    } catch (err) {
      console.error('Error fetching job details:', err);
      setError('Failed to load job details');
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await getJobApplications(jobId, {
        page: page + 1,
        limit: pageSize,
        sortBy: sortModel[0]?.field || 'postedAt',
        sortOrder: sortModel[0]?.sort || 'desc'
      });
      
      setApplications(response.data || []);
      setTotalCount(response.total || 0);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  useEffect(() => {
    fetchApplications();
  }, [jobId, page, pageSize, sortModel]);

  const handleViewApplication = (applicationId) => {
    navigate(`/admin/applications/${applicationId}`);
  };

  const handleDownloadResume = (resumeUrl) => {
    window.open(resumeUrl, '_blank');
  };

  if (loading && !applications.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {jobDetails && (
        <Box mb={3}>
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#1976d2', mb: 1 }}>
            Applications for {jobDetails.title}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Location: {jobDetails.jobLocation} | Type: {jobDetails.jobType} | 
            Experience: {jobDetails.experienceLevel}
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={applications.map(app => ({ ...app, id: app._id }))}
          columns={columns}
          pagination
          pageSize={pageSize}
          rowCount={totalCount}
          paginationMode="server"
          sortingMode="server"
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          onSortModelChange={(newSortModel) => setSortModel(newSortModel)}
          rowsPerPageOptions={[5, 10, 20, 50]}
          components={{
            Toolbar: GridToolbar,
          }}
          componentsProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
          loading={loading}
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

export default JobApplicationsList; 