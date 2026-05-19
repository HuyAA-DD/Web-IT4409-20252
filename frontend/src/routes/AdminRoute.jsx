import { Navigate, Outlet } from "react-router-dom";

import { getAccessToken, getAuthUser } from "../utils/authStorage";

function isAdminUser(user) {
  if (!user) {
    return false;
  }

  if (user.role === "ADMIN" || user.role === "ROLE_ADMIN") {
    return true;
  }

  if (user.authority === "ADMIN" || user.authority === "ROLE_ADMIN") {
    return true;
  }

  if (Array.isArray(user.roles)) {
    return user.roles.some(
      (role) => role === "ADMIN" || role === "ROLE_ADMIN"
    );
  }

  if (Array.isArray(user.authorities)) {
    return user.authorities.some((authority) => {
      if (typeof authority === "string") {
        return authority === "ADMIN" || authority === "ROLE_ADMIN";
      }

      return (
        authority.authority === "ADMIN" ||
        authority.authority === "ROLE_ADMIN"
      );
    });
  }

  return false;
}

function AdminRoute() {
  const token = getAccessToken();
  const authUser = getAuthUser();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdminUser(authUser)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;