// Format date to readable string
export const formatDate = (date) => {
  if (!date) return '';
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

// Format date for input fields (YYYY-MM-DD)
export const formatDateForInput = (date) => {
  if (!date) return '';
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    return dateObj.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date for input:', error);
    return '';
  }
};

// Capitalize first letter
export const capitalize = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Get grade color based on grade value
export const getGradeColor = (grade) => {
  if (typeof grade !== 'number' || isNaN(grade)) return 'text-gray-600';
  if (grade >= 90) return 'text-green-600';
  if (grade >= 80) return 'text-blue-600';
  if (grade >= 70) return 'text-yellow-600';
  if (grade >= 60) return 'text-orange-600';
  return 'text-red-600';
};

// Get grade letter
export const getGradeLetter = (grade) => {
  if (typeof grade !== 'number' || isNaN(grade)) return 'N/A';
  if (grade >= 90) return 'A';
  if (grade >= 80) return 'B';
  if (grade >= 70) return 'C';
  if (grade >= 60) return 'D';
  return 'F';
};

// Debounce function
export const debounce = (func, wait) => {
  if (typeof func !== 'function' || typeof wait !== 'number') {
    console.warn('debounce: Invalid parameters provided');
    return func;
  }
  
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Pagination helper
export const getPaginationInfo = (currentPage, totalPages, totalItems, perPage) => {
  // Validate inputs
  if (!currentPage || !totalPages || !totalItems || !perPage) {
    return {
      startItem: 0,
      endItem: 0,
      totalItems: 0,
      hasNextPage: false,
      hasPrevPage: false
    };
  }
  
  const startItem = (currentPage - 1) * perPage + 1;
  const endItem = Math.min(currentPage * perPage, totalItems);
  
  return {
    startItem,
    endItem,
    totalItems,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  };
};

// Search helper
export const searchItems = (items, searchTerm, searchFields) => {
  if (!searchTerm || !Array.isArray(items) || !Array.isArray(searchFields)) return items;
  
  const term = searchTerm.toLowerCase().trim();
  if (!term) return items;
  
  return items.filter(item => {
    return searchFields.some(field => {
      const value = item[field];
      return value && value.toString().toLowerCase().includes(term);
    });
  });
};

// Filter helper
export const filterItems = (items, filters) => {
  if (!Array.isArray(items) || !filters || typeof filters !== 'object') return items;
  
  return items.filter(item => {
    return Object.keys(filters).every(key => {
      const filterValue = filters[key];
      const itemValue = item[key];
      
      if (!filterValue || filterValue === '') return true;
      
      if (Array.isArray(filterValue)) {
        return filterValue.includes(itemValue);
      }
      
      return itemValue === filterValue;
    });
  });
};

// Sort helper
export const sortItems = (items, sortBy, sortOrder = 'asc') => {
  if (!Array.isArray(items) || !sortBy) return items;
  
  return [...items].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    // Handle null/undefined values
    if (aValue === null || aValue === undefined) aValue = '';
    if (bValue === null || bValue === undefined) bValue = '';
    
    // Convert to strings for comparison
    aValue = aValue.toString().toLowerCase();
    bValue = bValue.toString().toLowerCase();
    
    if (sortOrder === 'desc') {
      return bValue.localeCompare(aValue);
    }
    
    return aValue.localeCompare(bValue);
  });
};

// Role helpers with validation
export function isAdmin(role) {
  return role === 'admin';
}

export function isTeacher(role) {
  return role === 'teacher';
}

export function isStudent(role) {
  return role === 'student';
}

// Token management helpers with validation
export function getAuthToken() {
  try {
    const token = localStorage.getItem('token');
    return token && token !== 'null' && token !== 'undefined' ? token : null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

export function setAuthToken(token) {
  try {
    if (token && typeof token === 'string') {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  } catch (error) {
    console.error('Error setting auth token:', error);
  }
}

export function clearAuthData() {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
}

export function isTokenValid(token) {
  return token && typeof token === 'string' && token !== 'null' && token !== 'undefined';
}
