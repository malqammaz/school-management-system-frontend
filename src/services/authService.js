import api from '../api/axios';

export const authService = {
  // Login user
  async login(credentials) {
    if (!credentials || typeof credentials !== 'object') {
      throw new Error('Invalid credentials provided');
    }
    
    if (!credentials.email || !credentials.password) {
      throw new Error('Email and password are required');
    }
    
    try {
      const response = await api.post('/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Register user
  async register(userData) {
    if (!userData || typeof userData !== 'object') {
      throw new Error('Invalid user data provided');
    }
    
    if (!userData.email || !userData.password) {
      throw new Error('Email and password are required');
    }
    
    try {
      const response = await api.post('/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Logout user
  async logout() {
    try {
      const response = await api.post('/logout');
      return response.data;
    } catch (error) {
      console.error('Logout error:', error);
      // Don't throw error on logout failure, just log it
      return { success: false, message: 'Logout failed' };
    }
  },

  // Get current user (normalize to plain user object)
  async getUser() {
    try {
      const response = await api.get('/user');
      const payload = response.data;
      // Support many common shapes
      return (
        payload?.user ||
        payload?.data?.user ||
        payload?.data ||
        payload
      );
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  },

  // Check if user is authenticated
  isAuthenticated() {
    try {
      return !!localStorage.getItem('token');
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  },

  // Get user role
  getUserRole() {
    try {
      return localStorage.getItem('role');
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  },

  // Get user data
  getUserData() {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  },

  // Set authentication data (supports multiple shapes)
  setAuthData(data) {
    if (!data) return;
    
    try {
      // Token may be on root or under data
      const token = data?.access_token || data?.token || data?.data?.access_token || data?.data?.token;
      const user = data?.user || data?.data?.user;

      if (token) {
        localStorage.setItem('token', token);
      }
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        if (user.role) {
          localStorage.setItem('role', user.role);
        }
      }
    } catch (error) {
      console.error('Error setting auth data:', error);
    }
  },

  // Clear authentication data
  clearAuthData() {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }
};
