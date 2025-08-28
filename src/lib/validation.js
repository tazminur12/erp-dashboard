// Validation utilities

// Validate email format
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  return {
    isValid: emailRegex.test(email),
    message: emailRegex.test(email) 
      ? 'Valid email address' 
      : 'Please enter a valid email address'
  };
};
