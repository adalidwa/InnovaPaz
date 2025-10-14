import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProfilePage from '../../features/users/pages/ProfilePage';
import CompanySettingsPage from '../../features/users/pages/CompanySettingsPage';
import LoginPage from '../../features/users/pages/LoginPage';

const UserRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path='login' element={<LoginPage />} />
      <Route path='empresa' element={<CompanySettingsPage />} />
      <Route path='perfil' element={<ProfilePage />} />
      <Route path='' element={<Navigate to='empresa' replace />} />
    </Routes>
  );
};

export default UserRoutes;
