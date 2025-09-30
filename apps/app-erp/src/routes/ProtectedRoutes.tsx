import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRoutesProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
}

const ProtectedRoutes: React.FC<ProtectedRoutesProps> = ({ children, isAuthenticated }) => {
  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoutes;
