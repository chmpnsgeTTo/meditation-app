import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;