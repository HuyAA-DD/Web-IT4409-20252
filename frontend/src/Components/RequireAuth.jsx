import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "../Utils/Auth";

const RequireAuth = ({ children }) => {
  const location = useLocation();

  if (!isAuthenticated()) {
    return (
      <Navigate
        to="/auth/login-register"
        replace
        state={{ from: location }}
      />
    );
  }

  return children;
};

export default RequireAuth;