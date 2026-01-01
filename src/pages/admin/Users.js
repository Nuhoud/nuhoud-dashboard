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
  const isEmployer = (user.role || '').toLowerCase() === 'employer';
  const isAdmin = (user.role || '').toLowerCase() === 'admin';

  const renderField = (label, value) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {value || EMPTY_VALUE}
      </Typography>
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ color: 'primary.main', fontWeight: 700 }}>User Details</DialogTitle>
      <DialogContent dividers sx={{ backgroundColor: 'background.default' }}>
        <Paper
          variant="outlined"
          sx={(theme) => ({
            p: 3,
            mb: 3,
            borderRadius: 3,
            borderColor: theme.palette.divider,
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            background: `linear-gradient(135deg, ${theme.palette.primary.main}10, ${theme.palette.secondary.main}10)`
          })}
        >
          <Avatar src={avatarUrl || undefined} sx={{ width: 72, height: 72, bgcolor: 'primary.main' }}>
            {(user.name || 'U').charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
              {user.name || 'User'}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {contact}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              <Chip
                label={(user.role || 'user').charAt(0).toUpperCase() + (user.role || 'user').slice(1)}
                size="small"
                sx={(theme) => ({
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  color: 'white',
                  fontWeight: 600
                })}
              />
              {user.isVerified && (
                <Chip label="Verified" color="success" size="small" sx={{ fontWeight: 600 }} />
              )}
              {user.isFirstTime && (
                <Chip label="First Login" color="info" size="small" sx={{ fontWeight: 600 }} />
              )}
            </Box>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary">
              Created
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {createdAt}
            </Typography>
            {avatarUrl && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 0.5, maxWidth: 240, wordBreak: 'break-all' }}
              >
                Avatar: {avatarUrl}
              </Typography>
            )}
          </Box>
        </Paper>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: 'primary.main', mb: 1.5 }}>
                Contact & Account
              </Typography>
              {renderField('Email', user.email)}
              {renderField('Phone', user.mobile || user.phone)}
              {renderField('Role', user.role)}
              {renderField('Verified', user.isVerified ? 'Yes' : 'No')}
              {renderField('First Time', user.isFirstTime ? 'Yes' : 'No')}
              {renderField('Completed Profile', user.isCompleted ? 'Yes' : 'No')}
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: 'primary.main', mb: 1.5 }}>
                Profile Snapshot
              </Typography>
              {renderField('User ID', user._id || user.id)}
              {renderField('Created', createdAt)}
            </Paper>
          </Grid>

          {isEmployer && (
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: 'primary.main', mb: 1.5 }}>
                  Company
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    {renderField('Name', user.company?.name)}
                    {renderField('Industry', user.company?.industry)}
                    {renderField('Size', user.company?.size)}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    {renderField('Website', user.company?.website)}
                    {renderField('Location', user.company?.location)}
                  </Grid>
                  {user.company?.description && (
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">
                        Description
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {user.company.description}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>
          )}

          {!isEmployer && !isAdmin && (
            <>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ color: 'primary.main', mb: 1.5 }}>
                    Basic Info
                  </Typography>
                  {renderField('Gender', user.basic?.gender)}
                  {renderField('Date of Birth', formatDate(user.basic?.dateOfBirth))}
                  {renderField('Location', user.basic?.location || user.location)}
                  {renderField(
                    'Languages',
                    Array.isArray(user.basic?.languages) ? user.basic.languages.join(', ') : user.basic?.languages
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ color: 'primary.main', mb: 1.5 }}>
                    Goals
                  </Typography>
                  {user.goals?.careerGoal ? (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {user.goals.careerGoal}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No goals provided
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    Interests
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {Array.isArray(user.goals?.interests) && user.goals.interests.length > 0 ? (
                      user.goals.interests.map((interest, idx) => (
                        <Chip key={idx} label={interest} size="small" />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No interests listed
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ color: 'primary.main', mb: 1.5 }}>
                    Job Preferences
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      {renderField(
                        'Workplace Type',
                        Array.isArray(user.jobPreferences?.workPlaceType)
                          ? user.jobPreferences.workPlaceType.join(', ')
                          : user.jobPreferences?.workPlaceType
                      )}
                    </Grid>
                    <Grid item xs={12} md={4}>
                      {renderField(
                        'Job Type',
                        Array.isArray(user.jobPreferences?.jobType)
                          ? user.jobPreferences.jobType.join(', ')
                          : user.jobPreferences?.jobType
                      )}
                    </Grid>
                    <Grid item xs={12} md={4}>
                      {renderField('Job Location', user.jobPreferences?.jobLocation)}
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ color: 'primary.main', mb: 1.5 }}>
                    Education
                  </Typography>
                  {Array.isArray(user.education) && user.education.length > 0 ? (
                    <Box sx={{ display: 'grid', gap: 1.5 }}>
                      {user.education.map((edu, idx) => (
                        <Box key={idx} sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>
                          <Typography variant="body2" fontWeight={600}>
                            {edu.degree} {edu.field ? `in ${edu.field}` : ''}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {edu.university} {edu.endYear ? `(${edu.endYear})` : ''}
                          </Typography>
                          {edu.GPA && (
                            <Typography variant="caption" color="text.secondary">
                              GPA: {edu.GPA}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No education data
                    </Typography>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ color: 'primary.main', mb: 1.5 }}>
                    Experiences
                  </Typography>
                  {Array.isArray(user.experiences) && user.experiences.length > 0 ? (
                    <Box sx={{ display: 'grid', gap: 1.5 }}>
                      {user.experiences.map((exp, idx) => (
                        <Box key={idx} sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>
                          <Typography variant="body2" fontWeight={600}>
                            {exp.jobTitle || exp.title} {exp.company ? `at ${exp.company}` : ''}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {exp.location}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(exp.startDate)} - {exp.isCurrent ? 'Present' : formatDate(exp.endDate)}
                          </Typography>
                          {exp.description && (
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              {exp.description}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No experience data
                    </Typography>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ color: 'primary.main', mb: 1.5 }}>
                    Certifications
                  </Typography>
                  {Array.isArray(user.certifications) && user.certifications.length > 0 ? (
                    <Box sx={{ display: 'grid', gap: 1.5 }}>
                      {user.certifications.map((cert, idx) => (
                        <Box key={idx} sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>
                          <Typography variant="body2" fontWeight={600}>
                            {cert.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Issuer: {cert.issuer}
                          </Typography>
                          {cert.issueDate && (
                            <Typography variant="caption" color="text.secondary">
                              Issued: {formatDate(cert.issueDate)}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No certifications
                    </Typography>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ color: 'primary.main', mb: 1.5 }}>
                    Skills
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Technical
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
                    {Array.isArray(user.skills?.technical_skills) && user.skills.technical_skills.length > 0 ? (
                      user.skills.technical_skills.map((skill, idx) => (
                        <Chip
                          key={idx}
                          label={`${skill.name}${skill.level ? ` (${skill.level}%)` : ''}`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No technical skills
                      </Typography>
                    )}
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Soft
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    {Array.isArray(user.skills?.soft_skills) && user.skills.soft_skills.length > 0 ? (
                      user.skills.soft_skills.map((skill, idx) => (
                        <Chip
                          key={idx}
                          label={`${skill.name}${skill.level ? ` (${skill.level}%)` : ''}`}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No soft skills
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </Grid>
            </>
          )}
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
