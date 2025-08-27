// Configuration for backend API URLs
const config = {
  // Use environment variable for production, fallback to localhost for development
  API_BASE_URL: process.env.REACT_APP_API_URL || 'https://attendance-backend-dvcz.onrender.com',
};

export default config;
