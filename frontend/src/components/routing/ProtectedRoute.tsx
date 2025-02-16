import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { token } = useAuth();
  const location = useLocation();

  if (!token) {
    // Save the attempted URL for redirecting after login
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
