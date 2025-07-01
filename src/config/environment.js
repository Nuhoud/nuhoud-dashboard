// Environment configuration
const config = {
  development: {
    API_URL_MAIN: process.env.REACT_APP_API_URL_MAIN || 'http://localhost:3000',
    API_URL_JOBS: process.env.REACT_APP_API_URL_JOBS || 'http://localhost:4000',
    DEBUG: true,
    LOG_LEVEL: 'debug',
  },
  production: {
    API_URL_MAIN: process.env.REACT_APP_API_URL_MAIN || 'https://api.nuhoud.com',
    API_URL_JOBS: process.env.REACT_APP_API_URL_JOBS || 'https://jobs-api.nuhoud.com',
    DEBUG: false,
    LOG_LEVEL: 'error',
  },
  test: {
    API_URL_MAIN: process.env.REACT_APP_API_URL_MAIN || 'http://localhost:3000',
    API_URL_JOBS: process.env.REACT_APP_API_URL_JOBS || 'http://localhost:4000',
    DEBUG: true,
    LOG_LEVEL: 'debug',
  }
};

const environment = process.env.NODE_ENV || 'development';
const currentConfig = config[environment];

export default currentConfig; 