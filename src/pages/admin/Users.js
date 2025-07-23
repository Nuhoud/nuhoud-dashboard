import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Snackbar,
  Alert,
  Grid
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { getUsers, updateUser, deleteUser, createEmployer } from '../../services/api';

const columns = [
  { field: 'name', headerName: 'Name', width: 200 },
  { field: 'email', headerName: 'Email', width: 250 },
  {
    field: 'role',
    headerName: 'Role',
    width: 120,
    renderCell: (params) => {
      if (!params?.row) return null;
      let roleValue = params.row.role;
      // Only allow 'user', 'admin', or 'employer'
      if (!['user', 'admin', 'employer'].includes(roleValue)) {
        roleValue = 'user';
      }
      return (
        <Chip
          label={roleValue.charAt(0).toUpperCase() + roleValue.slice(1)}
          color={roleValue === 'admin' ? 'primary' : roleValue === 'employer' ? 'secondary' : 'default'}
          size="small"
          sx={{
            background: roleValue === 'admin' ? 'linear-gradient(135deg, #667eea, #764ba2)' : roleValue === 'employer' ? 'linear-gradient(135deg, #764ba2, #667eea)' : 'linear-gradient(135deg, #bdbdbd, #757575)',
            color: 'white',
            fontWeight: 500
          }}
        />
      );
    },
  },
  { field: 'createdAt', headerName: 'Created', width: 120, valueFormatter: (params) => {
    if (!params || !params.value) return 'N/A';
    return new Date(params.value).toLocaleDateString();
  }},
  {
    field: 'actions',
    headerName: 'Actions',
    width: 120,
    renderCell: (params) => {
      if (!params?.row) return null;
      return (
        <Box>
          <IconButton
            size="small"
            onClick={() => params.row.onEdit(params.row)}
            sx={{ color: '#667eea' }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => params.row.onDelete(params.row)}
            sx={{ color: '#ff5630' }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      );
    },
  },
];

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('user');
  const [editingUser, setEditingUser] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchUsers = useCallback(async (role = 'user') => {
    setLoading(true);
    try {
      const response = await getUsers(role);
      if (response.data) {
        // Try to find the array of users
        const usersArray = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data.data)
            ? response.data.data
            : [];
        const usersWithActions = usersArray.map(user => ({
          ...user,
          id: user._id,
          role: ['user', 'admin', 'employer'].includes(user.role) ? user.role : 'user',
          onEdit: handleEditClick,
          onDelete: handleDeleteClick,
        }));
        setUsers(usersWithActions);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch users:', error);
      setSnackbar({ open: true, message: 'Failed to fetch users', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(roleFilter);
  }, [roleFilter, fetchUsers]);

  const handleEditClick = (user) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      deleteUser(user.id)
        .then(() => {
          fetchUsers(roleFilter);
          setSnackbar({ open: true, message: 'User deleted successfully', severity: 'success' });
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to delete user:', error);
          setSnackbar({ open: true, message: 'Failed to delete user', severity: 'error' });
        });
    }
  };

  const handleEditSave = () => {
    updateUser(editingUser.id, editingUser)
      .then(() => {
        setIsEditDialogOpen(false);
        setEditingUser(null);
        fetchUsers(roleFilter);
        setSnackbar({ open: true, message: 'User updated successfully', severity: 'success' });
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Failed to update user:', error);
        setSnackbar({ open: true, message: 'Failed to update user', severity: 'error' });
      });
  };

  const handleCreateSave = () => {
    // Prepare payload for createEmployer
    const payload = {
      name: editingUser.name,
      email: editingUser.email,
      role: editingUser.role
    };
    createEmployer(payload)
      .then(() => {
        setIsCreateDialogOpen(false);
        setEditingUser(null);
        fetchUsers(roleFilter);
        setSnackbar({ open: true, message: 'User created successfully', severity: 'success' });
      })
      .catch((error) => {
        // Show error as string or list, not as object
        let errorMsg = 'Failed to create user';
        if (error.response?.data?.message) {
          errorMsg = Array.isArray(error.response.data.message)
            ? error.response.data.message.join(', ')
            : error.response.data.message;
        } else if (typeof error.message === 'string') {
          errorMsg = error.message;
        }
        setSnackbar({ open: true, message: errorMsg, severity: 'error' });
      });
  };

  const fetchAllUsers = async () => {
    const [users, employers, admins] = await Promise.all([
      getUsers('user'),
      getUsers('employer'),
      getUsers('admin')
    ]);
    return [
      ...users.data, 
      ...employers.data, 
      ...admins.data
    ];
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700} sx={{ color: '#667eea' }}>
          Users Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingUser({ name: '', email: '', role: 'employer' });
            setIsCreateDialogOpen(true);
          }}
          sx={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            borderRadius: 2,
            px: 3,
            py: 1,
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8, #6a4190)',
            }
          }}
        >
          Add User
        </Button>
      </Box>

      <Paper sx={{ p: 3, borderRadius: 4, background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <Box sx={{ mb: 3 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Role</InputLabel>
            <Select
              value={roleFilter}
              label="Filter by Role"
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="employer">Employer</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <DataGrid
          rows={users}
          columns={columns}
          loading={loading}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          disableSelectionOnClick
          getRowId={(row) => row._id || row.id}
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid rgba(0,0,0,0.08)',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'rgba(102, 126, 234, 0.08)',
              color: '#667eea',
              fontWeight: 600,
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'rgba(102, 126, 234, 0.04)',
            },
          }}
        />
      </Paper>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: '#667eea', fontWeight: 600 }}>Edit User</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={editingUser?.name || ''}
                onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                value={editingUser?.email || ''}
                onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={editingUser?.role || 'user'}
                  label="Role"
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                >
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="employer">Employer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleEditSave}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8, #6a4190)',
              }
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: '#667eea', fontWeight: 600 }}>Create New User</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={editingUser?.name || ''}
                onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                value={editingUser?.email || ''}
                onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={editingUser?.role || 'user'}
                  label="Role"
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                >
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="employer">Employer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateSave}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8, #6a4190)',
              }
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Users;
