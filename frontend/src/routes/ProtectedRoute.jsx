import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Sayfa yüklenirken gösterilecek basit skeleton
const PageSkeleton = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
    <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
  </div>
);

/**
 * Rol bazlı rota koruması.
 * @param {{ allowedRoles?: string[] }} props
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <PageSkeleton />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles) {
    const roleName = typeof user.role === 'object' ? user.role?.name : user.role;
    if (!allowedRoles.includes(roleName)) {
      return <Navigate to="/403" replace />;
    }
  }
  return <Outlet />;
};

export default ProtectedRoute;
