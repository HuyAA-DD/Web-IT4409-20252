import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, getRole } from '../Utils/Auth';

const RequireAuth = ({ children, requiredRole }) => {
  const location = useLocation();
  if (!isAuthenticated() || (requiredRole && getRole() !== requiredRole)) {
    return <Navigate to="/auth/login&register" state={{ from: location }} replace />;
  }

  return children;
};

export default RequireAuth;