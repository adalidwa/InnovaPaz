import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ProfilePage from '../../features/users/pages/ProfilePage';
import CompanySettingsPage from '../../features/users/pages/CompanySettingsPage';
import LoginPage from '../../features/users/pages/LoginPage';

const UserRoutes: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Si estamos en /configuracion/empresa pero no hay hash, redirigir a #general
    if (location.pathname === '/configuracion/empresa' && !location.hash) {
      window.history.replaceState(null, '', '/configuracion/empresa#general');
    }
  }, [location]);

  return (
    <Routes>
      <Route path='login' element={<LoginPage />} />
      <Route path='empresa' element={<CompanySettingsPage />} />
      <Route path='perfil' element={<ProfilePage />} />
      <Route path='' element={<Navigate to='empresa#general' replace />} />
    </Routes>
  );
};

export default UserRoutes;
