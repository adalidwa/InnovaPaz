import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProfilePage, TeamManagementPage } from '../../features/users';
import {
  currentUser,
  teamUsers,
  availableRoles,
  planInfo,
} from '../../features/users/config/mockData';

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

  const handleEditRole = async (userId: number, newRole: string) => {
    console.log(`Cambiando rol del usuario ${userId} a:`, newRole);
    // Aquí iría la lógica real de cambio de rol
  };

  const handleDeleteUser = async (userId: number) => {
    console.log('Eliminando usuario:', userId);
    // Aquí iría la lógica real de eliminación
  };

  const handleInviteUser = async (inviteData: any) => {
    console.log('Invitando usuario:', inviteData);
    // Aquí iría la lógica real de invitación
  };

  const handleNavigateToInvite = () => {
    // En la aplicación real, esto usaría useNavigate de React Router
    console.log('Navegando a invitar usuario');
  };

  const handleCancel = () => {
    // En la aplicación real, esto usaría useNavigate de React Router
    console.log('Cancelando y volviendo al equipo');
  };

  // Simulación de verificación de permisos
  const isAdmin = currentUser.rol === 'Administrador';

  return (
    <Routes>
      {/* Perfil del usuario - Accesible para todos */}
      <Route
        path='perfil'
        element={
          <ProfilePage
            currentUser={currentUser}
            onUpdateProfile={handleUpdateProfile}
            onChangePassword={handleChangePassword}
          />
        }
      />

      {/* Gestión de equipo - Solo administradores */}
      <Route
        path='equipo'
        element={
          isAdmin ? (
            <TeamManagementPage
              users={teamUsers}
              availableRoles={availableRoles}
              onEditRole={handleEditRole}
              onDeleteUser={handleDeleteUser}
            />
          ) : (
            <Navigate to='/configuracion/perfil' replace />
          )
        }
      />

      {/* Redirección por defecto */}
      <Route path='' element={<Navigate to='perfil' replace />} />
    </Routes>
  );
};

export default UserRoutes;
