import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Stack,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Work as WorkIcon,
  School as SchoolIcon,
  Code as CodeIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Cake as CakeIcon,
  Translate as TranslateIcon,
  LocationOn as LocationOnIcon,
  LocationOn as LocationIcon,
  CardMembership as CertificationIcon,
  Star as StarIcon,
  Business as CompanyIcon,
  CalendarMonth as CalendarIcon,
  LocationCity as LocationCityIcon,
  CheckCircle as CheckCircleIcon,
  Interests as InterestsIcon,
  Flag as FlagIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { getApplication, updateApplicationStatus } from '../../services/api';

const statusOptions = [
  { value: 'قيد المراجعة', label: 'قيد المراجعة' },
  { value: 'تمت المراجعة', label: 'تمت المراجعة' },
  { value: 'مقبول', label: 'مقبول' },
  { value: 'مرفوض', label: 'مرفوض' },
];

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [note, setNote] = useState('');
  const [status, setStatus] = useState('قيد المراجعة');
  const [saving, setSaving] = useState(false);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const res = await getApplication(id);
      const app = res.data || res; // API may wrap in .data
      setApplication(app);
      setNote(app.employerNote || '');
      setStatus(app.status || 'قيد المراجعة');
    } catch (err) {
      console.error('Error loading application', err);
      setError('Failed to load application');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateApplicationStatus(id, { 
        status,
        employerNote: note 
      });
      navigate(-1); // go back to list after save
    } catch (err) {
      console.error('Error updating application status', err);
      setError('Failed to save changes');
    } finally {
      setSaving(false);
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
      <Alert severity="error">{error}</Alert>
    );
  }

  if (!application) return null;

  const renderSection = (title, icon, children) => (
    <Grid item xs={12}>
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            {React.cloneElement(icon, { color: "primary", sx: { mr: 1 } })}
            <Typography variant="h6" component="h2">{title}</Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          {children}
        </CardContent>
      </Card>
    </Grid>
  );

  const renderListItems = (items, primaryKey, secondaryKey = '', icon) => (
    <List dense>
      {items?.map((item, index) => (
        <ListItem key={index}>
          {icon && <ListItemIcon>{icon}</ListItemIcon>}
          <ListItemText
            primary={item[primaryKey]}
            secondary={secondaryKey ? item[secondaryKey] : null}
          />
        </ListItem>
      ))}
    </List>
  );

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Application Details</Typography>
        <Chip 
          label={application.status} 
          color={
            application.status === 'Pending' ? 'warning' :
            application.status === 'Accepted' ? 'success' :
            application.status === 'Rejected' ? 'error' : 'info'
          } 
          size="medium"
        />
      </Box>

      <Grid container spacing={3}>
        {/* Basic Info */}
        {renderSection(
          'Basic Information', 
          <PersonIcon />,
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography><strong>Name:</strong> {application.userSnap?.name || 'N/A'}</Typography>
              <Typography display="flex" alignItems="center" mt={1}>
                <EmailIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                {application.userSnap?.email || 'N/A'}
              </Typography>
              <Typography display="flex" alignItems="center" mt={1}>
                <PhoneIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                {application.userSnap?.mobile || application.userSnap?.phone || 'N/A'}
              </Typography>
              <Typography display="flex" alignItems="center" mt={1}>
                <CakeIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                {application.userSnap?.basic?.dateOfBirth ? 
                  new Date(application.userSnap.basic.dateOfBirth).toLocaleDateString() : 'N/A'}
              </Typography>
              <Typography display="flex" alignItems="center" mt={1}>
                <LocationIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                {application.userSnap?.basic?.location || 'N/A'}
              </Typography>
              <Box mt={1} display="flex" alignItems="center" flexWrap="wrap">
                <TranslateIcon color="action" sx={{ mr: 1 }} />
                {application.userSnap?.basic?.languages?.join(', ') || 'N/A'}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Job Application For:</strong>
              </Typography>
              <Typography variant="h6" color="primary">
                {application.jobTitle || application.jobOffer?.title || 'N/A'}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                at {application.companyName || 'N/A'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Applied on: {new Date(application.createdAt || application.postedAt).toLocaleString()}
              </Typography>
            </Grid>
          </Grid>
        )}

        {/* Education */}
        {application.userSnap?.education?.length > 0 && renderSection(
          'Education',
          <SchoolIcon />,
          <Grid container spacing={2}>
            {application.userSnap.education.map((edu, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" color="primary">
                      {edu.degree} in {edu.field}
                    </Typography>
                    <Typography variant="body1">{edu.university}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Graduated: {edu.endYear || 'N/A'}
                      {edu.GPA ? ` • GPA: ${edu.GPA}` : ''}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Work Experience */}
        {application.userSnap?.experiences?.length > 0 && renderSection(
          'Work Experience',
          <WorkIcon />,
          <List>
            {application.userSnap.experiences.map((exp, index) => (
              <ListItem key={index} sx={{ display: 'block', mb: 2, pb: 2, borderBottom: '1px solid rgba(0,0,0,0.12)' }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="subtitle1" color="primary">
                      {exp.jobTitle}
                    </Typography>
                    <Typography variant="body1">
                      <CompanyIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                      {exp.company}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      <LocationCityIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                      {exp.location}
                    </Typography>
                  </Box>
                  <Box>
                    <Chip 
                      label={exp.isCurrent ? 'Current' : 'Previous'}
                      size="small"
                      color={exp.isCurrent ? 'primary' : 'default'}
                      variant="outlined"
                    />
                  </Box>
                </Box>
                <Box mt={1}>
                  <Typography variant="body2" color="textSecondary">
                    <CalendarIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                    {new Date(exp.startDate).toLocaleDateString()} - {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Present'}
                  </Typography>
                </Box>
                {exp.description && (
                  <Box mt={1}>
                    <Typography variant="body2">{exp.description}</Typography>
                  </Box>
                )}
              </ListItem>
            ))}
          </List>
        )}

        {/* Skills */}
        {(application.userSnap?.skills?.technical_skills?.length > 0 || 
          application.userSnap?.skills?.soft_skills?.length > 0) && renderSection(
          'Skills',
          <CodeIcon />,
          <Grid container spacing={2}>
            {application.userSnap.skills.technical_skills?.length > 0 && (
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>Technical Skills</Typography>
                {application.userSnap.skills.technical_skills.map((skill, index) => (
                  <Box key={index} mb={1}>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography variant="body2">{skill.name}</Typography>
                      <Typography variant="body2" color="textSecondary">{skill.level}%</Typography>
                    </Box>
                    <Box width="100%" bgcolor="#e0e0e0" borderRadius={1} height={8}>
                      <Box 
                        width={`${skill.level}%`} 
                        bgcolor="primary.main" 
                        height="100%" 
                        borderRadius={1}
                      />
                    </Box>
                  </Box>
                ))}
              </Grid>
            )}
            {application.userSnap.skills.soft_skills?.length > 0 && (
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>Soft Skills</Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {application.userSnap.skills.soft_skills.map((skill, index) => (
                    <Chip 
                      key={index} 
                      label={`${skill.name} (${skill.level}%)`} 
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Grid>
            )}
          </Grid>
        )}

        {/* Certifications */}
        {application.userSnap?.certifications?.length > 0 && renderSection(
          'Certifications',
          <CertificationIcon />,
          <Grid container spacing={2}>
            {application.userSnap.certifications.map((cert, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Box display="flex" alignItems="flex-start">
                      <CertificationIcon color="primary" sx={{ mr: 1, mt: 0.5 }} />
                      <Box>
                        <Typography variant="subtitle1">{cert.name}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {cert.issuer}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Issued: {new Date(cert.issueDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Job Preferences */}
        {application.userSnap?.jobPreferences && renderSection(
          'Job Preferences',
          <StarIcon />,
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>Workplace Type</Typography>
              <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                {application.userSnap.jobPreferences.workPlaceType?.map((type, index) => (
                  <Chip key={index} label={type} size="small" />
                )) || 'N/A'}
              </Box>
              
              <Typography variant="subtitle2" gutterBottom>Job Type</Typography>
              <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                {application.userSnap.jobPreferences.jobType?.map((type, index) => (
                  <Chip key={index} label={type} size="small" color="primary" variant="outlined" />
                )) || 'N/A'}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>Preferred Location</Typography>
              <Box display="flex" alignItems="center" mb={2}>
                <LocationIcon color="action" sx={{ mr: 1 }} />
                <Typography>{application.userSnap.jobPreferences.jobLocation || 'N/A'}</Typography>
              </Box>
            </Grid>
          </Grid>
        )}

        {/* Career Goals */}
        {application.userSnap?.goals && renderSection(
          'Career Goals & Interests',
          <FlagIcon />,
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>Career Goal</Typography>
              <Typography>{application.userSnap.goals.careerGoal || 'Not specified'}</Typography>
            </Grid>
            {application.userSnap.goals.interests?.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Interests</Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {application.userSnap.goals.interests.map((interest, index) => (
                    <Chip 
                      key={index} 
                      label={interest} 
                      size="small"
                      color="default"
                      variant="outlined"
                      icon={<InterestsIcon />}
                    />
                  ))}
                </Box>
              </Grid>
            )}
          </Grid>
        )}

        {/* Employer Notes & Actions */}
        {renderSection(
          'Employer Notes & Actions',
          <CheckCircleIcon />,
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined" margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  label="Status"
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Your Notes"
                multiline
                rows={4}
                fullWidth
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add your notes about this applicant..."
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" mt={3}>
                <Button 
                  variant="outlined"
                  onClick={() => navigate(-1)}
                  startIcon={<ArrowBackIcon />}
                >
                  Back to List
                </Button>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleSave} 
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={20} /> : null}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ApplicationDetail;
