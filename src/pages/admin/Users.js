import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Avatar,
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
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { getApiErrorMessage, getUsers, updateUser, deleteUser, createEmployer } from '../../services/api';

const EMPTY_VALUE = '-';

const formatDateTime = (value) => {
  if (!value) return EMPTY_VALUE;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return EMPTY_VALUE;
  const pad = (num) => String(num).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const formatDate = (value) => {
  if (!value) return EMPTY_VALUE;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return EMPTY_VALUE;
  const pad = (num) => String(num).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const formatLabel = (value) => {
  if (!value) return '';
  return String(value)
    .replace(/_/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const normalizeUsersPayload = (payload) => {
  if (Array.isArray(payload)) {
    return { data: payload, total: payload.length, page: 1, totalPages: 1 };
  }
  const data = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.data?.data)
      ? payload.data.data
      : [];
  const total = Number(payload?.total ?? payload?.data?.total ?? data.length) || 0;
  const page = Number(payload?.page ?? payload?.data?.page ?? 1) || 1;
  const totalPages = Number(payload?.totalPages ?? payload?.data?.totalPages ?? (total ? Math.ceil(total / (data.length || 1)) : 1)) || 1;
  return { data, total, page, totalPages };
};

const UserDetailsDialog = ({ open, onClose, user }) => {
  if (!user) return null;

  const avatarUrl = user.url || user.avatarUrl || user.avatar || user.photo || user.image || '';
  const contact = user.email || user.mobile || user.phone || EMPTY_VALUE;
  const createdAt = formatDateTime(user.createdAt || user.created_at || user.created);

  const basic = user.basic || {};
  const education = Array.isArray(user.education) ? user.education : [];
  const experiences = Array.isArray(user.experiences) ? user.experiences : [];
  const certifications = Array.isArray(user.certifications)
    ? user.certifications
    : Array.isArray(user.certificates)
      ? user.certificates
      : [];
  const goals = user.goals;
  const jobPreferences = user.jobPreferences;

  const skills = user.skills || {};
  const technicalSkills = Array.isArray(skills.technical)
    ? skills.technical
    : Array.isArray(skills)
      ? skills
      : [];
  const softSkills = Array.isArray(skills.soft) ? skills.soft : [];

  const renderEmpty = () => (
    <Typography variant="body2" color="text.secondary">
      No data
    </Typography>
  );

  const formatValue = (value) => {
    if (value === null || value === undefined || value === '') return EMPTY_VALUE;
    if (Array.isArray(value)) return value.length ? value.join(', ') : EMPTY_VALUE;
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const renderKeyValue = (label, value) => (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2">{formatValue(value)}</Typography>
    </Box>
  );

  const renderList = (items, renderItem) => {
    if (!Array.isArray(items) || items.length === 0) return renderEmpty();
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {items.map((item, index) => renderItem(item, index))}
      </Box>
    );
  };

  const formatDateRange = (start, end) => {
    const startText = formatDate(start);
    const endText = end ? formatDate(end) : 'Present';
    if (startText === EMPTY_VALUE && !end) return EMPTY_VALUE;
    if (startText === EMPTY_VALUE && end) return endText;
    return `${startText} - ${endText}`;
  };

  const renderEducationItem = (item, index) => {
    const school = item?.institution || item?.school || item?.university || 'Education';
    const degree = item?.degree || item?.field || item?.major || item?.title;
    const dates = formatDateRange(item?.startDate || item?.from, item?.endDate || item?.to);
    return (
      <Box key={item?._id || item?.id || index}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {school}
        </Typography>
        {degree && <Typography variant="body2">{degree}</Typography>}
        {dates !== EMPTY_VALUE && (
          <Typography variant="caption" color="text.secondary">
            {dates}
          </Typography>
        )}
        {item?.description && (
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {item.description}
          </Typography>
        )}
      </Box>
    );
  };

  const renderExperienceItem = (item, index) => {
    const title = item?.title || item?.role || item?.position || 'Experience';
    const company = item?.company || item?.employer || item?.organization;
    const dates = formatDateRange(item?.startDate || item?.from, item?.endDate || item?.to);
    return (
      <Box key={item?._id || item?.id || index}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        {company && <Typography variant="body2">{company}</Typography>}
        {dates !== EMPTY_VALUE && (
          <Typography variant="caption" color="text.secondary">
            {dates}
          </Typography>
        )}
        {item?.description && (
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {item.description}
          </Typography>
        )}
      </Box>
    );
  };

  const renderSimpleList = (items) => {
    if (!Array.isArray(items) || items.length === 0) return renderEmpty();
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {items.map((item, index) => (
          <Typography key={item?._id || item?.id || index} variant="body2">
            {formatValue(item?.name || item?.title || item)}
          </Typography>
        ))}
      </Box>
    );
  };

  const renderSkills = (items) => {
    if (!Array.isArray(items) || items.length === 0) return renderEmpty();
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {items.map((skill, index) => {
          const name = skill?.name || skill?.skill || skill?.title || skill;
          const level = skill?.level || skill?.proficiency || skill?.rating;
          const baseLabel = name ? String(name) : formatValue(skill);
          const label = level ? `${baseLabel} (${level})` : baseLabel;
          return <Chip key={skill?._id || skill?.id || index} label={label} size="small" />;
        })}
      </Box>
    );
  };

  const renderObjectGrid = (value) => {
    if (!value) return renderEmpty();
    if (Array.isArray(value)) return renderSimpleList(value);
    if (typeof value !== 'object') {
      return <Typography variant="body2">{String(value)}</Typography>;
    }
    const entries = Object.entries(value).filter(([, v]) => v !== null && v !== undefined && v !== '');
    if (entries.length === 0) return renderEmpty();
    return (
      <Grid container spacing={2}>
        {entries.map(([key, val]) => (
          <Grid item xs={12} sm={6} key={key}>
            <Typography variant="caption" color="text.secondary">
              {formatLabel(key)}
            </Typography>
            <Typography variant="body2">{formatValue(val)}</Typography>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ color: 'primary.main', fontWeight: 600 }}>User Details</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Avatar src={avatarUrl || undefined} sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
            {(user.name || 'U').charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {user.name || 'User'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {contact}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              <Chip
                label={(user.role || 'user').charAt(0).toUpperCase() + (user.role || 'user').slice(1)}
                size="small"
                sx={(theme) => ({
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  color: 'white',
                  fontWeight: 500
                })}
              />
              <Typography variant="caption" color="text.secondary">
                Created: {createdAt}
              </Typography>
              {avatarUrl && (
                <Typography variant="caption" color="text.secondary">
                  Avatar URL: {avatarUrl}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ color: 'primary.main', mb: 1 }}>
              Basic
            </Typography>
            {renderKeyValue('Gender', basic.gender)}
            {renderKeyValue('Date of Birth', formatDate(basic.dateOfBirth))}
            {renderKeyValue('Location', basic.location || user.location)}
            {renderKeyValue(
              'Languages',
              Array.isArray(basic.languages) ? basic.languages.join(', ') : basic.languages
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ color: 'primary.main', mb: 1 }}>
              Goals
            </Typography>
            {renderObjectGrid(goals)}
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ color: 'primary.main', mb: 1 }}>
              Job Preferences
            </Typography>
            {renderObjectGrid(jobPreferences)}
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ color: 'primary.main', mb: 1 }}>
              Education
            </Typography>
            {renderList(education, renderEducationItem)}
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ color: 'primary.main', mb: 1 }}>
              Experiences
            </Typography>
            {renderList(experiences, renderExperienceItem)}
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ color: 'primary.main', mb: 1 }}>
              Certifications
            </Typography>
            {renderSimpleList(certifications)}
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ color: 'primary.main', mb: 1 }}>
              Skills
            </Typography>
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" color="text.secondary">
                Technical
              </Typography>
              {renderSkills(technicalSkills)}
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Soft
              </Typography>
              {renderSkills(softSkills)}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('user');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [rowCount, setRowCount] = useState(0);
  const [editingUser, setEditingUser] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [detailsUser, setDetailsUser] = useState(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchUsers = useCallback(async (role = 'user', page = 1, limit = 10) => {
    setLoading(true);
    try {
      const response = await getUsers(role, {
        page,
        limit,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      const { data, total } = normalizeUsersPayload(response);
      const usersWithIds = data.map(user => ({
        ...user,
        id: user._id || user.id,
        role: ['user', 'admin', 'employer'].includes(user.role) ? user.role : 'user',
        createdAt: user.createdAt || user.created_at || user.created,
      }));
      setUsers(usersWithIds);
      setRowCount(total || usersWithIds.length);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch users:', error);
      setSnackbar({ open: true, message: getApiErrorMessage(error, 'Failed to fetch users'), severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(roleFilter, paginationModel.page + 1, paginationModel.pageSize);
  }, [roleFilter, paginationModel.page, paginationModel.pageSize, fetchUsers]);

  const handleRoleFilterChange = (event) => {
    setRoleFilter(event.target.value);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleViewDetails = (user) => {
    setDetailsUser(user);
    setIsDetailsDialogOpen(true);
  };

  const handleDeleteClick = (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      deleteUser(user.id)
        .then(() => {
          fetchUsers(roleFilter, paginationModel.page + 1, paginationModel.pageSize);
          setSnackbar({ open: true, message: 'User deleted successfully', severity: 'success' });
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to delete user:', error);
          setSnackbar({ open: true, message: getApiErrorMessage(error, 'Failed to delete user'), severity: 'error' });
        });
    }
  };

  const handleEditSave = () => {
    updateUser(editingUser.id, editingUser)
      .then(() => {
        setIsEditDialogOpen(false);
        setEditingUser(null);
        fetchUsers(roleFilter, paginationModel.page + 1, paginationModel.pageSize);
        setSnackbar({ open: true, message: 'User updated successfully', severity: 'success' });
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Failed to update user:', error);
        setSnackbar({ open: true, message: getApiErrorMessage(error, 'Failed to update user'), severity: 'error' });
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
        fetchUsers(roleFilter, paginationModel.page + 1, paginationModel.pageSize);
        setSnackbar({ open: true, message: 'User created successfully', severity: 'success' });
      })
      .catch((error) => {
        const errorMsg = getApiErrorMessage(error, 'Failed to create user');
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
      ...normalizeUsersPayload(users).data, 
      ...normalizeUsersPayload(employers).data, 
      ...normalizeUsersPayload(admins).data
    ];
  };

  const columns = [
    { field: 'name', headerName: 'Name', width: 200 },
    {
      field: 'contact',
      headerName: 'Contact',
      width: 220,
      valueGetter: (value, row) => row?.email || row?.mobile || row?.phone || EMPTY_VALUE,
      renderCell: (params) => params?.value || EMPTY_VALUE,
    },
    {
      field: 'role',
      headerName: 'Role',
      width: 120,
      renderCell: (params) => {
        if (!params?.row) return null;
        let roleValue = params.row.role;
        if (!['user', 'admin', 'employer'].includes(roleValue)) {
          roleValue = 'user';
        }
        return (
            <Chip
              label={roleValue.charAt(0).toUpperCase() + roleValue.slice(1)}
              color={roleValue === 'admin' ? 'primary' : roleValue === 'employer' ? 'secondary' : 'default'}
              size="small"
              sx={(theme) => ({
                background: roleValue === 'admin'
                  ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                  : roleValue === 'employer'
                    ? `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`
                    : `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
                color: roleValue === 'user' ? theme.palette.text.primary : 'white',
                fontWeight: 500
              })}
            />
          );
        },
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 160,
      valueGetter: (value, row) => row?.createdAt || row?.created_at || row?.created,
      valueFormatter: (value) => formatDateTime(value),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 140,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        if (!params?.row) return null;
        return (
          <Box>
            <IconButton
              size="small"
              onClick={() => handleViewDetails(params.row)}
              sx={{ color: 'primary.main' }}
            >
              <VisibilityIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleEditClick(params.row)}
              sx={{ color: 'primary.main' }}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleDeleteClick(params.row)}
              sx={{ color: 'error.main' }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        );
      },
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700} sx={{ color: 'primary.main' }}>
          Users Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingUser({ name: '', email: '', role: 'employer' });
            setIsCreateDialogOpen(true);
          }}
          sx={(theme) => ({
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            color: 'white',
            borderRadius: 2,
            px: 3,
            py: 1,
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
            }
          })}
        >
          Add User
        </Button>
      </Box>

      <Paper sx={(theme) => ({
        p: 3,
        borderRadius: 4,
        backgroundColor: theme.palette.background.paper,
        backdropFilter: 'blur(10px)',
        boxShadow: theme.shadows[2],
      })}>
        <Box sx={{ mb: 3 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Role</InputLabel>
            <Select
              value={roleFilter}
              label="Filter by Role"
              onChange={handleRoleFilterChange}
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
          rowCount={rowCount}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          getRowId={(row) => row._id || row.id}
          sx={{ border: 'none' }}
        />
      </Paper>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: 'primary.main', fontWeight: 600 }}>Edit User</DialogTitle>
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
            sx={(theme) => ({
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              color: 'white',
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
              }
            })}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: 'primary.main', fontWeight: 600 }}>Create New User</DialogTitle>
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
            sx={(theme) => ({
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              color: 'white',
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
              }
            })}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <UserDetailsDialog
        open={isDetailsDialogOpen}
        onClose={() => {
          setIsDetailsDialogOpen(false);
          setDetailsUser(null);
        }}
        user={detailsUser}
      />

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
