/**
 * Application Configuration
 * Update these values based on your environment
 */

export const config = {
  // Backend API Base URL
  apiBaseUrl: 'https://wareongo-website-backend.onrender.com',
  
  // API Endpoints
  api: {
    warehouses: '/warehouses',
    enquiries: '/enquiries',
    customerRequests: '/customer-requests',
    googleLogin: '/api/auth/google-login',
  },
  
  // Google OAuth Client ID
  // Get this from: https://console.cloud.google.com/apis/credentials
  googleClientId: '457806840342-8uqcocglvgkjd8h9m0mldk79pvbvos8d.apps.googleusercontent.com',
  
  // Pagination defaults
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 50,
  },
  
  // Filter defaults
  filters: {
    maxBudget: 100000,
    minBudget: 0,
    cities: ['Bangalore', 'Hosur', 'Kolkata', 'Delhi', 'Hyderabad'],
  },
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${config.apiBaseUrl}${endpoint}`;
};

export default config;
