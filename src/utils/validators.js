// Form validation utilities

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const validateRequired = (value) => {
  return value !== null && value !== undefined && value.toString().trim() !== '';
};

export const validateMinLength = (value, minLength) => {
  return value && value.length >= minLength;
};

export const validateMaxLength = (value, maxLength) => {
  return !value || value.length <= maxLength;
};

export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateFileSize = (file, maxSizeInMB) => {
  if (!file) return true;
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

export const validateFileType = (file, allowedTypes) => {
  if (!file) return true;
  return allowedTypes.includes(file.type);
};

export const validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5; // 5MB
  
  if (!validateFileType(file, allowedTypes)) {
    return { valid: false, error: 'Please upload a valid image file (JPG, PNG, GIF, or WebP)' };
  }
  
  if (!validateFileSize(file, maxSize)) {
    return { valid: false, error: 'Image size must be less than 5MB' };
  }
  
  return { valid: true };
};

// DJ-specific validations
export const validateDjSlug = (slug) => {
  const slugRegex = /^[a-z0-9-]+$/;
  return slugRegex.test(slug) && slug.length >= 3 && slug.length <= 30;
};

export const validateVenueName = (name) => {
  return validateRequired(name) && validateMinLength(name, 2) && validateMaxLength(name, 100);
};

export const validateSongTitle = (title) => {
  return validateRequired(title) && validateMinLength(title, 1) && validateMaxLength(title, 200);
};

export const validateGreeting = (greeting) => {
  return !greeting || validateMaxLength(greeting, 500);
};

export const validateTipAmount = (amount, minimum = 0) => {
  return typeof amount === 'number' && amount >= minimum && Number.isFinite(amount);
};
