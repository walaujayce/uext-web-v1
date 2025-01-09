import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const isDevMode = false;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [role, setRole] = useState(() => {
    // Load user from localStorage if available
    const storedUserRole = localStorage.getItem("role");
    return storedUserRole ? JSON.parse(storedUserRole) : null;
  });

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

  const login = (role) => {
    setRole(role);
    localStorage.setItem("role", JSON.stringify(role)); // Save user to localStorage
    console.log("role is ", role);

    setIsAuthenticated(true);
    localStorage.setItem("isAuthenticated", "true"); // Store login status
    console.log(localStorage.getItem("isAuthenticated"));
  };

  const logout = () => {
    setRole(null);
    localStorage.removeItem("role"); // Clear user from localStorage

    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated"); // Remove login status
    navigate("/"); // Redirect to login

    localStorage.removeItem("username"); // Clear user from localStorage

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
    <AuthContext.Provider
      value={{ isAuthenticated, login, logout, isDevMode, role}}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
