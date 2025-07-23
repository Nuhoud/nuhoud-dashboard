import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  TablePagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';

import { getJobApplications, getJobOffer } from '../../services/api';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';

const JobApplicationsList = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [jobDetails, setJobDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [sortModel, setSortModel] = useState([{ field: 'postedAt', sort: 'desc' }]);

  const fetchJobDetails = async () => {
    try {
      const response = await getJobOffer(jobId);
      setJobDetails(response);
    } catch (err) {
      console.error('Error fetching job details:', err);
      setError('Failed to load job details');
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await getJobApplications(jobId, {
        page: page + 1,
        limit: pageSize,
        sortBy: sortModel[0]?.field || 'postedAt',
        sortOrder: sortModel[0]?.sort || 'desc'
      });
      
      setApplications(response.data || []);
      setTotalCount(response.total || 0);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  useEffect(() => {
    fetchApplications();
  }, [jobId, page, pageSize, sortModel]);

  const handleViewApplication = (applicationId) => {
    navigate(`/admin/applications/${applicationId}`);
  };

  const handleDownloadResume = (resumeUrl) => {
    window.open(resumeUrl, '_blank');
  };

  if (loading && !applications.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {jobDetails && (
        <Box mb={3}>
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#1976d2', mb: 1 }}>
            Applications for {jobDetails.title}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Location: {jobDetails.jobLocation} | Type: {jobDetails.jobType} | 
            Experience: {jobDetails.experienceLevel}
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Applicant Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Applied On</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application._id}>
                  <TableCell>{application.userSnap?.name || application.applicant?.name || 'N/A'}</TableCell>
                  <TableCell>{application.userSnap?.email || application.applicant?.email || 'N/A'}</TableCell>
                  <TableCell>{application.userSnap?.mobile || application.userSnap?.phone || application.applicant?.phone || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip
                      label={application.status}
                      color={
                        application.status === 'Pending' ? 'warning' :
                        application.status === 'Accepted' ? 'success' :
                        application.status === 'Rejected' ? 'error' : 'default'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{new Date(application.postedAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Tooltip title="View Application">
                      <IconButton onClick={() => handleViewApplication(application._id)} color="primary" size="small">
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    {application.resume && (
                      <Tooltip title="Download Resume">
                        <IconButton onClick={() => handleDownloadResume(application.resume)} color="primary" size="small">
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {applications.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">No applications found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalCount}
          rowsPerPage={pageSize}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => { setPageSize(parseInt(event.target.value, 10)); setPage(0); }}
        />
      </Paper>
    </Box>
  );
};

export default JobApplicationsList; 