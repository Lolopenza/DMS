import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AUTH_SIGN_IN_PATH, USER_DASHBOARD_PATH } from '../routes.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children, requiredRole = null }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to={AUTH_SIGN_IN_PATH} replace state={{ from: location.pathname }} />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={USER_DASHBOARD_PATH} replace />;
  }

  return children;
}
