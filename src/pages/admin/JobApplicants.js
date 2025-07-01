import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper, CircularProgress, Avatar, Chip, Button } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { getApplicationsForJob } from '../../services/api';

const JobApplicantsAdmin = () => {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [applicantProfile, setApplicantProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await getApplicationsForJob(jobId);
      setApplications(response.data || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load applications');
      // Mock data for demonstration
      setApplications([
        {
          id: 1,
          applicantName: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+963 123 456 789',
          status: 'Pending',
          appliedDate: '2024-01-15',
          resumeUrl: '#',
          coverLetter: 'I am very interested in this position...'
        },
        {
          id: 2,
          applicantName: 'Jane Smith',
          email: 'jane.smith@example.com',
          phone: '+963 987 654 321',
          status: 'Reviewed',
          appliedDate: '2024-01-14',
          resumeUrl: '#',
          coverLetter: 'I have 5 years of experience...'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = async (applicantId) => {
    setProfileLoading(true);
    try {
      // Mock profile data
      setApplicantProfile({
        id: applicantId,
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+963 123 456 789',
        experience: '5 years',
        education: 'Bachelor in Computer Science',
        skills: ['React', 'Node.js', 'JavaScript', 'Python'],
        bio: 'Experienced software developer with expertise in modern web technologies.'
      });
      setSelectedApplicant(applicantId);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [jobId]);

  const columns = [
    {
      field: 'applicantName',
      headerName: 'Applicant',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2' }}>
            {params.value?.charAt(0) || 'A'}
          </Avatar>
          <Typography variant="body2" fontWeight={500}>
            {params.value || 'Unknown'}
          </Typography>
        </Box>
      ),
    },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'phone', headerName: 'Phone', width: 150 },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={
            params.value === 'Hired' ? 'success' :
            params.value === 'Rejected' ? 'error' :
            params.value === 'Interviewing' ? 'primary' :
            params.value === 'Reviewed' ? 'info' : 'default'
          }
          size="small"
          sx={{ fontWeight: 500 }}
        />
      ),
    },
    {
      field: 'appliedDate',
      headerName: 'Applied Date',
      width: 120,
      valueGetter: (params) => {
        if (!params.row || !params.value) return 'N/A';
        return params.value ? new Date(params.value).toLocaleDateString() : 'N/A';
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleViewProfile(params.row.id)}
          sx={{
            borderRadius: 2,
            borderColor: '#1976d2',
            color: '#1976d2',
            '&:hover': {
              borderColor: '#1565c0',
              backgroundColor: 'rgba(25, 118, 210, 0.08)',
            }
          }}
        >
          View Profile
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="error" gutterBottom>
          {error}
        </Typography>
        <Button variant="contained" onClick={fetchApplications}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, color: '#1976d2', mb: 3 }}>
        Job Applicants
      </Typography>
      
      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <Box sx={{ height: 500, width: '100%' }}>
          <DataGrid
            rows={applications}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 20, 50]}
            disableSelectionOnClick
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
          <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 600, mb: 2 }}>
            Applicant Profile
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 300 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                {applicantProfile.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {applicantProfile.email}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {applicantProfile.phone}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Experience: {applicantProfile.experience}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Education: {applicantProfile.education}
              </Typography>
            </Box>
            <Box sx={{ flex: 1, minWidth: 300 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Skills
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {applicantProfile.skills.map((skill, index) => (
                  <Chip key={index} label={skill} size="small" />
                ))}
              </Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Bio
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {applicantProfile.bio}
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default JobApplicantsAdmin;
