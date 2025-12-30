import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Paper,
  Box,
  Button,
  Chip,
  Avatar,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { getJobApplications } from '../../services/api';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Applicants = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getJobApplications(jobId, {
        page: page + 1,
        limit: rowsPerPage,
        sortBy: 'postedAt',
        sortOrder: 'desc'
      });
      
      console.log('API Response:', response);
      
      // Handle different response structures
      let applicationsData = [];
      let totalCount = 0;
      
      if (response.data) {
        applicationsData = Array.isArray(response.data) ? response.data : [];
        totalCount = response.total || applicationsData.length;
      } else if (Array.isArray(response)) {
        applicationsData = response;
        totalCount = response.length;
      }
      
      setApplications(applicationsData);
      setTotal(totalCount);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [jobId, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewProfile = (applicant) => {
    setSelectedApplicant(applicant);
  };

  const handleCloseProfile = () => {
    setSelectedApplicant(null);
  };

  // Helper function to safely get nested values
  const getNestedValue = (obj, path, defaultValue = 'N/A') => {
    try {
      return path.split('.').reduce((current, key) => current?.[key], obj) || defaultValue;
    } catch {
      return defaultValue;
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'تمت المراجعة':
      case 'Reviewed':
      case 'Accepted':
        return 'success';
      case 'قيد المراجعة':
      case 'Pending':
        return 'warning';
      case 'مرفوض':
      case 'Rejected':
        return 'error';
      default:
        return 'primary';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
          Job Applicants ({total})
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/employer/jobs')}
          sx={{ borderRadius: 2 }}
        >
          Back to My Jobs
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      ) : (
        <Paper sx={{ p: 0, borderRadius: 3, boxShadow: (theme) => theme.shadows[3] }}>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'action.hover' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'action.hover' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'action.hover' }}>Phone</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'action.hover' }}>Location</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'action.hover' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'action.hover' }}>Applied Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'action.hover' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {applications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No applicants found for this job.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  applications.map((app, index) => {
                    const userSnap = app.userSnap || {};
                    const basic = userSnap.basic || {};
                    
                    return (
                      <TableRow 
                        key={app._id || app.id || index}
                        sx={{ '&:hover': { backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.04) } }}
                      >
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                              {(userSnap.name && userSnap.name[0]?.toUpperCase()) || '?'}
                            </Avatar>
                            <Typography variant="body2" fontWeight="medium">
                              {userSnap.name || 'N/A'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {userSnap.email || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {userSnap.mobile || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {basic.location || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={app.status || 'Unknown'} 
                            color={getStatusColor(app.status)}
                            size="small" 
                            sx={{ fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(app.postedAt)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleViewProfile(app)}
                            sx={{
                              borderRadius: 2,
                              borderColor: 'primary.main',
                              color: 'primary.main',
                              '&:hover': {
                                borderColor: 'primary.dark',
                                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                              }
                            }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {total > 0 && (
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              sx={{
                borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                backgroundColor: 'background.default'
              }}
            />
          )}
        </Paper>
      )}

      {/* Enhanced Profile Modal */}
      <Dialog 
        open={!!selectedApplicant} 
        onClose={handleCloseProfile} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ backgroundColor: 'action.hover', fontWeight: 600 }}>
          Applicant Profile
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedApplicant && (
            <Box>
              <Grid container spacing={3}>
                {/* Personal Information */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%', borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                        Personal Information
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {getNestedValue(selectedApplicant.userSnap, 'name')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {getNestedValue(selectedApplicant.userSnap, 'email')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {getNestedValue(selectedApplicant.userSnap, 'mobile')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          📍 {getNestedValue(selectedApplicant.userSnap, 'basic.location')}
                        </Typography>
                      </Box>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        Basic Info
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Gender:</strong> {getNestedValue(selectedApplicant.userSnap, 'basic.gender')}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Date of Birth:</strong> {formatDate(getNestedValue(selectedApplicant.userSnap, 'basic.dateOfBirth'))}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Languages:</strong> {(selectedApplicant.userSnap?.basic?.languages || []).join(', ') || 'N/A'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Professional Information */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%', borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                        Professional Information
                      </Typography>
                      
                      {/* Education */}
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        Education
                      </Typography>
                      {(selectedApplicant.userSnap?.education || []).length > 0 ? (
                        (selectedApplicant.userSnap.education || []).map((edu, idx) => (
                          <Box key={idx} sx={{ mb: 2, p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
                            <Typography variant="body2" fontWeight={500}>
                              {edu.degree} in {edu.field}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {edu.university} ({edu.endYear})
                            </Typography>
                            {edu.GPA && (
                              <Typography variant="body2" color="text.secondary">
                                GPA: {edu.GPA}
                              </Typography>
                            )}
                          </Box>
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          No education information available
                        </Typography>
                      )}

                      {/* Experience */}
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        Experience
                      </Typography>
                      {(selectedApplicant.userSnap?.experiences || []).length > 0 ? (
                        (selectedApplicant.userSnap.experiences || []).map((exp, idx) => (
                          <Box key={idx} sx={{ mb: 2, p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
                            <Typography variant="body2" fontWeight={500}>
                              {exp.jobTitle} at {exp.company}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              📍 {exp.location}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(exp.startDate)} - {exp.isCurrent ? 'Present' : formatDate(exp.endDate)}
                            </Typography>
                            {exp.description && (
                              <Typography variant="body2" sx={{ mt: 1 }}>
                                {exp.description}
                              </Typography>
                            )}
                          </Box>
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No experience information available
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Skills and Certifications */}
                <Grid item xs={12}>
                  <Card sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Grid container spacing={3}>
                        {/* Skills */}
                        <Grid item xs={12} md={6}>
                          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                            Skills
                          </Typography>
                          
                          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                            Technical Skills
                          </Typography>
                          <Box sx={{ mb: 2 }}>
                            {(selectedApplicant.userSnap?.skills?.technical_skills || []).length > 0 ? (
                              (selectedApplicant.userSnap.skills.technical_skills || []).map((skill, idx) => (
                                <Chip 
                                  key={idx} 
                                  label={`${skill.name} (${skill.level}%)`} 
                                  size="small" 
                                  sx={{ mr: 1, mb: 1 }}
                                  color="primary"
                                  variant="outlined"
                                />
                              ))
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                No technical skills listed
                              </Typography>
                            )}
                          </Box>

                          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                            Soft Skills
                          </Typography>
                          <Box>
                            {(selectedApplicant.userSnap?.skills?.soft_skills || []).length > 0 ? (
                              (selectedApplicant.userSnap.skills.soft_skills || []).map((skill, idx) => (
                                <Chip 
                                  key={idx} 
                                  label={`${skill.name} (${skill.level}%)`} 
                                  size="small" 
                                  sx={{ mr: 1, mb: 1 }}
                                  color="secondary"
                                  variant="outlined"
                                />
                              ))
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                No soft skills listed
                              </Typography>
                            )}
                          </Box>
                        </Grid>

                        {/* Certifications */}
                        <Grid item xs={12} md={6}>
                          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                            Certifications
                          </Typography>
                          {(selectedApplicant.userSnap?.certifications || []).length > 0 ? (
                            (selectedApplicant.userSnap.certifications || []).map((cert, idx) => (
                              <Box key={idx} sx={{ mb: 2, p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
                                <Typography variant="body2" fontWeight={500}>
                                  {cert.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Issued by: {cert.issuer}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Issue Date: {formatDate(cert.issueDate)}
                                </Typography>
                              </Box>
                            ))
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No certifications available
                            </Typography>
                          )}
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Job Preferences and Goals */}
                <Grid item xs={12}>
                  <Card sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                            Job Preferences
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Workplace Type:</strong> {(selectedApplicant.userSnap?.jobPreferences?.workPlaceType || []).join(', ') || 'N/A'}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Job Type:</strong> {(selectedApplicant.userSnap?.jobPreferences?.jobType || []).join(', ') || 'N/A'}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Preferred Location:</strong> {getNestedValue(selectedApplicant.userSnap, 'jobPreferences.jobLocation')}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                            Goals & Interests
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 2 }}>
                            <strong>Career Goal:</strong>
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic' }}>
                            {getNestedValue(selectedApplicant.userSnap, 'goals.careerGoal')}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Interests:</strong>
                          </Typography>
                          <Box>
                            {(selectedApplicant.userSnap?.goals?.interests || []).map((interest, idx) => (
                              <Chip 
                                key={idx} 
                                label={interest} 
                                size="small" 
                                sx={{ mr: 1, mb: 1 }}
                                color="info"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, backgroundColor: 'action.hover' }}>
          <Button onClick={handleCloseProfile} variant="contained" sx={{ borderRadius: 2 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Applicants;
