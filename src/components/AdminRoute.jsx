import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = () => {
  const { user, isAuthenticated } = useAuth();

  // If no user is authenticated, redirect to home page
  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  // If user exists but is not an admin, redirect to unauthorized page
  if (user.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  // If user is an admin, render the child routes
  return <Outlet />;
};

export default AdminRoute;
