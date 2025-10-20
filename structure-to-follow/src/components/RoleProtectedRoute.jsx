import { Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { UserDataContext } from '../context/UserDataContext';

export const RoleProtectedRoute = ({ children, requiredRole }) => {
  const { loggedInUser } = useContext(UserDataContext);
  const location = useLocation();

  // Check if user has the required role
  if (!loggedInUser || loggedInUser.role !== requiredRole) {
    // Redirect to dashboard if user doesn't have the required role
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};
