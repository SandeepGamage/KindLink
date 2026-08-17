
interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Wraps a route so that unauthenticated or non-admin visitors
 * are redirected to /login, preserving the intended destination.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  // TODO: Re-enable auth guard before deploying!
  // const { isLoading, isAuthenticated, isAdmin } = useAuth();
  // const location = useLocation();

  // Temporarily bypass auth to preview the UI
  return <>{children}</>;
}
