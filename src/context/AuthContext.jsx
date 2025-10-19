import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

// Create the AuthContext
const AuthContext = createContext(null);

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    // Initialize token from localStorage
    return localStorage.getItem('authToken') || null;
  });

  // useEffect to decode token and set user when token changes
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (error) {
        console.error('Failed to decode token:', error);
        // If token is invalid, clear it
        setToken(null);
        setUser(null);
        localStorage.removeItem('authToken');
      }
    } else {
      setUser(null);
    }
  }, [token]);

  // Login function
  const login = (newToken, userData) => {
    setToken(newToken);
    localStorage.setItem('authToken', newToken);
    if (userData) {
      setUser(userData);
    }
  };

  // Logout function
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
  };

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
