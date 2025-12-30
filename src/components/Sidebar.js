import React, { useEffect, useState } from 'react';
import { 
  Drawer, 
  List, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  Typography, 
  Box, 
  Divider,
  Avatar,
  Chip
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BusinessIcon from '@mui/icons-material/Business';
import AddIcon from '@mui/icons-material/Add';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonIcon from '@mui/icons-material/Person';
import logo from '../assets/logo-nuhoud.svg';

const drawerWidth = 280;

const Sidebar = () => {
  const location = useLocation();
  const userRole = localStorage.getItem('userRole');
  const userName = localStorage.getItem('userName') || 'User';
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

  const adminNavItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
    { isDivider: true, text: 'Management' },
    { text: 'Users', icon: <PeopleIcon />, path: '/admin/users' },
    { text: 'Job Offers', icon: <WorkIcon />, path: '/admin/job-offers' },
    { isDivider: true, text: 'Administration' },
    { text: 'Create Admin', icon: <PersonAddIcon />, path: '/admin/create-admin' },
    { text: 'Create Employer', icon: <BusinessIcon />, path: '/admin/create-employer' },
    { isDivider: true },
    { text: 'Profile', icon: <AccountCircleIcon />, path: '/admin/profile' },
  ];

  const employerNavItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/employer/dashboard' },
    { isDivider: true, text: 'Job Management' },
    { text: 'My Jobs', icon: <WorkIcon />, path: '/employer/jobs' },
    { text: 'Create Job', icon: <AddIcon />, path: '/employer/jobs/create' },
    { isDivider: true },
    { text: 'Profile', icon: <AccountCircleIcon />, path: '/employer/profile' },
  ];

  const navItems = userRole === 'admin' ? adminNavItems : employerNavItems;

  const employerLinks = [
    { title: 'Dashboard', path: '/employer/dashboard', icon: <DashboardIcon /> },
    { title: 'My Jobs', path: '/employer/jobs', icon: <WorkIcon /> },
    { title: 'Create Job', path: '/employer/jobs/create', icon: <AddIcon /> },
    { title: 'Job Applications', path: '/employer/applications', icon: <AssignmentIcon /> },
    { title: 'Profile', path: '/employer/profile', icon: <PersonIcon /> },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          color: '#333',
          border: 'none',
          boxShadow: '4px 0 20px rgba(0,0,0,0.2)',
        },
      }}
    >
      {/* Header */}
      <Toolbar 
        sx={{ 
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          minHeight: '80px !important',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          py: 2
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <img 
            src={logo} 
            alt="Nuhoud Logo" 
            style={{ 
              height: '40px',
              filter: 'brightness(0) invert(1)' // Makes the logo white
            }} 
          />
        </Box>
      </Toolbar>

      {/* User Profile Section */}
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar 
            src={avatarUrl || undefined}
            sx={{ 
              width: 48, 
              height: 48,
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
            }}
          >
            {userName.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#333' }}>
              {userName}
            </Typography>
            <Typography variant="caption" sx={{ color: '#666' }}>
              {userRole === 'admin' ? 'System Administrator' : 'Job Employer'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flexGrow: 1, mt: 2 }}>
        <List component="nav" sx={{ px: 2 }}>
          {navItems.map((item, index) => (
            item.isDivider ? 
            <Divider key={index} sx={{ 
              my: 2, 
              borderColor: 'rgba(0, 0, 0, 0.12)',
              '&::before': {
                content: '""',
                display: 'block',
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.3), transparent)',
              }
            }}>
              {item.text && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: '#667eea', 
                    px: 2,
                    fontWeight: 600,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    fontSize: '0.7rem',
                  }}
                >
                  {item.text}
                </Typography>
              )}
            </Divider> :
            <ListItemButton
              key={item.text}
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                py: 1.5,
                px: 2.5,
                mb: 1,
                borderRadius: 2,
                color: location.pathname === item.path ? '#ffffff' : '#333',
                background: location.pathname === item.path 
                  ? 'linear-gradient(135deg, #667eea, #764ba2)' 
                  : 'transparent',
                backdropFilter: location.pathname === item.path ? 'blur(10px)' : 'none',
                border: location.pathname === item.path 
                  ? '1px solid rgba(255,255,255,0.3)' 
                  : '1px solid transparent',
                transition: 'all 0.3s ease',
                '&:hover': { 
                  background: location.pathname === item.path 
                    ? 'linear-gradient(135deg, #5a6fd8, #6a4c93)'
                    : 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
                  transform: 'translateX(4px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                },
                '&.Mui-selected': {
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                },
                '&.Mui-selected .MuiListItemIcon-root': {
                  color: '#ffffff',
                },
                '& .MuiListItemIcon-root': {
                  color: location.pathname === item.path ? '#ffffff' : '#667eea',
                  minWidth: 40,
                  transition: 'color 0.3s ease',
                },
                '& .MuiListItemText-primary': {
                  fontWeight: location.pathname === item.path ? 600 : 500,
                  transition: 'font-weight 0.3s ease',
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#666',
            textAlign: 'center',
            display: 'block',
            fontSize: '0.7rem',
          }}
        >
          © 2024 NUHOUD Platform
        </Typography>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
