import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AUTH_SIGN_IN_PATH } from '../routes.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={AUTH_SIGN_IN_PATH} replace state={{ from: location.pathname }} />;
  }

  return children;
}
