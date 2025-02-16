import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null; // or a loading spinner
  }

  if (!token) {
    // Redirect to login but save the attempted location
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
