import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const PrivateRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, isDevMode, role } = useAuth();
  
  if (isDevMode) {
    return children;
  }else{
    console.log("authentication is ", isAuthenticated);
    return isAuthenticated ? (allowedRoles.includes(role) ? children : <Navigate to="/home" replace /> ): <Navigate to="/" replace />;
  };

};

export default PrivateRoute;
