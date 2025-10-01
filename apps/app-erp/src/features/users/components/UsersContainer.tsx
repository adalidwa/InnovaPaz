import React, { useState } from 'react';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import styles from './UsersContainer.module.css';
import ProfilePage from '../pages/ProfilePage';
import TeamManagementPage from '../pages/TeamManagementPage';
import InviteUserPage from '../pages/InviteUserPage';
import { currentUser, teamUsers, availableRoles, planInfo } from '../config/mockData';

interface ProfileData {
  nombre_completo: string;
  email: string;
}

interface PasswordData {
  oldPassword: string;
  newPassword: string;
}

interface InviteData {
  nombre_completo: string;
  email: string;
  rol: string;
}

const UsersContainer = () => {
  const [currentView, setCurrentView] = useState('profile');
  const [users, setUsers] = useState(teamUsers);
  const [loading, setLoading] = useState(false);

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, user: null });
  const [roleChangeModal, setRoleChangeModal] = useState({
    isOpen: false,
    user: null,
    newRole: '',
  });
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });

  const handleUpdateProfile = async (profileData: ProfileData) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('Actualizando perfil:', profileData);
    setLoading(false);
  };

  const handleChangePassword = async (passwordData: PasswordData) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log('Cambiando contraseña:', passwordData);
    setLoading(false);
  };

  const handleEditRoleRequest = (user, newRole) => {
    setRoleChangeModal({ isOpen: true, user, newRole });
  };

  const confirmRoleChange = async () => {
    const { user, newRole } = roleChangeModal;
    setRoleChangeModal({ isOpen: false, user: null, newRole: '' });

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    setUsers((prevUsers) => prevUsers.map((u) => (u.id === user.id ? { ...u, rol: newRole } : u)));

    setSuccessModal({
      isOpen: true,
      message: `El rol de ${user.nombre_completo} ha sido cambiado a ${newRole} exitosamente.`,
    });

    setLoading(false);
  };

  const handleDeleteUserRequest = (user) => {
    setDeleteModal({ isOpen: true, user });
  };

  const confirmDeleteUser = async () => {
    const { user } = deleteModal;
    setDeleteModal({ isOpen: false, user: null });

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setUsers((prevUsers) => prevUsers.filter((u) => u.id !== user.id));

    setSuccessModal({
      isOpen: true,
      message: `${user.nombre_completo} ha sido eliminado del equipo exitosamente.`,
    });

    setLoading(false);
  };

  const handleInviteUser = async (inviteData: InviteData) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const newUser = {
      id: users.length + 1,
      nombre_completo: inviteData.nombre_completo,
      email: inviteData.email,
      rol: inviteData.rol,
      empresa_id: 1,
      fecha_creacion: new Date().toISOString().split('T')[0],
      avatar: null,
      estado: 'Pendiente',
    };

    setUsers((prevUsers) => [...prevUsers, newUser]);

    setSuccessModal({
      isOpen: true,
      message: `Invitación enviada a ${inviteData.nombre_completo} exitosamente.`,
    });

    setCurrentView('team');
    setLoading(false);
  };

  const handleCancel = () => {
    setCurrentView('team');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'profile':
        return (
          <ProfilePage
            currentUser={currentUser}
            onUpdateProfile={handleUpdateProfile}
            onChangePassword={handleChangePassword}
          />
        );

      case 'team':
        return (
          <TeamManagementPage
            users={users}
            availableRoles={availableRoles}
            onEditRole={handleEditRoleRequest}
            onDeleteUser={handleDeleteUserRequest}
            onNavigateToInvite={handleNavigateToInvite}
            loading={loading}
          />
        );

      case 'invite':
        return (
          <InviteUserPage
            availableRoles={availableRoles}
            planInfo={{
              ...planInfo,
              currentUsers: users.length,
            }}
            onInviteUser={handleInviteUser}
            onCancel={handleCancel}
            loading={loading}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.navbar}>
        <div className={styles.navbarInner}>
          <Button
            variant={currentView === 'profile' ? 'primary' : 'secondary'}
            size='medium'
            onClick={() => setCurrentView('profile')}
          >
            Mi Perfil
          </Button>
          <Button
            variant={currentView === 'team' ? 'primary' : 'secondary'}
            size='medium'
            onClick={() => setCurrentView('team')}
          >
            Gestión de Equipo
          </Button>
          <Button
            variant={currentView === 'invite' ? 'primary' : 'secondary'}
            size='medium'
            onClick={() => setCurrentView('invite')}
          >
            Invitar Usuario
          </Button>
        </div>
      </div>

      {renderCurrentView()}

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, user: null })}
        title='Eliminar Usuario'
        message={`¿Estás seguro de que quieres eliminar a ${deleteModal.user?.nombre_completo}? Esta acción no se puede deshacer.`}
        modalType='error'
        confirmButtonText='Eliminar Usuario'
        showCancelButton={true}
        cancelButtonText='Cancelar'
        onConfirm={confirmDeleteUser}
        onCancel={() => setDeleteModal({ isOpen: false, user: null })}
      />

      <Modal
        isOpen={roleChangeModal.isOpen}
        onClose={() => setRoleChangeModal({ isOpen: false, user: null, newRole: '' })}
        title='Cambiar Rol de Usuario'
        message={`¿Confirmas cambiar el rol de ${roleChangeModal.user?.nombre_completo} a ${roleChangeModal.newRole}?`}
        modalType='warning'
        confirmButtonText='Cambiar Rol'
        showCancelButton={true}
        cancelButtonText='Cancelar'
        onConfirm={confirmRoleChange}
        onCancel={() => setRoleChangeModal({ isOpen: false, user: null, newRole: '' })}
      />

      <Modal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, message: '' })}
        title='Operación Exitosa'
        message={successModal.message}
        modalType='success'
        confirmButtonText='Entendido'
      />
    </div>
  );
};

export default UsersContainer;
