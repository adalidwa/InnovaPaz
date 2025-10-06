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
  // Simulación de funciones (en la aplicación real vendrían de hooks/services)
  const handleUpdateProfile = async (profileData: any) => {
    console.log('Actualizando perfil:', profileData);
    // Aquí iría la lógica real de actualización
  };

  const handleChangePassword = async (passwordData: any) => {
    console.log('Cambiando contraseña:', passwordData);
    // Aquí iría la lógica real de cambio de contraseña
  };

  return (
    <Routes>
      {/* Página de Configuración Empresa (Tabs Internas) */}
      <Route path='empresa' element={<CompanySettingsPage />} />

      {/* Perfil del usuario - Accesible para todos */}
      <Route
        path='perfil'
        element={
          <ProfilePage
            onUpdateProfile={handleUpdateProfile}
            onChangePassword={handleChangePassword}
          />
        }
      />

      {/* Redirección por defecto ahora a empresa */}
      <Route path='' element={<Navigate to='empresa' replace />} />
    </Routes>
  );
};

export default UserRoutes;
