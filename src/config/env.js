// Environment configuration
const config = {
  // API Configuration
  api: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
    timeout: 10000,
  },
  
  // App Configuration
  app: {
    name: 'School Management System',
    version: '1.0.0',
  },
  
  // Feature flags
  features: {
    pagination: true,
    search: true,
    filters: true,
  },
  
  // Pagination defaults
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 20, 50],
  },
};

export default config;
