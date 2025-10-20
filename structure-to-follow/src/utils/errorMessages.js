export const getAuthError = (error) => {
  const errorCode = error?.message || error?.error_description || error

  const errorMessages = {
    'Invalid login credentials': 'Incorrect email or password. Please try again.',
    'Email not confirmed': 'Please check your email to confirm your account.',
    'User already registered': 'An account with this email already exists.',
    'Password should be at least 6 characters': 'Please use a password with at least 6 characters.',
    'Email rate limit exceeded': 'Too many attempts. Please try again later.',
    'Network error': 'Connection failed. Please check your internet connection.',
    'Invalid email': 'Please enter a valid email address.',
    'Email link is invalid or has expired': 'The reset link has expired. Please request a new one.',
    'New password should be different from the old password': 'Please choose a different password.',
    'Auth session missing!': 'Your session has expired. Please sign in again.',
    'Password is too weak': 'Please use a stronger password with mixed characters.',
    'Email change rate limit exceeded': 'Please wait before requesting another email change.',
    'Phone change rate limit exceeded': 'Please wait before requesting another phone change.',
    'Password recovery rate limit exceeded': 'Please wait before requesting another password reset.',
  }

  // Return friendly message or default error
  return errorMessages[errorCode] || 'Something went wrong. Please try again.'
}
