// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation (minimum 8 characters, at least one letter and one number)
export const isValidPassword = (password) => {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
  return passwordRegex.test(password);
};

// Name validation (letters, spaces, hyphens, apostrophes)
export const isValidName = (name) => {
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  return nameRegex.test(name) && name.length >= 2;
};

// Date validation
export const isValidDate = (date) => {
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj);
};

// Required field validation
export const isRequired = (value) => {
  return value !== null && value !== undefined && value.toString().trim() !== '';
};

// Form validation helper
export const validateForm = (formData, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const value = formData[field];
    const fieldRules = rules[field];
    
    // Check required
    if (fieldRules.required && !isRequired(value)) {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      return;
    }
    
    // Skip other validations if field is empty and not required
    if (!isRequired(value)) return;
    
    // Check email
    if (fieldRules.email && !isValidEmail(value)) {
      errors[field] = 'Please enter a valid email address';
      return;
    }
    
    // Check password
    if (fieldRules.password && !isValidPassword(value)) {
      errors[field] = 'Password must be at least 8 characters with letters and numbers';
      return;
    }
    
    // Check name
    if (fieldRules.name && !isValidName(value)) {
      errors[field] = 'Please enter a valid name';
      return;
    }
    
    // Check date
    if (fieldRules.date && !isValidDate(value)) {
      errors[field] = 'Please enter a valid date';
      return;
    }
    
    // Check min length
    if (fieldRules.minLength && value.length < fieldRules.minLength) {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${fieldRules.minLength} characters`;
      return;
    }
    
    // Check max length
    if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} must be no more than ${fieldRules.maxLength} characters`;
      return;
    }
  });
  
  return errors;
};
