import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/auth/login" replace />;
  }

  if (adminOnly && userRole !== 'admin' && userRole !== 'satpam') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
