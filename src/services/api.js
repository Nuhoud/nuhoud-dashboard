import axios from 'axios';
import config from '../config/environment';
import { API_URL } from '../config/environment';

// Create separate instances for each backend
const apiMain = axios.create({ 
  baseURL: config.API_URL_MAIN,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

const apiJobs = axios.create({ 
  baseURL: config.API_URL_JOBS,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Response interceptor for error handling
const addResponseInterceptor = (instance) => {
  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // Handle token expiration
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        window.location.href = '/login';
      }
      
      // Handle network errors
      if (!error.response) {
        // eslint-disable-next-line no-console
        console.error('Network error:', error.message);
        throw new Error('Network error. Please check your internet connection.');
      }
      
      // Handle server errors
      if (error.response?.status >= 500) {
        // eslint-disable-next-line no-console
        console.error('Server error:', error.response.data);
        throw new Error('Server error. Please try again later.');
      }
      
      return Promise.reject(error);
    }
  );
};

// Add request interceptor to always include token if present
const addRequestInterceptor = (instance) => {
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
        console.log('Token added to header:', config.headers['Authorization']);
      } else {
        console.log('No token found in localStorage');
      }
      console.log('Request config:', config);
      return config;
    },
    (error) => Promise.reject(error)
  );
};

// Apply interceptors to both instances
addResponseInterceptor(apiMain);
addResponseInterceptor(apiJobs);
addRequestInterceptor(apiMain);
addRequestInterceptor(apiJobs);

// Helper to get token
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// --- Auth & Users API (Port 3000) ---
export const login = async (identifier, password) => {
  try {
    const response = await apiMain.post('/auth/login?isMobile=false', {
      identifier,
      password,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await apiMain.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Logout error:', error);
    throw error;
  }
};

export const refreshToken = async () => {
  try {
    const response = await apiMain.post('/auth/refresh');
    const { token } = response.data;
    localStorage.setItem('token', token);
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Token refresh error:', error);
    throw error;
  }
};

export const signupAdmin = async (data) => {
  const response = await apiMain.post('/auth/signup-admin', data);
  return response.data;
};

export const createEmployer = async (data) => {
  try {
    const response = await apiMain.post('/auth/signup-employer', data, { 
      headers: getAuthHeaders() 
    });
    return response.data;
  } catch (error) {
    if (error.response?.data) {
      throw error.response.data;
    }
    throw error;
  }
};

/**
 * Get users with required role and optional pagination/sorting.
 * @param {string} role - user, employer, or admin (required)
 * @param {object} options - { page, limit, sortBy, sortOrder }
 */
export const getUsers = async (role, options = {}) => {
  if (!role) throw new Error('Role is required');
  const params = { role, ...options };
  const response = await apiMain.get('/users', { params, headers: getAuthHeaders() });
  return response.data;
};

export const getUser = async (id) => {
  const response = await apiMain.get(`/users/${id}`, { headers: getAuthHeaders() });
  return response.data;
};

export const updateUser = async (id, data) => {
  const response = await apiMain.patch(`/users/${id}`, data, { headers: getAuthHeaders() });
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await apiMain.delete(`/users/${id}`, { headers: getAuthHeaders() });
  return response.data;
};

export const getMyProfile = async () => {
  const response = await apiMain.get('/users/my-profile', { headers: getAuthHeaders() });
  return response.data;
};

export const updateMyProfile = async (data) => {
  const response = await apiMain.patch('/users/my-profile', data, { headers: getAuthHeaders() });
  return response.data;
};

// --- Profile API (Port 3000) ---
export const profileStepOne = async (data) => {
  const response = await apiMain.post('/profile/profileInfoStepOne', data, { headers: getAuthHeaders() });
  return response.data;
};

export const profileStepTwo = async (data) => {
  const response = await apiMain.post('/profile/profileInfoStepTwo', data, { headers: getAuthHeaders() });
  return response.data;
};

// --- Job Offers & Applications API (Port 4000) ---
export const getJobOffers = async (filters = {}) => {
  const response = await apiJobs.get('/job-offers', { params: filters, headers: getAuthHeaders() });
  return response.data;
};

export const getEmployerJobs = async ({ page = 1, limit = 10, sortBy = 'postedAt', sortOrder = 'desc' } = {}) => {
  try {
    const response = await apiJobs.get('/job-offers', {
      params: { page, limit, sortBy, sortOrder },
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching employer jobs:', error);
    throw error;
  }
};

export const getApplicationsForJob = async (jobId) => {
  const response = await apiJobs.get(`/application/job-offer/${jobId}`, { headers: getAuthHeaders() });
  return response.data;
};

export const getJobOffer = async (id) => {
  const response = await apiJobs.get(`/job-offers/${id}`, { headers: getAuthHeaders() });
  return response.data;
};

export const createJobOffer = async (data) => {
  try {
    console.log('Creating job offer with data:', data);
    
    // Format the data to match the backend expectations
    const formattedData = {
      ...data,
      workPlaceType: data.workPlaceType === 'On-site' ? 'في الشركة' : 
                     data.workPlaceType === 'Remote' ? 'عن بعد' : 
                     data.workPlaceType === 'Hybrid' ? 'مزيج' : data.workPlaceType,
      jobType: data.jobType === 'Full-time' ? 'دوام كامل' :
               data.jobType === 'Part-time' ? 'دوام جزئي' :
               data.jobType === 'Contract' ? 'عقد' :
               data.jobType === 'Freelance' ? 'مستقل' :
               data.jobType === 'Internship' ? 'تدريب' : data.jobType,
      deadline: new Date(data.deadline).toISOString()
    };

    console.log('Formatted data:', formattedData);
    
    const response = await apiJobs.post('/job-offers', formattedData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Create job offer response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating job offer:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

export const updateJobOffer = async (id, data) => {
  try {
    console.log('Updating job offer:', id, 'with data:', data);
    console.log('Headers:', getAuthHeaders());
    const response = await apiJobs.patch(`/job-offers/${id}`, data, { 
      headers: getAuthHeaders() 
    });
    console.log('Update job offer response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating job offer:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

export const deleteJobOffer = async (id) => {
  try {
    console.log('Deleting job offer:', id);
    console.log('Headers:', getAuthHeaders());
    const response = await apiJobs.delete(`/job-offers/${id}`, { 
      headers: getAuthHeaders() 
    });
    console.log('Delete job offer response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting job offer:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

export const getEmployerJobsAnalytics = async () => {
  return apiJobs.get('/job-offers/employer/analytics', { headers: getAuthHeaders() });
};

export const getJobOffersAnalytics = async () => {
  return apiJobs.get('/job-offers/analytics', { headers: getAuthHeaders() });
};

export const getApplications = async (filters = {}) => {
  return apiJobs.get('/application', { params: filters, headers: getAuthHeaders() });
};

export const getApplication = (id) => apiJobs.get(`/application/${id}`, { headers: getAuthHeaders() });

export const updateApplication = async (applicationId, data) => {
  const res = await apiJobs.patch(`/application/${applicationId}`, data, { headers: getAuthHeaders() });
  return res.data;
};

export const updateApplicationStatus = async (applicationId, data) => {
  const response = await apiJobs.patch(`/application/${applicationId}/status`, data, { headers: getAuthHeaders() });
  return response.data;
};

export const deleteApplication = (id) => apiJobs.delete(`/application/${id}`, { headers: getAuthHeaders() });

export const getUserProfile = async (userId) => {
  return apiMain.get(`/users/${userId}/profile`, { headers: getAuthHeaders() });
};

// --- File Upload API ---
export const uploadFile = async (file, type = 'document') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  return apiMain.post('/upload', formData, {
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'multipart/form-data',
    },
  });
};

// --- Utility functions ---
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export const getCurrentUser = () => {
  return {
    role: localStorage.getItem('userRole'),
    name: localStorage.getItem('userName'),
    email: localStorage.getItem('userEmail'),
  };
};

export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
};

// --- API Health Check ---
export const checkApiHealth = async () => {
  try {
    const [mainHealth, jobsHealth] = await Promise.all([
      apiMain.get('/health'),
      apiJobs.get('/health')
    ]);
    
    return {
      main: mainHealth.data,
      jobs: jobsHealth.data,
      status: 'healthy'
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('API health check failed:', error);
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
};

const renderErrorMessages = (errorObj) => {
  if (typeof errorObj === 'string') return errorObj;
  if (!errorObj || typeof errorObj !== 'object') return null;
  const messages = Object.values(errorObj).flat();
  return (
    <ul style={{ color: 'red' }}>
      {messages.map((msg, idx) => <li key={idx}>{msg}</li>)}
    </ul>
  );
};

/**
 * Get employer job statistics (dummy data for testing)
 */
export const getEmployerJobStatistics = async () => {
  // Return dummy data for testing
  return {
    data: {
      totalJobs: 12,
      activeJobs: 7,
      closedJobs: 5,
      totalApplications: 120,
      pendingApplications: 15,
      acceptedApplications: 80,
      rejectedApplications: 25,
      topJob: {
        title: 'Senior Developer',
        applications: 40
      }
    }
  };
  // To use real API, uncomment below:
  // return apiJobs.get('/job-offers/statistics/employer', { headers: getAuthHeaders() });
};

export const getJobApplications = async (jobId, params = {}) => {
  try {
    console.log('Fetching applications for job:', jobId);
    const response = await apiJobs.get(`/application/job-offer/${jobId}`, {
      params: {
        page: params.page || 1,
        limit: params.limit || 10,
        sortBy: params.sortBy || 'postedAt',
        sortOrder: params.sortOrder || 'desc'
      },
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      }
    });
    console.log('Job applications response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching job applications:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

export const getAllJobApplications = async () => {
  try {
    console.log('Fetching all job applications...');
    const response = await apiJobs.get('/job-offers', {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      }
    });
    console.log('Job applications response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching job applications:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

export const updateUserProfile = async (userData) => {
  try {
    const response = await apiMain.patch('/users/my-profile', userData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const updateProfile = async (userId, data) => {
  try {
    const response = await apiMain.patch(`/users/${userId}`, data);
    return response;
  } catch (error) {
    throw error;
  }
};

export default apiMain;
