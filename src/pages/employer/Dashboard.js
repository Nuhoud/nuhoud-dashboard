import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Avatar,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider
} from '@mui/material';
import {
  Work as WorkIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

// Dummy data for testing
const DUMMY_DATA = {
  jobs: [
    {
      id: 1,
      title: 'Senior Software Engineer',
      location: 'Riyadh, Saudi Arabia',
      type: 'Full-time',
      status: 'Active',
      applications: 24,
      postedDate: '2024-03-01'
    },
    {
      id: 2,
      title: 'UI/UX Designer',
      location: 'Remote',
      type: 'Full-time',
      status: 'Active',
      applications: 18,
      postedDate: '2024-03-05'
    },
    {
      id: 3,
      title: 'Product Manager',
      location: 'Jeddah, Saudi Arabia',
      type: 'Full-time',
      status: 'Active',
      applications: 15,
      postedDate: '2024-03-08'
    },
    {
      id: 4,
      title: 'Frontend Developer',
      location: 'Dammam, Saudi Arabia',
      type: 'Contract',
      status: 'Closed',
      applications: 12,
      postedDate: '2024-02-15'
    },
    {
      id: 5,
      title: 'DevOps Engineer',
      location: 'Riyadh, Saudi Arabia',
      type: 'Full-time',
      status: 'Pending',
      applications: 8,
      postedDate: '2024-03-10'
    }
  ],
  applications: [
    {
      id: 1,
      applicantName: 'Ahmed Mohammed',
      jobTitle: 'Senior Software Engineer',
      status: 'Pending',
      appliedDate: '2024-03-15'
    },
    {
      id: 2,
      applicantName: 'Sara Abdullah',
      jobTitle: 'UI/UX Designer',
      status: 'Interviewing',
      appliedDate: '2024-03-14'
    },
    {
      id: 3,
      applicantName: 'Khalid Al-Saud',
      jobTitle: 'Product Manager',
      status: 'Reviewed',
      appliedDate: '2024-03-13'
    },
    {
      id: 4,
      applicantName: 'Fatima Hassan',
      jobTitle: 'Frontend Developer',
      status: 'Hired',
      appliedDate: '2024-03-12'
    },
    {
      id: 5,
      applicantName: 'Omar Yusuf',
      jobTitle: 'DevOps Engineer',
      status: 'Pending',
      appliedDate: '2024-03-11'
    }
  ]
};

const Dashboard = () => {
  const [jobs, setJobs] = useState(DUMMY_DATA.jobs);
  const [applications, setApplications] = useState(DUMMY_DATA.applications);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('userRole') || 'employer';
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return '#36b37e';
      case 'Pending': return '#f7b924';
      case 'Closed': return '#ff5630';
      default: return '#667eea';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active': return <CheckCircleIcon />;
      case 'Pending': return <PendingIcon />;
      case 'Closed': return <CancelIcon />;
      default: return <ScheduleIcon />;
    }
  };

  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(job => job.status === 'Active').length;
  const totalApplications = applications.length;
  const responseRate = Math.round((totalApplications / totalJobs) * 100);

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress sx={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom sx={{ color: '#667eea', mb: 3 }}>
        Employer Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease-in-out',
              '&:hover': { transform: 'translateY(-5px)' }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Total Jobs
                </Typography>
                <Typography variant="h4" fontWeight={600} sx={{ color: '#667eea' }}>
                  {totalJobs}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: '#667eea', width: 56, height: 56, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                <WorkIcon />
              </Avatar>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease-in-out',
              '&:hover': { transform: 'translateY(-5px)' }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Active Jobs
                </Typography>
                <Typography variant="h4" fontWeight={600} sx={{ color: '#764ba2' }}>
                  {activeJobs}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: '#764ba2', width: 56, height: 56, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                <TrendingUpIcon />
              </Avatar>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease-in-out',
              '&:hover': { transform: 'translateY(-5px)' }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Total Applications
                </Typography>
                <Typography variant="h4" fontWeight={600} sx={{ color: '#36b37e' }}>
                  {totalApplications}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: '#36b37e', width: 56, height: 56, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                <PeopleIcon />
              </Avatar>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease-in-out',
              '&:hover': { transform: 'translateY(-5px)' }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Response Rate
                </Typography>
                <Typography variant="h4" fontWeight={600} sx={{ color: '#ff5630' }}>
                  {responseRate}%
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: '#ff5630', width: 56, height: 56, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                <ScheduleIcon />
              </Avatar>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Jobs and Applications */}
      <Grid container spacing={3}>
        {/* Recent Jobs */}
        <Grid item xs={12} lg={6}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              height: 400
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: '#667eea', fontWeight: 600, mb: 2 }}>
              Recent Job Postings
            </Typography>
            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
              {jobs.map((job, index) => (
                <React.Fragment key={job.id}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: getStatusColor(job.status) }}>
                        {getStatusIcon(job.status)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight={500}>
                          {job.title}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {job.location} • {job.type}
                          </Typography>
                          <Chip
                            label={job.status}
                            size="small"
                            sx={{
                              mt: 1,
                              background: `linear-gradient(135deg, ${getStatusColor(job.status)}, ${getStatusColor(job.status)}dd)`,
                              color: 'white',
                              fontWeight: 500
                            }}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < jobs.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Recent Applications */}
        <Grid item xs={12} lg={6}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              height: 400
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: '#667eea', fontWeight: 600, mb: 2 }}>
              Recent Applications
            </Typography>
            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
              {applications.map((application, index) => (
                <React.Fragment key={application.id}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#667eea' }}>
                        {application.applicantName.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight={500}>
                          {application.applicantName}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Applied for: {application.jobTitle}
                          </Typography>
                          <Chip
                            label={application.status}
                            size="small"
                            sx={{
                              mt: 1,
                              background: 'linear-gradient(135deg, #667eea, #764ba2)',
                              color: 'white',
                              fontWeight: 500
                            }}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < applications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 