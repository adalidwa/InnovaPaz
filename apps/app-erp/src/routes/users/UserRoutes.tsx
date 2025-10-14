import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProfilePage from '../../features/users/pages/ProfilePage';
import CompanySettingsPage from '../../features/users/pages/CompanySettingsPage';

/**
 * Rutas del módulo de usuarios
 *
 * Rutas disponibles:
 * - /configuracion/perfil - Página de perfil del usuario
 * - /configuracion/equipo - Gestión de equipo (solo administradores)
 * - /configuracion/invitar - Invitar nuevos usuarios (solo administradores)
 */
const UserRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Página de Configuración Empresa (Tabs Internas) */}
      <Route path='empresa' element={<CompanySettingsPage />} />

      {/* Perfil del usuario - Accesible para todos */}
      <Route path='perfil' element={<ProfilePage />} />

      {/* Redirección por defecto ahora a empresa */}
      <Route path='' element={<Navigate to='empresa' replace />} />
    </Routes>
  );
};

export default UserRoutes;
