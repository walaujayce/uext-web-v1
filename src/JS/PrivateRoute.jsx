import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isDevMode  } = useAuth();
  if (isDevMode) {
    return children;
  }else{
    console.log("authentication is ", isAuthenticated);
    return isAuthenticated ? children : <Navigate to="/" replace />;
  }
};

export default PrivateRoute;
