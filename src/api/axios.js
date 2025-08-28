import axios from "axios";
import config from "../config/env.js";
import { getAuthToken, isTokenValid, clearAuthData } from "../utils/helpers.js";

const api = axios.create({
  baseURL: config.api.baseURL,
  timeout: config.api.timeout,
});

// Set to true for debugging, false for production
const DEBUG_MODE = false;

// Request interceptor to add auth token to all requests
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  
  // Debug logging (only in debug mode)
  if (DEBUG_MODE) {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    console.log('Token present:', !!token);
  }
  
  if (isTokenValid(token)) {
    config.headers.Authorization = `Bearer ${token}`;
    if (DEBUG_MODE) console.log('Authorization header added');
  } else {
    if (DEBUG_MODE) console.log('No valid token found, request will be sent without auth');
  }
  
  return config;
}, (error) => {
  if (DEBUG_MODE) console.error('Request interceptor error:', error);
  return Promise.reject(error);
});

// Response interceptor to handle auth errors and other responses
api.interceptors.response.use(
  (response) => {
    // Debug logging (only in debug mode)
    if (DEBUG_MODE) {
      console.log('API Response:', response.status, response.config.url);
    }
    return response;
  },
  (error) => {
    if (DEBUG_MODE) {
      console.error('API Error:', error.response?.status, error.config?.url, error.response?.data);
    }
    
    if (error.response) {
      // Handle specific HTTP error status codes
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear auth data and redirect to login
          if (DEBUG_MODE) console.log('401 Unauthorized - clearing auth data and redirecting to login');
          
          // Clear all authentication data
          clearAuthData();
          
          // Redirect to login page
          // Use window.location for reliable redirect outside of Vue context
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;
        case 403:
          // Forbidden - user doesn't have permission
          console.error("Access denied:", error.response.data.message);
          break;
        case 422:
          // Validation errors
          console.error("Validation errors:", error.response.data.errors);
          break;
        case 500:
          // Server error
          console.error("Server error:", error.response.data.message);
          break;
        default:
          console.error("API Error:", error.response.data.message);
      }
    } else if (error.request) {
      // Network error
      console.error("Network error:", error.message);
    } else {
      // Other errors
      console.error("Error:", error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;