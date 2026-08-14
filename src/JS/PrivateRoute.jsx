import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { isTokenExpired } from "../auth/authStore";

const PrivateRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, isDevMode, role } = useAuth();

  if (isDevMode) {
    return children;
  }
  // token 過期即視為未登入：在算繪受保護頁面「之前」就導回登入頁，
  // 避免使用者先看到 /device 再被後端 401 踢出。
  const authed = isAuthenticated && !isTokenExpired();
  if (authed) {
    return allowedRoles.includes(role) || allowedRoles.includes("all") ? (
      children
    ) : (
      <Navigate to="/home" replace />
    );
  } else {
    return <Navigate to="/" replace />;
  }
};

export default PrivateRoute;
