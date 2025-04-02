import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../store/auth/useAuth';
import { LoadingSpinner } from '../common/LoadingSpinner';

export function PrivateRoute({ children }) {
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();
  
  // Debug log
  console.log('PrivateRoute Status:', {
    path: location.pathname,
    isAuthenticated,
    loading
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate 
      to="/signin" 
      replace 
      state={{ from: location.pathname }}  
    />;
  }

  return children;
}