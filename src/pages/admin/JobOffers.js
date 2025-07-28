import React, { useEffect, useState, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Snackbar, 
  Alert, 
  CircularProgress, 
  Chip, 
  Paper, 
  IconButton, 
  Tooltip, 
  TextField, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Card,
  CardContent,
  CardHeader,
  Divider,
  InputAdornment
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { getJobOffers } from '../../services/api';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import { useNavigate } from 'react-router-dom';

const experienceLevels = [
  'Entry Level', 
  'Intership', 
  'Mid Level', 
  'Senior Level', 
  'Associate', 
  'Director', 
  'Executive'
];

const workPlaceTypes = ['عن بعد', 'في الشركة', 'مزيج'];

const jobTypes = [
  'دوام كامل', 
  'دوام جزئي', 
  'عقد', 
  'مستقل', 
  'تدريب'
];

const statusOptions = [
  'مفتوح',
  'مغلق',
  'منتهي الصلاحية',
  'مسودة'
];

const currencyOptions = ['USD', 'EUR', 'SYP'];

// Default pagination
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

const JobOffers = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState({
    page: DEFAULT_PAGE - 1, // MUI DataGrid is 0-indexed
    pageSize: DEFAULT_PAGE_SIZE,
  });
  const [sortModel, setSortModel] = useState([
    { field: 'postedAt', sort: 'desc' },
  ]);
  
  // Filters state
  const [filters, setFilters] = useState({
    workPlaceType: '',
    jobType: '',
    jobLocation: '',
    companyName: '',
    experienceLevel: '',
    status: '',
    salaryMin: '',
    salaryMax: '',
    currency: 'SYP',
    q: '' // Search term
  });
  
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });
  const [error, setError] = useState('');

  const columns = [
    { 
      field: 'title', 
      headerName: 'Job Title', 
      flex: 2,
      minWidth: 200,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {params.value}
        </Typography>
      )
    },
    { 
      field: 'employer', 
      headerName: 'Company', 
      flex: 1.5,
      minWidth: 150,
      valueGetter: (params) => {
        if (!params?.row) return 'N/A';
        return params.row.employer?.company || 'N/A';
      }
    },
    { 
      field: 'jobLocation', 
      headerName: 'Location',
      flex: 1,
      minWidth: 120
    },
    { 
      field: 'jobType', 
      headerName: 'Type', 
      flex: 1,
      minWidth: 120,
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
      flex: 1,
      minWidth: 140,
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
      flex: 1,
      minWidth: 120,
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
      field: 'salaryRange',
      headerName: 'Salary',
      flex: 1.5,
      minWidth: 150,
      valueGetter: (params) => {
        if (!params.value) return 'N/A';
        const { min, max, currency } = params.value;
        return min && max ? `${min} - ${max} ${currency}` : 'N/A';
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      minWidth: 120,
      renderCell: (params) => {
        const statusColors = {
          'مفتوح': 'success',
          'مغلق': 'error',
          'منتهي الصلاحية': 'warning',
          'مسودة': 'default'
        };
        return (
          <Chip
            label={params.value}
            color={statusColors[params.value] || 'default'}
            size="small"
          />
        );
      },
    },
    {
      field: 'postedAt',
      headerName: 'Posted',
      flex: 1,
      minWidth: 120,
      valueFormatter: (params) => {
        return params.value ? new Date(params.value).toLocaleDateString() : 'N/A';
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      width: 100,
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

  const buildQueryParams = useCallback(() => {
    const params = {
      page: paginationModel.page + 1, // Convert to 1-based for backend
      limit: paginationModel.pageSize,
    };

    // Add sorting
    if (sortModel.length > 0) {
      const { field, sort } = sortModel[0];
      params.sortBy = field;
      params.sortOrder = sort;
    }

    // Add filters (only include non-empty values)
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        // Handle special cases for salary range
        if (key === 'salaryMin' && value !== '') {
          params[`salaryRange.min`] = value;
        } else if (key === 'salaryMax' && value !== '') {
          params[`salaryRange.max`] = value;
        } else if (key === 'currency' && value) {
          params[`salaryRange.currency`] = value;
        } else if (value !== '') {
          params[key] = value;
        }
      }
    });

    return params;
  }, [paginationModel, sortModel, filters]);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const params = buildQueryParams();
      
      // Use search endpoint if there's a search term, otherwise use regular endpoint
      const endpoint = params.q ? 'search' : '';
      const response = await getJobOffers(params, endpoint);
      
      setJobs(response.data || []);
      setTotalCount(response.total || 0);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load job offers. Please try again.');
      setSnackbar({
        open: true,
        message: 'Failed to load job offers',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [buildQueryParams]);

  // Fetch jobs when filters, pagination, or sorting changes
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleFilterChange = (field) => (event) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSearchChange = (event) => {
    setFilters(prev => ({
      ...prev,
      q: event.target.value
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      workPlaceType: '',
      jobType: '',
      jobLocation: '',
      companyName: '',
      experienceLevel: '',
      status: '',
      salaryMin: '',
      salaryMax: '',
      currency: 'SYP',
      q: ''
    });
  };

  const handlePaginationModelChange = (newPaginationModel) => {
    setPaginationModel(newPaginationModel);
  };

  const handleSortModelChange = (newSortModel) => {
    setSortModel(newSortModel);
  };

  const renderErrorMessages = (error) => {
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
  };

  const renderFilters = () => (
    <Card sx={{ mb: 3 }}>
      <CardHeader 
        title="Filters" 
        action={
          <Button 
            onClick={handleResetFilters}
            variant="outlined"
            color="secondary"
            size="small"
          >
            Reset Filters
          </Button>
        }
      />
      <Divider />
      <CardContent>
        <Grid container spacing={2}>
          {/* Search */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search"
              value={filters.q}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              placeholder="Search job titles, companies..."
            />
          </Grid>
          
          {/* Work Place Type */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Work Place</InputLabel>
              <Select
                value={filters.workPlaceType}
                onChange={handleFilterChange('workPlaceType')}
                label="Work Place"
              >
                <MenuItem value="">All</MenuItem>
                {workPlaceTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {/* Job Type */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Job Type</InputLabel>
              <Select
                value={filters.jobType}
                onChange={handleFilterChange('jobType')}
                label="Job Type"
              >
                <MenuItem value="">All</MenuItem>
                {jobTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {/* Experience Level */}
          <Grid item xs={12} sm={6} md={2}>
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
          
          {/* Status */}
          <Grid item xs={12} sm={6} md={2}>
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
          
          {/* Salary Range */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Currency</InputLabel>
              <Select
                value={filters.currency}
                onChange={handleFilterChange('currency')}
                label="Currency"
              >
                {currencyOptions.map((currency) => (
                  <MenuItem key={currency} value={currency}>
                    {currency}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={4.5} md={2}>
            <TextField
              fullWidth
              label="Min Salary"
              type="number"
              value={filters.salaryMin}
              onChange={handleFilterChange('salaryMin')}
              InputProps={{
                inputProps: { min: 0 }
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={4.5} md={2}>
            <TextField
              fullWidth
              label="Max Salary"
              type="number"
              value={filters.salaryMax}
              onChange={handleFilterChange('salaryMax')}
              InputProps={{
                inputProps: { min: 0 }
              }}
            />
          </Grid>
          
          {/* Location */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Location"
              value={filters.jobLocation}
              onChange={handleFilterChange('jobLocation')}
              placeholder="City or country"
            />
          </Grid>
          
          {/* Company Name */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Company"
              value={filters.companyName}
              onChange={handleFilterChange('companyName')}
              placeholder="Company name"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  if (loading && jobs.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 600 }}>
          Job Offers
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {renderFilters()}

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={jobs}
          columns={columns}
          loading={loading}
          rowCount={totalCount}
          pageSizeOptions={[10, 25, 50]}
          pagination
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          sortingMode="server"
          sortModel={sortModel}
          onSortModelChange={handleSortModelChange}
          disableRowSelectionOnClick
          components={{
            Toolbar: GridToolbar,
          }}
          componentsProps={{
            toolbar: {
              showQuickFilter: false,
            },
          }}
          sx={{
            '& .MuiDataGrid-toolbarContainer': {
              padding: 2,
              backgroundColor: 'transparent',
              borderBottom: '1px solid rgba(224, 224, 224, 1)'
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f5f5f5',
              fontWeight: 'bold',
            },
          }}
          getRowId={(row) => row._id}
        />
      </Paper>
    </Box>
  );
};

export default JobOffers;
