// Re-export auth and DJ services for backward compatibility
export { authService } from '../api';
export { djService } from '../api';

// Legacy function wrappers for backward compatibility
export const getUser = async () => {
  const { authService } = await import('../api');
  return authService.getUser();
};

export const requireAuth = async () => {
  const { authService } = await import('../api');
  return authService.requireAuth();
};

export const getDjProfile = async () => {
  const { djService } = await import('../api');
  return djService.getDjProfile();
};

export const signIn = async (email, password) => {
  const { authService } = await import('../api');
  return authService.signIn(email, password);
};

export const signUp = async (email, password, metadata = {}) => {
  const { authService } = await import('../api');
  return authService.signUp(email, password, metadata);
};

export const signOut = async () => {
  const { authService } = await import('../api');
  return authService.signOut();
};
