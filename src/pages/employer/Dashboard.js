import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  List,
  ListItem ,
  ListItemAvatar ,
  ListItemText ,
  Chip ,
  Avatar,
  CircularProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  CardHeader
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Work as WorkIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Category as CategoryIcon,
  LocationOn as LocationIcon,
  BarChart as BarChartIcon,
  Schedule as ScheduleIcon,
  Edit as DraftIcon,
  Lock as LockIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import { getEmployerAnalytics } from '../../services/api';

// Helper functions for job status
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'success.main';
    case 'draft':
      return 'warning.main';
    case 'closed':
      return 'error.main';
    case 'expired':
      return 'text.secondary';
    default:
      return 'text.disabled';
  }
};

const getStatusIcon = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return <TrendingUpIcon />;
    case 'draft':
      return <DraftIcon />;
    case 'closed':
      return <LockIcon />;
    case 'expired':
      return <ScheduleIcon />;
    default:
      return <HelpIcon />;
  }
};

// Initial state for analytics
const initialAnalytics = {
  totalJobs: 0,
  activeJobs: 0,
  totalApplications: 0,
  averageSalary: { min: 0, max: 0 },
  topSkills: [],
  jobTypeDistribution: [],
  workPlaceTypeDistribution: []
};

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(initialAnalytics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await getEmployerAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Extract data for easier access
  const { 
    totalJobs, 
    activeJobs, 
    totalApplications, 
    averageSalary, 
    topSkills, 
    jobTypeDistribution, 
    workPlaceTypeDistribution 
  } = analytics;

  const responseRate = totalJobs > 0 ? Math.round((totalApplications / totalJobs) * 100) : 0;

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '80vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
        Employer Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={(theme) => ({
              p: 3,
              height: '100%',
              borderRadius: 4,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              color: 'white',
              boxShadow: theme.shadows[3],
              transition: 'transform 0.3s ease-in-out',
              '&:hover': { transform: 'translateY(-5px)' }
            })}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="subtitle1" sx={{ color: (theme) => alpha(theme.palette.common.white, 0.8), fontWeight: 500 }}>
                  Total Jobs
                </Typography>
                <Typography variant="h3" fontWeight={700} sx={{ color: 'white' }}>
                  {totalJobs}
                </Typography>
              </Box>
              <Avatar sx={(theme) => ({ 
                bgcolor: alpha(theme.palette.common.white, 0.2), 
                width: 64, 
                height: 64, 
                boxShadow: theme.shadows[2]
              })}>
                <WorkIcon sx={{ fontSize: 32 }} />
              </Avatar>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={(theme) => ({
              p: 3,
              height: '100%',
              borderRadius: 4,
              background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
              color: 'white',
              boxShadow: theme.shadows[3],
              transition: 'transform 0.3s ease-in-out',
              '&:hover': { transform: 'translateY(-5px)' }
            })}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="subtitle1" sx={{ color: (theme) => alpha(theme.palette.common.white, 0.8), fontWeight: 500 }}>
                  Active Jobs
                </Typography>
                <Typography variant="h3" fontWeight={700} sx={{ color: 'white' }}>
                  {activeJobs}
                </Typography>
              </Box>
              <Avatar sx={(theme) => ({ 
                bgcolor: alpha(theme.palette.common.white, 0.2), 
                width: 64, 
                height: 64, 
                boxShadow: theme.shadows[2]
              })}>
                <TrendingUpIcon sx={{ fontSize: 32 }} />
              </Avatar>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={(theme) => ({
              p: 3,
              height: '100%',
              borderRadius: 4,
              background: `linear-gradient(135deg, ${theme.palette.info.light}, ${theme.palette.info.main})`,
              color: theme.palette.text.primary,
              boxShadow: theme.shadows[3],
              transition: 'transform 0.3s ease-in-out',
              '&:hover': { transform: 'translateY(-5px)' }
            })}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="subtitle1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  Total Applications
                </Typography>
                <Typography variant="h3" fontWeight={700}>
                  {totalApplications}
                </Typography>
              </Box>
              <Avatar sx={(theme) => ({ 
                bgcolor: alpha(theme.palette.common.white, 0.6), 
                width: 64, 
                height: 64, 
                boxShadow: theme.shadows[2]
              })}>
                <PeopleIcon sx={{ fontSize: 32, color: 'text.primary' }} />
              </Avatar>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={(theme) => ({
              p: 3,
              height: '100%',
              borderRadius: 4,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.18)}, ${alpha(theme.palette.secondary.main, 0.22)})`,
              color: theme.palette.text.primary,
              boxShadow: theme.shadows[3],
              transition: 'transform 0.3s ease-in-out',
              '&:hover': { transform: 'translateY(-5px)' }
            })}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="subtitle1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  Response Rate
                </Typography>
                <Typography variant="h3" fontWeight={700}>
                  {responseRate}%
                </Typography>
              </Box>
              <Avatar sx={(theme) => ({ 
                bgcolor: alpha(theme.palette.common.white, 0.6), 
                width: 64, 
                height: 64, 
                boxShadow: theme.shadows[2]
              })}>
                <BarChartIcon sx={{ fontSize: 32, color: 'text.primary' }} />
              </Avatar>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Analytics Sections */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Salary Range Card */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 4, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <MoneyIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight={600}>
                Average Salary Range
              </Typography>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                Average salary across all job postings
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <Typography variant="h5" fontWeight={600} sx={{ color: 'success.main' }}>
                  {formatCurrency(averageSalary.min)}
                </Typography>
                <Box sx={{ mx: 2, color: 'text.secondary' }}>to</Box>
                <Typography variant="h5" fontWeight={600} sx={{ color: 'success.main' }}>
                  {formatCurrency(averageSalary.max)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                  SAR / year
                </Typography>
              </Box>
              <Box sx={{ mt: 2, width: '100%', height: 8, bgcolor: 'action.hover', borderRadius: 4, overflow: 'hidden' }}>
                <Box 
                  sx={{ 
                    height: '100%', 
                    background: (theme) =>
                      `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.primary.main})`,
                    borderRadius: 4,
                    width: '100%'
                  }} 
                />
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        {/* Top Skills Card */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 4, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CategoryIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight={600}>
                Top In-Demand Skills
              </Typography>
            </Box>
            <Box sx={{ mt: 2 }}>
              {topSkills.length > 0 ? (
                <Grid container spacing={1}>
                  {topSkills.map((skill, index) => (
                    <Grid item key={index}>
                      <Box 
                        sx={(theme) => ({
                          px: 2,
                          py: 1,
                          borderRadius: 4,
                          bgcolor: index % 2 === 0
                            ? alpha(theme.palette.primary.main, 0.12)
                            : alpha(theme.palette.secondary.main, 0.14),
                          color: index % 2 === 0 ? theme.palette.primary.main : theme.palette.secondary.dark,
                          fontWeight: 500,
                          display: 'inline-flex',
                          alignItems: 'center',
                          boxShadow: theme.shadows[1]
                        })}
                      >
                        <span>{skill.skill}</span>
                        <Box 
                          component="span" 
                          sx={(theme) => ({
                            ml: 1,
                            bgcolor: index % 2 === 0
                              ? alpha(theme.palette.primary.main, 0.2)
                              : alpha(theme.palette.secondary.main, 0.22),
                            color: index % 2 === 0 ? theme.palette.primary.main : theme.palette.secondary.dark,
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 4,
                            fontSize: '0.75rem',
                            fontWeight: 600
                          })}
                        >
                          {skill.count}
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No skill data available
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Distribution Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Job Type Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 4, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <WorkIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight={600}>
                Job Type Distribution
              </Typography>
            </Box>
            <Box sx={{ mt: 2 }}>
              {jobTypeDistribution.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Job Type</TableCell>
                        <TableCell align="right">Count</TableCell>
                        <TableCell align="right">Percentage</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {jobTypeDistribution.map((jobType, index) => (
                        <TableRow key={index}>
                          <TableCell>{jobType.type}</TableCell>
                          <TableCell align="right">{jobType.count}</TableCell>
                          <TableCell align="right">
                            {Math.round((jobType.count / totalJobs) * 100) || 0}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No job type data available
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Workplace Type Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 4, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight={600}>
                Workplace Type Distribution
              </Typography>
            </Box>
            <Box sx={{ mt: 2 }}>
              {workPlaceTypeDistribution.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Workplace Type</TableCell>
                        <TableCell align="right">Count</TableCell>
                        <TableCell align="right">Percentage</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {workPlaceTypeDistribution.map((workplace, index) => (
                        <TableRow key={index}>
                          <TableCell>{workplace.type}</TableCell>
                          <TableCell align="right">{workplace.count}</TableCell>
                          <TableCell align="right">
                            {Math.round((workplace.count / totalJobs) * 100) || 0}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No workplace type data available
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Placeholder for Future Implementation */}
      <Paper
        sx={(theme) => ({
          p: 4,
          borderRadius: 4,
          backgroundColor: theme.palette.background.paper,
          boxShadow: theme.shadows[2],
          textAlign: 'center',
          mb: 4
        })}
      >
        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600, mb: 2 }}>
          More Analytics Coming Soon
        </Typography>
        <Typography color="text.secondary">
          We're working on adding more detailed analytics and insights to help you track your job postings and applications.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Dashboard; 
