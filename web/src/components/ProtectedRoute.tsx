import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Wraps a route so that unauthenticated or non-admin visitors
 * are redirected to /login, preserving the intended destination.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoading, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="auth-loading" role="status" aria-live="polite">
        <div className="spinner" aria-hidden="true" />
        <span>Restoring your session…</span>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
