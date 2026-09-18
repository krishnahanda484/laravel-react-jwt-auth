import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Keeps already-authenticated users off the login/register screens.
export default function GuestRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="page-status">Loading...</div>;
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
