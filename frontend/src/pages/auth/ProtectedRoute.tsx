import { useLocation, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles: string[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, token } = useAuth();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Safely check if the user role has fully loaded yet
  if (!user || !user.role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-50/50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-900"></div>
      </div>
    );
  }

  // If they don't have the required role, send them to their designated panel
  if (!allowedRoles.includes(user.role)) {
    if (user.role === 'superadmin') {
      return <Navigate to="/dashboard/admin" replace />;
    }
    if (user.role === 'hostelOwner') {
      return <Navigate to="/dashboard/owner" replace />;
    }
    // Default fallback for students or unauthorized access
    return <Navigate to="/dashboard/student" replace />;
  }

  return <Outlet />;
};