import { useState } from 'react';
import UserList from '../components/UserList';
import UserRoleSelector from '../components/UserRoleSelector';
import UserForm from '../components/UserForm';
import Button from '../../../components/common/Button';
import TitleDescription from '../../../components/common/TitleDescription';
import Modal from '../../../components/common/Modal';

import styles from './TeamManagementPage.module.css';

interface RoleItem {
  id: string;
  name: string;
  description?: string;
}
interface UserItem {
  id: string;
  nombre_completo: string;
  email: string;
  rol: string;
  estado: string;
  fecha_creacion?: string;
}

interface TeamManagementPageProps {
  users: UserItem[];
  availableRoles: RoleItem[];
  onEditRole: (userId: string, newRole: string, newStatus: string) => void | Promise<void>;
  onInviteUser?: (data: {
    email: string;
    rol: string;
    nombre_completo: string;
  }) => void | Promise<void>;
  loading?: boolean;
}

const TeamManagementPage: React.FC<TeamManagementPageProps> = ({
  users,
  availableRoles,
  onEditRole,
  onInviteUser,
  loading = false,
}) => {
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const handleEditUser = (user: UserItem) => {
    setSelectedUser(user);
    // mantener id de rol original si coincide con availableRoles, si no mapear
    const roleObj = availableRoles.find((r) => r.name === user.rol || r.id === user.rol);
    setSelectedRole(roleObj ? roleObj.id : user.rol.toLowerCase().replace(/\s+/g, '_'));
    setSelectedStatus(user.estado || 'Activo');
    setShowRoleModal(true);
  };

  const handleSaveRole = () => {
    if (selectedUser) {
      onEditRole(selectedUser.id, selectedRole, selectedStatus);
    }
    setShowRoleModal(false);
    setSelectedUser(null);
    setSelectedRole('');
    setSelectedStatus('');
  };

  const closeRoleModal = () => {
    setShowRoleModal(false);
    setSelectedUser(null);
    setSelectedRole('');
  };

  // Flujo de borrado eliminado; reintroducir si se requiere en el futuro.

  return (
    <div className={styles.teamWrapper}>
      {/* Header */}
      <div className={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <TitleDescription
            title='Gestión de Equipo'
            description='Administra los miembros de tu equipo, sus roles y permisos.'
            titleSize={32}
            descriptionSize={16}
            spacing='0.5rem'
            align='left'
          />

          <Button
            variant='primary'
            size='medium'
            onClick={() => setShowInviteModal(true)}
            icon={
              <svg width={20} height={20} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 4v16m8-8H4'
                />
              </svg>
            }
            iconPosition='left'
          >
            Invitar Nuevo Miembro
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className={styles.stats}>
        <div className={styles.statsCard}>
          <div className={styles.statsIcon + ' ' + styles.bgBlue}>
            <svg width={20} height={20} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
              />
            </svg>
          </div>
          <div>
            <p className={styles.statsLabel}>Total Usuarios</p>
            <p className={styles.statsValue}>{users?.length || 0}</p>
          </div>
        </div>

        <div className={styles.statsCard}>
          <div className={styles.statsIcon + ' ' + styles.bgGreen}>
            <svg width={20} height={20} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          </div>
          <div>
            <p className={styles.statsLabel}>Usuarios Activos</p>
            <p className={styles.statsValue}>
              {users?.filter((u) => u.estado === 'Activo').length || 0}
            </p>
          </div>
        </div>

        <div className={styles.statsCard}>
          <div className={styles.statsIcon + ' ' + styles.bgYellow}>
            <svg width={20} height={20} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          </div>
          <div>
            <p className={styles.statsLabel}>Invitaciones Pendientes</p>
            <p className={styles.statsValue}>
              {users?.filter((u) => u.estado === 'Pendiente').length || 0}
            </p>
          </div>
        </div>

        <div className={styles.statsCard}>
          <div className={styles.statsIcon + ' ' + styles.bgPurple}>
            <svg width={20} height={20} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
              />
            </svg>
          </div>
          <div>
            <p className={styles.statsLabel}>Roles Únicos</p>
            <p className={styles.statsValue}>{new Set(users?.map((u) => u.rol)).size || 0}</p>
          </div>
        </div>
      </div>

      {/* Lista de Usuarios */}
      <div className={styles.tableWrapper}>
        <div className={styles.tableHeader}>
          <TitleDescription
            title='Miembros del Equipo'
            description='Gestiona los roles y permisos de cada miembro.'
            titleSize={18}
            descriptionSize={14}
            spacing='0.25rem'
            align='left'
          />
        </div>
        <div className={styles.tableContent}>
          <UserList users={users} onEditUser={handleEditUser} loading={loading} />
        </div>
      </div>

      {/* Modal Editar Usuario */}
      <Modal
        isOpen={showRoleModal}
        onClose={closeRoleModal}
        title={`Editar Usuario: ${selectedUser?.nombre_completo || ''}`}
        message='' /* usamos children personalizados */
        modalType='info'
        showCancelButton={true}
        confirmButtonText='Guardar Cambios'
        cancelButtonText='Cancelar'
        onConfirm={handleSaveRole}
        onCancel={closeRoleModal}
      >
        {selectedUser && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              padding: '.25rem .25rem .5rem',
            }}
          >
            <UserRoleSelector
              selectedRole={selectedRole}
              onRoleChange={setSelectedRole}
              availableRoles={availableRoles as any}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.35rem' }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--pri-700)' }}>
                Estado
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{
                  padding: '.55rem .6rem',
                  border: '1px solid var(--pri-200)',
                  borderRadius: 8,
                  background: 'var(--white)',
                  font: 'var(--font-13)',
                }}
              >
                <option value='Activo'>Activo</option>
                <option value='Inactivo'>Inactivo</option>
                <option value='Pendiente'>Pendiente</option>
              </select>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Invitar Usuario */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title='Invitar Nuevo Miembro'
        message='' /* se ignora porque usamos children */
        modalType='info'
        showCancelButton={false}
        showConfirmButton={false}
        size='large'
      >
        <div style={{ padding: '.25rem .25rem 1rem' }}>
          <UserForm
            mode='invite'
            availableRoles={availableRoles.map((r) => r.name || r.id)}
            onSubmit={async (data) => {
              if (onInviteUser)
                await onInviteUser({
                  email: data.email,
                  rol: data.rol,
                  nombre_completo: data.nombre_completo,
                });
              setShowInviteModal(false);
            }}
            onCancel={() => setShowInviteModal(false)}
          />
        </div>
      </Modal>
    </div>
  );
};

export default TeamManagementPage;
