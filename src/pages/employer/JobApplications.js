import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { getJobApplications, updateApplicationStatus } from '../../services/api';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GetAppIcon from '@mui/icons-material/GetApp';

const JobApplications = () => {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState('postedAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await getJobApplications(
        jobId,
        page + 1,
        rowsPerPage,
        sortBy,
        sortOrder
      );
      setApplications(response.data);
      setTotalCount(response.total);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [jobId, page, rowsPerPage, sortBy, sortOrder]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await updateApplicationStatus(applicationId, { status: newStatus });
      // Refresh the applications list
      fetchApplications();
    } catch (err) {
      console.error('Error updating application status:', err);
      setError('Failed to update application status. Please try again.');
    }
  };

  const handleViewCV = (cvUrl) => {
    if (cvUrl) {
      window.open(cvUrl, '_blank');
    }
  };

  const handleDownloadCV = (cvUrl) => {
    if (cvUrl) {
      const link = document.createElement('a');
      link.href = cvUrl;
      link.download = 'cv.pdf'; // You might want to get the actual filename from the URL
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box m={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom sx={{ color: '#1976d2', fontWeight: 600 }}>
        Job Applications
      </Typography>

      <Paper sx={{ width: '100%', overflow: 'hidden', mt: 3 }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Applicant Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Applied Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>CV</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application._id}>
                  <TableCell>{application.applicant?.name || 'N/A'}</TableCell>
                  <TableCell>{application.applicant?.email || 'N/A'}</TableCell>
                  <TableCell>{application.applicant?.phone || 'N/A'}</TableCell>
                  <TableCell>
                    {new Date(application.postedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <FormControl size="small" fullWidth>
                      <Select
                        value={application.status}
                        onChange={(e) => handleStatusChange(application._id, e.target.value)}
                      >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="reviewing">Reviewing</MenuItem>
                        <MenuItem value="shortlisted">Shortlisted</MenuItem>
                        <MenuItem value="rejected">Rejected</MenuItem>
                        <MenuItem value="accepted">Accepted</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    {application.cv && (
                      <Box>
                        <Tooltip title="View CV">
                          <IconButton onClick={() => handleViewCV(application.cv)}>
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download CV">
                          <IconButton onClick={() => handleDownloadCV(application.cv)}>
                            <GetAppIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    {/* Add any additional actions here */}
                  </TableCell>
                </TableRow>
              ))}
              {applications.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No applications found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default JobApplications; 