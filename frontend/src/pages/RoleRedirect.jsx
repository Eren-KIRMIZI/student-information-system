import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleMap = {
  ADMIN: '/admin/dashboard',
  ACADEMICIAN: '/academician/dashboard',
  STUDENT: '/student/dashboard',
};

const RoleRedirect = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={roleMap[user.role] || '/login'} replace />;
};

export default RoleRedirect;
