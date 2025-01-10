import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const PrivateRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, isDevMode, role } = useAuth();
  
  if (isDevMode) {
    return children;
  }
  if(isAuthenticated){
    return (allowedRoles.includes(role)|| allowedRoles.includes("all")? children : <Navigate to="/home" replace /> )
  }else{
    return <Navigate to="/" replace />;
  }
};

export default PrivateRoute;
