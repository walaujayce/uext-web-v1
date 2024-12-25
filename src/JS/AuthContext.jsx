import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const isDevMode = false;
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Initialize from localStorage
    return localStorage.getItem("isAuthenticated") === "true";
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Check session storage for authentication status on load
    const authStatus = localStorage.getItem("isAuthenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const login = () => {
    setIsAuthenticated(true);
    localStorage.setItem("isAuthenticated", "true"); // Store login status
    console.log(localStorage.getItem("isAuthenticated"));
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated"); // Remove login status
    navigate("/"); // Redirect to login
  };
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "isAuthenticated") {
        const authStatus = event.newValue === "true";
        setIsAuthenticated(authStatus);

        if (!authStatus) {
          navigate("/"); // Redirect to login if logged out in another tab
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [navigate]);
  
  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isDevMode }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
