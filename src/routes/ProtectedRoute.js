import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const getUserRole = () => {
  return localStorage.getItem('userRole');
};

// Set this to true to disable authentication for testing
const DISABLE_AUTH = false;

const ProtectedRoute = ({ role }) => {
  if (DISABLE_AUTH) {
    return <Outlet />;
  }

  const token = localStorage.getItem('token');
  const userRole = getUserRole();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role && role !== userRole) {
    if (userRole === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (userRole === 'employer') {
      return <Navigate to="/employer/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
