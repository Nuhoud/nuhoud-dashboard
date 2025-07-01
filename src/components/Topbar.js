import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Chip,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  AccountCircle,
  Logout,
  Settings,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Topbar = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  
  const userRole = localStorage.getItem('userRole');
  const userName = localStorage.getItem('userName') || 'User';
  const userEmail = localStorage.getItem('userEmail') || 'user@example.com';

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const getPageTitle = () => {
    const path = window.location.pathname;
    if (path === '/') return 'Dashboard';
    if (path === '/users') return 'User Management';
    if (path === '/job-offers') return 'Job Offers';
    if (path === '/create-admin') return 'Create Admin';
    if (path === '/create-employer') return 'Create Employer';
    if (path === '/profile') return 'Profile';
    if (path === '/employer/dashboard') return 'Employer Dashboard';
    if (path === '/employer/jobs') return 'My Jobs';
    if (path === '/employer/jobs/create') return 'Create Job Offer';
    return 'Dashboard';
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        color: '#333',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
        {/* Left side - Page title and breadcrumb */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: 0.5,
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
            }}
          >
            {getPageTitle()}
          </Typography>
          {!isMobile && (
            <Chip
              label={userRole === 'admin' ? 'Administrator' : 'Employer'}
              size="small"
              sx={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.7rem',
              }}
            />
          )}
        </Box>

        {/* Right side - Actions and user menu */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Search Button */}
          {!isMobile && (
            <Tooltip title="Search">
              <IconButton
                sx={{
                  color: '#666',
                  '&:hover': {
                    background: 'rgba(102, 126, 234, 0.1)',
                    color: '#667eea',
                  },
                }}
              >
                <SearchIcon />
              </IconButton>
            </Tooltip>
          )}

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              onClick={handleNotificationMenuOpen}
              sx={{
                color: '#666',
                '&:hover': {
                  background: 'rgba(102, 126, 234, 0.1)',
                  color: '#667eea',
                },
              }}
            >
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
            {!isMobile && (
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#333' }}>
                  {userName}
                </Typography>
                <Typography variant="caption" sx={{ color: '#666' }}>
                  {userEmail}
                </Typography>
              </Box>
            )}
            <Tooltip title="Account settings">
              <IconButton
                onClick={handleProfileMenuOpen}
                sx={{
                  p: 0.5,
                  border: '2px solid transparent',
                  '&:hover': {
                    border: '2px solid #667eea',
                    background: 'rgba(102, 126, 234, 0.1)',
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    fontWeight: 600,
                    fontSize: '1rem',
                  }}
                >
                  {userName.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Toolbar>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 320,
            maxWidth: 400,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            borderRadius: 2,
          },
        }}
      >
        <MenuItem sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: '#38a169' }}>
              <NotificationsIcon sx={{ fontSize: 16 }} />
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                New Job Application
              </Typography>
              <Typography variant="caption" sx={{ color: '#666' }}>
                You have a new application for Senior Developer position
              </Typography>
            </Box>
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: '#d69e2e' }}>
              <NotificationsIcon sx={{ fontSize: 16 }} />
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                System Update
              </Typography>
              <Typography variant="caption" sx={{ color: '#666' }}>
                Platform maintenance scheduled for tomorrow
              </Typography>
            </Box>
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: '#667eea' }}>
              <NotificationsIcon sx={{ fontSize: 16 }} />
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Welcome Message
              </Typography>
              <Typography variant="caption" sx={{ color: '#666' }}>
                Welcome to NUHOUD platform! Explore your dashboard
              </Typography>
            </Box>
          </Box>
        </MenuItem>
      </Menu>

      {/* User Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            borderRadius: 2,
          },
        }}
      >
        <MenuItem onClick={handleMenuClose} sx={{ py: 2 }}>
          <AccountCircle sx={{ mr: 2, color: '#667eea' }} />
          <Typography>Profile</Typography>
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ py: 2 }}>
          <Settings sx={{ mr: 2, color: '#667eea' }} />
          <Typography>Settings</Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ py: 2, color: '#e53e3e' }}>
          <Logout sx={{ mr: 2 }} />
          <Typography>Logout</Typography>
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Topbar;
