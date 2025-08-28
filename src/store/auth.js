import { ref, computed } from 'vue';
import { authService } from '../services/authService';
import { getAuthToken, setAuthToken, clearAuthData, isTokenValid } from '../utils/helpers';

// State
const user = ref(null);
const token = ref(getAuthToken());
const role = ref(localStorage.getItem('role') || null);
const loading = ref(false);
const error = ref(null);

// Computed
const isAuthenticated = computed(() => !!token.value);
const userRole = computed(() => role.value);
const displayName = computed(() => {
  const u = user.value || {};
  return u.name || u.full_name || u.username || u.email || '';
});

// Actions
export const useAuthStore = () => {
  const login = async (credentials) => {
    loading.value = true;
    error.value = null;
    
    try {
      const data = await authService.login(credentials);
      authService.setAuthData(data);
      
      token.value = data.access_token || data.token || localStorage.getItem('token');
      
      // Set user data from response or fetch if needed
      if (data.user) {
        user.value = data.user;
        role.value = data.user.role || null;
      } else {
        try {
          const fetchedUser = await authService.getUser();
          if (fetchedUser) {
            user.value = fetchedUser;
            role.value = fetchedUser.role || null;
          }
        } catch {}
      }
      
      return data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Login failed';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const register = async (userData) => {
    loading.value = true;
    error.value = null;
    
    try {
      const data = await authService.register(userData);
      authService.setAuthData(data);
      
      token.value = data.access_token || data.token || localStorage.getItem('token');
      
      // Set user data from response or fetch if needed
      if (data.user) {
        user.value = data.user;
        role.value = data.user.role || null;
      } else {
        try {
          const fetchedUser = await authService.getUser();
          if (fetchedUser) {
            user.value = fetchedUser;
            role.value = fetchedUser.role || null;
          }
        } catch {}
      }
      
      return data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Registration failed';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      // ignore
    } finally {
      clearAuthData();
      user.value = null;
      token.value = null;
      role.value = null;
      error.value = null;
    }
  };

  const checkAuth = async () => {
    const existingToken = getAuthToken();

    if (!isTokenValid(existingToken)) {
      await logout();
      return;
    }

    token.value = existingToken;

    const storedUser = authService.getUserData();
    if (storedUser) {
      user.value = storedUser;
      role.value = storedUser.role || localStorage.getItem('role') || null;
      return;
    }

    try {
      const fetchedUser = await authService.getUser();
      if (fetchedUser) {
        user.value = fetchedUser;
        role.value = fetchedUser.role || null;
        localStorage.setItem('user', JSON.stringify(fetchedUser));
        if (fetchedUser.role) {
          localStorage.setItem('role', fetchedUser.role);
        }
      } else {
        await logout();
      }
    } catch (e) {
      await logout();
    }
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    // State (raw refs so templates unwrap automatically)
    user,
    token,
    role,
    loading,
    error,
    
    // Computed
    isAuthenticated,
    userRole,
    displayName,
    
    // Actions
    login,
    register,
    logout,
    checkAuth,
    clearError
  };
};
