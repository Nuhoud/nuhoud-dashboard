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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
import { 
  getActiveJobOffers,
  getApiErrorMessage,
  getEmployerJobStatisticsById,
  getEmployerJobsById,
  getJobOffers,
  JOB_STATUS_OPTIONS,
  updateExpiredJobOffers,
  updateJobOfferStatus
} from '../../services/api';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import EditIcon from '@mui/icons-material/Edit';
import UpdateIcon from '@mui/icons-material/Update';
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

const statusOptions = JOB_STATUS_OPTIONS;

const currencyOptions = ['USD', 'EUR', 'SYP'];

const isValidMongoId = (value) => /^[a-fA-F0-9]{24}$/.test(value);

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
  const [viewMode, setViewMode] = useState('all');
  const [scope, setScope] = useState('all');
  const [employerId, setEmployerId] = useState('');
  const [employerStats, setEmployerStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState('');
  const [updateExpiredOpen, setUpdateExpiredOpen] = useState(false);
  const [updateExpiredLoading, setUpdateExpiredLoading] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState(null);
  const [statusValue, setStatusValue] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);
  
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
      field: 'companyName', 
      headerName: 'Company', 
      flex: 1.5,
      minWidth: 150,

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
      renderCell: (params) => {
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
      renderCell: (params) => (
        <Chip
          label={params.value ? new Date(params.value).toLocaleDateString() : 'N/A'}
          size="small"
          color="primary"
          variant="outlined"
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      width: 140,
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
          <Tooltip title="Update Status">
            <IconButton
              onClick={() => handleOpenStatusDialog(params.row)}
              color="secondary"
              size="small"
            >
              <EditIcon />
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
      setError('');
      const params = buildQueryParams();
      const effectiveParams = { ...params };

      if (viewMode === 'active' && !effectiveParams.status) {
        effectiveParams.status = statusOptions[0];
      }

      const { q, ...listParams } = effectiveParams;
      const hasSearch = Boolean(q);
      const inEmployerScope = scope === 'employer';
      const hasValidEmployerId = inEmployerScope && isValidMongoId(employerId);

      if (inEmployerScope && !hasValidEmployerId) {
        setJobs([]);
        setTotalCount(0);
        setLoading(false);
        setError(employerId ? 'Invalid employer ID.' : 'Enter an employer ID to view employer jobs.');
        return;
      }

      let response;
      if (hasValidEmployerId) {
        if (hasSearch) {
          response = await getJobOffers({ ...listParams, q, employerId }, 'search');
        } else {
          response = await getEmployerJobsById(employerId, listParams);
        }
      } else if (viewMode === 'active' && !hasSearch) {
        response = await getActiveJobOffers(listParams);
      } else {
        const endpoint = hasSearch ? 'search' : '';
        response = await getJobOffers({ ...listParams, q }, endpoint);
      }
      
      setJobs(response.data || []);
      setTotalCount(response.total || 0);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      const message = getApiErrorMessage(err, 'Failed to load job offers. Please try again.');
      setError(message);
      setSnackbar({
        open: true,
        message,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [buildQueryParams, viewMode, scope, employerId]);

  // Fetch jobs when filters, pagination, or sorting changes
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    if (scope !== 'employer' || !isValidMongoId(employerId)) {
      setEmployerStats(null);
      setStatsError('');
      return;
    }

    let isActive = true;
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        setStatsError('');
        const data = await getEmployerJobStatisticsById(employerId);
        if (isActive) {
          setEmployerStats(data);
        }
      } catch (err) {
        if (isActive) {
          setStatsError(getApiErrorMessage(err, 'Failed to load employer stats.'));
        }
      } finally {
        if (isActive) {
          setStatsLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      isActive = false;
    };
  }, [scope, employerId]);

  const handleFilterChange = (field) => (event) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    setPaginationModel(prev => ({ ...prev, page: 0 }));
  };

  const handleSearchChange = (event) => {
    setFilters(prev => ({
      ...prev,
      q: event.target.value
    }));
    setPaginationModel(prev => ({ ...prev, page: 0 }));
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
    setPaginationModel(prev => ({ ...prev, page: 0 }));
  };

  const handleScopeChange = (event) => {
    const nextScope = event.target.value;
    setScope(nextScope);
    setPaginationModel(prev => ({ ...prev, page: 0 }));
    if (nextScope !== 'employer') {
      setEmployerId('');
      setEmployerStats(null);
      setStatsError('');
    } else {
      setFilters(prev => ({ ...prev, q: '' }));
    }
  };

  const handleViewModeChange = (event) => {
    setViewMode(event.target.value);
    setPaginationModel(prev => ({ ...prev, page: 0 }));
  };

  const handleEmployerIdChange = (event) => {
    setEmployerId(event.target.value.trim());
    setPaginationModel(prev => ({ ...prev, page: 0 }));
  };

  const handleOpenStatusDialog = (job) => {
    setStatusTarget(job);
    setStatusValue(job?.status || statusOptions[0] || '');
    setStatusDialogOpen(true);
  };

  const handleCloseStatusDialog = () => {
    setStatusDialogOpen(false);
    setStatusTarget(null);
    setStatusValue('');
  };

  const handleUpdateStatus = async () => {
    if (!statusTarget || !statusValue) return;
    try {
      setStatusUpdating(true);
      await updateJobOfferStatus(statusTarget._id, statusValue);
      setSnackbar({
        open: true,
        message: 'Job status updated successfully.',
        severity: 'success'
      });
      handleCloseStatusDialog();
      fetchJobs();
    } catch (err) {
      setSnackbar({
        open: true,
        message: getApiErrorMessage(err, 'Failed to update job status.'),
        severity: 'error'
      });
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleUpdateExpiredConfirm = async () => {
    try {
      setUpdateExpiredLoading(true);
      const result = await updateExpiredJobOffers();
      setSnackbar({
        open: true,
        message: result?.message || 'Expired job offers updated.',
        severity: 'success'
      });
      setUpdateExpiredOpen(false);
      fetchJobs();
    } catch (err) {
      setSnackbar({
        open: true,
        message: getApiErrorMessage(err, 'Failed to update expired job offers.'),
        severity: 'error'
      });
    } finally {
      setUpdateExpiredLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
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
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Scope</InputLabel>
              <Select
                value={scope}
                onChange={handleScopeChange}
                label="Scope"
              >
                <MenuItem value="all">All Jobs</MenuItem>
                <MenuItem value="employer">Employer Jobs</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {scope === 'employer' && (
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Employer ID"
                value={employerId}
                onChange={handleEmployerIdChange}
                error={Boolean(employerId) && !isValidMongoId(employerId)}
                helperText={employerId && !isValidMongoId(employerId) ? 'Enter a valid 24-character ID.' : ' '}
                placeholder="e.g. 507f1f77bcf86cd799439011"
              />
            </Grid>
          )}

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>View</InputLabel>
              <Select
                value={viewMode}
                onChange={handleViewModeChange}
                label="View"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="active">Active Only</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Search */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search"
              value={filters.q}
              onChange={handleSearchChange}
              disabled={scope === 'employer'}
              helperText={scope === 'employer' ? 'Search is disabled in employer scope.' : ' '}
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

  const renderEmployerStats = () => {
    if (scope !== 'employer') return null;

    return (
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title="Employer Statistics"
          subheader={employerId ? `Employer ID: ${employerId}` : 'Provide an employer ID to load stats.'}
        />
        <Divider />
        <CardContent>
          {statsLoading && (
            <Box display="flex" alignItems="center" justifyContent="center" minHeight={80}>
              <CircularProgress size={24} />
            </Box>
          )}
          {!statsLoading && statsError && (
            <Alert severity="error">{statsError}</Alert>
          )}
          {!statsLoading && !statsError && employerStats && (
            <Grid container spacing={2}>
              {[
                { label: 'Total', value: employerStats.total ?? 0 },
                { label: 'Active', value: employerStats.active ?? 0 },
                { label: 'Closed', value: employerStats.closed ?? 0 },
                { label: 'Expired', value: employerStats.expired ?? 0 },
                { label: 'Draft', value: employerStats.draft ?? 0 },
                { label: 'Applications', value: employerStats.totalApplications ?? 0 }
              ].map((item) => (
                <Grid item xs={6} md={2} key={item.label}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {item.label}
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {item.value}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
          {!statsLoading && !statsError && !employerStats && (
            <Typography variant="body2" color="text.secondary">
              Enter a valid employer ID to view statistics.
            </Typography>
          )}
        </CardContent>
      </Card>
    );
  };

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
        <Button
          variant="outlined"
          startIcon={<UpdateIcon />}
          onClick={() => setUpdateExpiredOpen(true)}
          disabled={updateExpiredLoading}
        >
          Update Expired
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {renderFilters()}
      {renderEmployerStats()}

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

      <Dialog
        open={updateExpiredOpen}
        onClose={() => setUpdateExpiredOpen(false)}
      >
        <DialogTitle>Update Expired Job Offers</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will mark any active job offers with past deadlines as expired. Continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateExpiredOpen(false)} disabled={updateExpiredLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdateExpiredConfirm}
            disabled={updateExpiredLoading}
          >
            {updateExpiredLoading ? 'Updating...' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={statusDialogOpen}
        onClose={handleCloseStatusDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Update Job Status</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Choose a new status for this job offer.
          </DialogContentText>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusValue}
              onChange={(event) => setStatusValue(event.target.value)}
              label="Status"
            >
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusDialog} disabled={statusUpdating}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdateStatus}
            disabled={statusUpdating || !statusValue}
          >
            {statusUpdating ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default JobOffers;

