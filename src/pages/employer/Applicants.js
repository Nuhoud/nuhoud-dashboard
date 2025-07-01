import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Paper,
  Box,
  Button,
  Chip,
  Avatar,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  DataGrid,
  GridActionsCellItem,
  GridToolbar
} from '@mui/x-data-grid';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Visibility as ViewIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { getApplicationsForJob, getUserProfile } from '../../services/api';

const Applicants = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [applicantProfile, setApplicantProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getApplicationsForJob(jobId);
      setApplications(response.data || []);
    } catch (err) {
      setError('Failed to load applications');
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleViewProfile = async (userId) => {
    try {
      setProfileLoading(true);
      const profile = await getUserProfile(userId);
      setApplicantProfile(profile);
      setSelectedApplicant(applications.find(app => app.userId === userId));
    } catch (err) {
      setError('Failed to load applicant profile');
      console.error('Error fetching user profile:', err);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleCloseProfile = () => {
    setSelectedApplicant(null);
    setApplicantProfile(null);
  };

  const columns = [
    {
      field: 'applicantName',
      headerName: 'Applicant Name',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32 }}>
            <PersonIcon />
          </Avatar>
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
        </Box>
      )
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      )
    },
    {
      field: 'phone',
      headerName: 'Phone',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      )
    },
    {
      field: 'location',
      headerName: 'Location',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 'Pending' ? 'warning' : 
                 params.value === 'Approved' ? 'success' : 
                 params.value === 'Rejected' ? 'error' : 'default'}
          size="small"
        />
      )
    },
    {
      field: 'appliedDate',
      headerName: 'Applied Date',
      width: 150,
      valueFormatter: (params) => {
        return new Date(params.value).toLocaleDateString();
      }
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<ViewIcon />}
          label="View Profile"
          onClick={() => handleViewProfile(params.row.userId)}
          color="primary"
        />
      ]
    }
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/employer/jobs')}
          sx={{ borderRadius: 2 }}
        >
          Back to My Jobs
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#1976d2' }}>
          Job Applicants
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/employer/jobs')}
          sx={{ borderRadius: 2 }}
        >
          Back to My Jobs
        </Button>
      </Box>

      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <Box sx={{ height: 500, width: '100%' }}>
          <DataGrid
            rows={applications}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 20, 50]}
            disableSelectionOnClick
            components={{ Toolbar: GridToolbar }}
            sx={{
              border: 'none',
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                color: '#1976d2',
                fontWeight: 'bold',
                borderRadius: 1,
              },
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid #e0e0e0',
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.04)',
              },
            }}
          />
        </Box>
      </Paper>

      {/* Applicant Profile Modal */}
      {selectedApplicant && applicantProfile && (
        <Paper sx={{ mt: 3, p: 3, borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 600 }}>
              Applicant Profile
            </Typography>
            <Button
              variant="outlined"
              onClick={handleCloseProfile}
              sx={{ borderRadius: 2 }}
            >
              Close
            </Button>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {applicantProfile.firstName} {applicantProfile.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {applicantProfile.email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {applicantProfile.phone}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {applicantProfile.location}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Skills
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {applicantProfile.skills?.map((skill, index) => (
                      <Chip key={index} label={skill} size="small" />
                    ))}
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="h6" gutterBottom>
                    Experience
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {applicantProfile.experienceLevel}
                  </Typography>
                  
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Education
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {applicantProfile.education}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default Applicants;
