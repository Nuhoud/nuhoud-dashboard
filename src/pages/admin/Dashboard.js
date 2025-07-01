import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, Avatar, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';
import { getJobOffersAnalytics, getApplications } from '../../services/api';

// Icons for metric cards
import WorkIcon from '@mui/icons-material/Work';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BusinessIcon from '@mui/icons-material/Business';

// Dummy data for testing
const DUMMY_DATA = {
  totalJobs: 156,
  activeJobs: 89,
  totalApplications: 432,
  totalHired: 67,
  applicationsByStatus: [
    { name: 'Pending', value: 145 },
    { name: 'Reviewed', value: 98 },
    { name: 'Interviewing', value: 76 },
    { name: 'Hired', value: 67 },
    { name: 'Rejected', value: 46 }
  ],
  applicationsByJob: [
    { title: 'Senior Developer', applications: 45 },
    { title: 'UI/UX Designer', applications: 38 },
    { title: 'Project Manager', applications: 32 },
    { title: 'DevOps Engineer', applications: 28 },
    { title: 'Data Scientist', applications: 25 },
    { title: 'Frontend Developer', applications: 22 }
  ],
  recentApplications: [
    {
      id: 1,
      applicantName: 'John Smith',
      jobTitle: 'Senior Developer',
      status: 'Pending',
      appliedDate: '2024-03-15'
    },
    {
      id: 2,
      applicantName: 'Sarah Johnson',
      jobTitle: 'UI/UX Designer',
      status: 'Interviewing',
      appliedDate: '2024-03-14'
    },
    {
      id: 3,
      applicantName: 'Michael Brown',
      jobTitle: 'Project Manager',
      status: 'Reviewed',
      appliedDate: '2024-03-13'
    },
    {
      id: 4,
      applicantName: 'Emily Davis',
      jobTitle: 'DevOps Engineer',
      status: 'Hired',
      appliedDate: '2024-03-12'
    },
    {
      id: 5,
      applicantName: 'David Wilson',
      jobTitle: 'Data Scientist',
      status: 'Rejected',
      appliedDate: '2024-03-11'
    }
  ]
};

// --- Reusable Metric Card Component ---
const MetricCard = ({ title, value, icon, color }) => (
  <Paper
    sx={{
      p: 3,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: 4,
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      transition: 'transform 0.3s ease-in-out',
      '&:hover': {
        transform: 'translateY(-5px)',
      },
    }}
  >
    <Box>
      <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 500 }}>{title}</Typography>
      <Typography variant="h4" fontWeight={600} sx={{ color: '#667eea' }}>{value}</Typography>
    </Box>
    <Avatar sx={{ bgcolor: color, color: '#fff', width: 56, height: 56, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
      {icon}
    </Avatar>
  </Paper>
);

// --- Custom Active Shape for Pie Chart ---
const renderActiveShape = (props) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
        <g>
            <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
                {payload.name}
            </text>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
            />
            <Sector
                cx={cx}
                cy={cy}
                startAngle={startAngle}
                endAngle={endAngle}
                innerRadius={outerRadius + 6}
                outerRadius={outerRadius + 10}
                fill={fill}
            />
            <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
            <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`${value} Apps`}</text>
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
                {`(Rate ${(percent * 100).toFixed(2)}%)`}
            </text>
        </g>
    );
};

const StatusChip = ({ status }) => {
    const statusMap = {
        Pending: { color: 'warning', label: 'Pending' },
        Reviewed: { color: 'info', label: 'Reviewed' },
        Interviewing: { color: 'primary', label: 'Interviewing' },
        Hired: { color: 'success', label: 'Hired' },
        Rejected: { color: 'error', label: 'Rejected' }
    };
    const chipProps = statusMap[status] || { color: 'default', label: status };
    return <Chip label={chipProps.label} color={chipProps.color} size="small" />;
};

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(DUMMY_DATA);
  const [recentApplications, setRecentApplications] = useState(DUMMY_DATA.recentApplications);
  const [pieActiveIndex, setPieActiveIndex] = useState(0);
  const [userRole, setUserRole] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const role = localStorage.getItem('userRole') || 'admin';
    setUserRole(role);
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const onPieEnter = (_, index) => {
    setPieActiveIndex(index);
  };

  const PIE_COLORS = ['#667eea', '#764ba2', '#f7b924', '#36b37e', '#ff5630'];

  // Dynamic header content based on user role
  const getHeaderContent = () => {
    if (userRole === 'employer') {
      return {
        title: 'Employer Dashboard',
        subtitle: 'Welcome back! Here\'s an overview of your job postings and applications',
        icon: <BusinessIcon sx={{ fontSize: 28, color: 'white' }} />
      };
    }
    return {
      title: 'Admin Dashboard',
      subtitle: 'Welcome back! Here\'s an overview of your platform\'s performance',
      icon: <DashboardIcon sx={{ fontSize: 28, color: 'white' }} />
    };
  };

  const headerContent = getHeaderContent();

  return (
    <Box>
      {/* Enhanced Dashboard Header */}
      <Box sx={{ 
        mb: 4, 
        p: 3, 
        borderRadius: 4, 
        background: 'linear-gradient(135deg, rgba(33, 33, 33, 0.95), rgba(66, 66, 66, 0.95))',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
      }}>
        <Avatar sx={{ 
          bgcolor: 'linear-gradient(135deg, #424242, #212121)',
          background: 'linear-gradient(135deg, #424242, #212121)',
          width: 56, 
          height: 56,
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
        }}>
          {headerContent.icon}
        </Avatar>
        <Box>
          <Typography variant="h3" fontWeight={800} sx={{ 
            background: 'linear-gradient(135deg, #ffffff, #e0e0e0)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 0.5
          }}>
            {headerContent.title}
          </Typography>
          <Typography variant="body1" sx={{ color: '#bdbdbd', fontWeight: 500 }}>
            {headerContent.subtitle}
          </Typography>
        </Box>
      </Box>
      
      {/* --- Metric Cards --- */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard title="Total Jobs" value={analytics.totalJobs} icon={<WorkIcon />} color="#667eea" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard title="Total Applications" value={analytics.totalApplications} icon={<PeopleIcon />} color="#764ba2" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard title="Total Hired" value={analytics.totalHired} icon={<CheckCircleIcon />} color="#36b37e" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard title="Active Jobs" value={analytics.activeJobs} icon={<HourglassTopIcon />} color="#ff5630" />
        </Grid>
      </Grid>

      {/* --- Charts --- */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, borderRadius: 4, height: 400, background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#667eea', fontWeight: 600 }}>
              Applications per Job
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={analytics.applicationsByJob} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="title" fontSize={12} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="applications" fill="#667eea" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, borderRadius: 4, height: 400, background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#667eea', fontWeight: 600 }}>
              Application Status Distribution
            </Typography>
             <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  activeIndex={pieActiveIndex}
                  activeShape={renderActiveShape}
                  data={analytics.applicationsByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                >
                  {analytics.applicationsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* --- Recent Applications Table --- */}
      <Paper sx={{ mt: 3, p: 3, borderRadius: 4, background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#667eea', fontWeight: 600 }}>
          Recent Applications
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'rgba(102, 126, 234, 0.08)' }}>
                <TableCell sx={{ fontWeight: 600, color: '#667eea' }}>Applicant</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#667eea' }}>Job Title</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#667eea' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#667eea' }}>Applied Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentApplications.map((application) => (
                <TableRow key={application.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: '#667eea' }}>
                        {application.applicantName?.charAt(0) || 'A'}
                      </Avatar>
                      <Typography variant="body2" fontWeight={500}>
                        {application.applicantName || 'Unknown Applicant'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{application.jobTitle || 'Unknown Job'}</TableCell>
                  <TableCell>
                    <StatusChip status={application.status} />
                  </TableCell>
                  <TableCell>
                    {application.appliedDate ? new Date(application.appliedDate).toLocaleDateString() : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default Dashboard;
