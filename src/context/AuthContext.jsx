import { trackEvent } from '@/lib/analytics';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useLocation } from 'react-router-dom';

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

const previewAuth = Object.freeze({
  user: null,
  token: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

// Do not mount the storage-backed provider on previews, even for an invalid token.
// Switching routes mounts the appropriate provider afresh without changing the session.
export const AuthProvider = ({ children }) => {
  const { pathname } = useLocation();
  return pathname.startsWith('/preview/')
    ? <AuthContext.Provider value={previewAuth}>{children}</AuthContext.Provider>
    : <SessionAuthProvider>{children}</SessionAuthProvider>;
};

const SessionAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    // Initialize token from localStorage (guarded for SSG / server-side render)
    if (typeof window === 'undefined') return null;
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
    trackEvent('logout', { method: 'google' });
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
