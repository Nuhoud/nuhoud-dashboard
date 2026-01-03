import React, { useEffect, useState } from 'react';
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
  Button,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Notifications as NotificationsIcon,
  AccountCircle,
  Logout,
  Settings,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationsContext';

const Topbar = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const { notifications, unreadCount, markAllRead, loadMore, hasMore, loading, error } = useNotifications();
  
  const userRole = localStorage.getItem('userRole');
  const userName = localStorage.getItem('userName') || 'User';
  const userEmail = localStorage.getItem('userEmail') || 'user@example.com';
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem('userAvatar') || '');

  useEffect(() => {
    const handleAvatarUpdate = () => {
      setAvatarUrl(localStorage.getItem('userAvatar') || '');
    };
    window.addEventListener('profile-avatar-updated', handleAvatarUpdate);
    window.addEventListener('storage', handleAvatarUpdate);
    return () => {
      window.removeEventListener('profile-avatar-updated', handleAvatarUpdate);
      window.removeEventListener('storage', handleAvatarUpdate);
    };
  }, []);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
    markAllRead();
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
      sx={(theme) => ({
        backgroundColor: alpha(theme.palette.background.paper, 0.92),
        backdropFilter: 'blur(10px)',
        color: theme.palette.text.primary,
        borderBottom: `1px solid ${theme.palette.divider}`,
      })}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
        {/* Left side - Page title and breadcrumb */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              background: (theme) =>
                `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
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
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                color: 'white',
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
                sx={(theme) => ({
                  color: theme.palette.text.secondary,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    color: theme.palette.primary.main,
                  },
                })}
              >
                <SearchIcon />
              </IconButton>
            </Tooltip>
          )}

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              onClick={handleNotificationMenuOpen}
              sx={(theme) => ({
                color: theme.palette.text.secondary,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  color: theme.palette.primary.main,
                },
              })}
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>

          {/* User Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
            {!isMobile && (
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {userName}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {userEmail}
                </Typography>
              </Box>
            )}
            <Tooltip title="Account settings">
              <IconButton
                onClick={handleProfileMenuOpen}
                sx={(theme) => ({
                  p: 0.5,
                  border: '2px solid transparent',
                  '&:hover': {
                    border: `2px solid ${theme.palette.primary.main}`,
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  },
                })}
              >
                <Avatar
                  src={avatarUrl || undefined}
                  sx={{
                    width: 40,
                    height: 40,
                    background: (theme) =>
                      `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
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
            boxShadow: (theme) => theme.shadows[3],
            borderRadius: 2,
          },
        }}
      >
        {loading && notifications.length === 0 && (
          <MenuItem sx={{ py: 2 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Loading notifications...
            </Typography>
          </MenuItem>
        )}
        {error && (
          <MenuItem sx={{ py: 2 }}>
            <Typography variant="body2" sx={{ color: 'error.main' }}>
              {error.message || 'Failed to load notifications'}
            </Typography>
          </MenuItem>
        )}
        {notifications.length === 0 && !loading && (
          <MenuItem sx={{ py: 2 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              No notifications yet
            </Typography>
          </MenuItem>
        )}
        {notifications.map((notification, idx) => (
          <React.Fragment key={notification.id}>
            {idx > 0 && <Divider />}
            <MenuItem sx={{ py: 2, alignItems: 'flex-start' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                  <NotificationsIcon sx={{ fontSize: 16 }} />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {notification.title}
                  </Typography>
                  {notification.body && (
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      {notification.body}
                    </Typography>
                  )}
                  <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                    {new Date(notification.receivedAt).toLocaleTimeString()}
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
          </React.Fragment>
        ))}
        {hasMore && (
          <>
            {notifications.length > 0 && <Divider />}
            <MenuItem sx={{ py: 2, justifyContent: 'center' }} onClick={loadMore} disabled={loading}>
              <Button
                variant="outlined"
                size="small"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={14} /> : null}
              >
                {loading ? 'Loading...' : 'Load more'}
              </Button>
            </MenuItem>
          </>
        )}
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
            boxShadow: (theme) => theme.shadows[3],
            borderRadius: 2,
          },
        }}
      >
        <MenuItem onClick={handleMenuClose} sx={{ py: 2 }}>
          <AccountCircle sx={{ mr: 2, color: 'primary.main' }} />
          <Typography>Profile</Typography>
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ py: 2 }}>
          <Settings sx={{ mr: 2, color: 'primary.main' }} />
          <Typography>Settings</Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ py: 2, color: 'error.main' }}>
          <Logout sx={{ mr: 2 }} />
          <Typography>Logout</Typography>
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Topbar;
