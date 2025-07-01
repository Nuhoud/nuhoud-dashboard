import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Paper,
  IconButton,
  Chip,
  Tooltip
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import { getApplications, updateApplicationStatus, deleteApplication } from '../../services/api';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';

const Applications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editApp, setEditApp] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteId, setDeleteId] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [sortModel, setSortModel] = useState([{ field: 'createdAt', sort: 'desc' }]);
  const [filterModel, setFilterModel] = useState({
    items: [],
    quickFilterValues: []
  });

  const columns = [
    { 
      field: 'jobTitle', 
      headerName: 'Job Title', 
      width: 250,
      valueGetter: (params) => params.row.jobOffer?.title || 'N/A'
    },
    { 
      field: 'applicantName', 
      headerName: 'Applicant', 
      width: 200,
      valueGetter: (params) => params.row.applicant?.name || 'N/A'
    },
    { 
      field: 'applicantEmail', 
      headerName: 'Email', 
      width: 220,
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
            params.value === 'Rejected' ? 'error' :
            params.value === 'Interviewing' ? 'info' : 'default'
          }
          size="small"
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Applied On',
      width: 180,
      valueGetter: (params) => params.value ? new Date(params.value).toLocaleString() : 'N/A'
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View Details">
            <IconButton 
              color="primary" 
              size="small"
              onClick={() => handleView(params.row._id)}
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Status">
            <IconButton 
              color="info" 
              size="small"
              onClick={() => handleEdit(params.row)}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton 
              color="error" 
              size="small"
              onClick={() => setDeleteId(params.row._id)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const filters = {
        page: page + 1,
        limit: pageSize,
        sortBy: sortModel[0]?.field || 'createdAt',
        sortOrder: sortModel[0]?.sort || 'desc',
        search: filterModel.quickFilterValues[0] || '',
        ...filterModel.items.reduce((acc, filter) => {
          if (filter.value) {
            acc[filter.field] = filter.value;
          }
          return acc;
        }, {})
      };

      const res = await getApplications(filters);
      setApplications(res.data.map(app => ({ ...app, id: app._id })));
      setTotalCount(res.total || res.data.length);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load applications',
        severity: 'error'
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchApplications();
  }, [page, pageSize, sortModel, filterModel]);

  const handleView = (id) => {
    navigate(`/admin/applications/${id}`);
  };

  const handleEdit = (app) => {
    setEditApp(app);
    setEditStatus(app.status || '');
  };

  const handleSaveStatus = async () => {
    try {
      await updateApplicationStatus(editApp._id, { status: editStatus });
      setSnackbar({ open: true, message: 'Status updated!', severity: 'success' });
      setEditApp(null);
      fetchApplications();
    } catch (error) {
      console.error('Error updating status:', error);
      setSnackbar({ open: true, message: 'Failed to update status', severity: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteApplication(deleteId);
      setSnackbar({ open: true, message: 'Application deleted!', severity: 'success' });
      setDeleteId(null);
      fetchApplications();
    } catch (error) {
      console.error('Error deleting application:', error);
      setSnackbar({ open: true, message: 'Failed to delete application', severity: 'error' });
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Topbar />
        <Typography variant="h4" gutterBottom>Applications</Typography>
        <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 3, mt: 2 }}>
          <Box sx={{ height: 600, width: '100%' }}>
            {loading ? <CircularProgress /> : (
              <DataGrid
                rows={applications}
                columns={columns}
                pagination
                pageSize={pageSize}
                rowCount={totalCount}
                rowsPerPageOptions={[10, 20, 50]}
                paginationMode="server"
                sortingMode="server"
                filterMode="server"
                onPageChange={(newPage) => setPage(newPage)}
                onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                onSortModelChange={(newSortModel) => setSortModel(newSortModel)}
                onFilterModelChange={(newFilterModel) => setFilterModel(newFilterModel)}
                loading={loading}
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
            )}
          </Box>
        </Paper>
        {/* Edit Status Modal */}
        <Dialog open={!!editApp} onClose={() => setEditApp(null)}>
          <DialogTitle>Update Application Status</DialogTitle>
          <DialogContent sx={{ pt: '20px !important', minWidth: 300 }}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={editStatus}
                label="Status"
                onChange={(e) => setEditStatus(e.target.value)}
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Reviewing">Reviewing</MenuItem>
                <MenuItem value="Shortlisted">Shortlisted</MenuItem>
                <MenuItem value="Interviewing">Interviewing</MenuItem>
                <MenuItem value="Offered">Offered</MenuItem>
                <MenuItem value="Hired">Hired</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
                <MenuItem value="Withdrawn">Withdrawn</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditApp(null)}>Cancel</Button>
            <Button onClick={handleSaveStatus} variant="contained">Save</Button>
          </DialogActions>
        </Dialog>
        {/* Delete Confirmation */}
        <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
          <DialogTitle>Delete Application</DialogTitle>
          <DialogContent>
            Are you sure you want to delete this application? This action cannot be undone.
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
          </DialogActions>
        </Dialog>
        {/* Snackbar */}
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={3000} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default Applications;
