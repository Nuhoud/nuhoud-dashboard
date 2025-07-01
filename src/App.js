import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import MainLayout from './components/MainLayout';
import ProtectedRoute from './routes/ProtectedRoute';

// Admin Routes
import Dashboard from './pages/admin/Dashboard';
import CreateAdmin from './pages/admin/CreateAdmin';
import CreateEmployer from './pages/admin/CreateEmployer';
import JobOffers from './pages/admin/JobOffers';
import JobApplicationsList from './pages/admin/JobApplicationsList';
import JobApplicants from './pages/admin/JobApplicants';
import Users from './pages/admin/Users';

// Employer Routes
import EmployerDashboard from './pages/employer/Dashboard';
import MyJobs from './pages/employer/MyJobs';
import CreateJobOffer from './pages/employer/CreateJobOffer';
import JobApplications from './pages/employer/JobApplications';
import Applicants from './pages/employer/Applicants';

// Common Routes
import Login from './pages/Login';
import Profile from './pages/Profile';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<MainLayout />}>
            {/* Admin Routes */}
            <Route path="admin" element={<ProtectedRoute role="admin" />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="create-admin" element={<CreateAdmin />} />
              <Route path="create-employer" element={<CreateEmployer />} />
              <Route path="job-offers" element={<JobOffers />} />
              <Route path="job-offers/:jobId/applications" element={<JobApplicationsList />} />
              <Route path="job-applicants" element={<JobApplicants />} />
              <Route path="users" element={<Users />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Employer Routes */}
            <Route path="employer" element={<ProtectedRoute role="employer" />}>
              <Route path="dashboard" element={<EmployerDashboard />} />
              <Route path="jobs" element={<MyJobs />} />
              <Route path="jobs/create" element={<CreateJobOffer />} />
              <Route path="jobs/:jobId/applications" element={<JobApplicationsList />} />
              <Route path="jobs/:jobId/applicants" element={<Applicants />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Default redirect */}
            <Route index element={<Navigate to="/login" replace />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
