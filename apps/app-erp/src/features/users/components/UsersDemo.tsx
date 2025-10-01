import React, { useState, useMemo, useRef, useCallback, memo } from 'react';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import StatusTag from '../../../components/common/StatusTag';
import TitleDescription from '../../../components/common/TitleDescription';
import Modal from '../../../components/common/Modal';
import styles from './UsersDemo.module.css';

const currentUser = {
  nombre_completo: 'Edison Checa',
  email: 'edison@innovapaz.com',
  rol: 'Administrador',
};

const teamUsers = [
  {
    id: 1,
    nombre_completo: 'Edison Checa',
    email: 'edison@innovapaz.com',
    rol: 'Administrador',
    estado: 'Activo',
    fecha_creacion: '2024-01-15',
  },
  {
    id: 2,
    nombre_completo: 'María González',
    email: 'maria@innovapaz.com',
    rol: 'Vendedor',
    estado: 'Activo',
    fecha_creacion: '2024-02-10',
  },
  {
    id: 3,
    nombre_completo: 'Carlos López',
    email: 'carlos@innovapaz.com',
    rol: 'Encargado de Almacén',
    estado: 'Activo',
    fecha_creacion: '2024-03-05',
  },
  {
    id: 4,
    nombre_completo: 'Ana Martínez',
    email: 'ana@innovapaz.com',
    rol: 'Vendedor',
    estado: 'Pendiente',
    fecha_creacion: '2024-03-20',
  },
];

// Componente memoizado específico para el input del nombre
const ProfileNameInput = memo<{
  value: string;
  onChange: (value: string) => void;
}>(({ value, onChange }) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  return (
    <Input
      label='Nombre Completo'
      value={value}
      onChange={handleChange}
      placeholder='Ingrese su nombre completo'
    />
  );
});

// Componente memoizado para el avatar que no cambia con cada tecla
const ProfileAvatar = memo<{
  avatarImage: string | null;
  userName: string;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  isUploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  triggerFileInput: () => void;
}>(({ avatarImage, userName, onUpload, onRemove, isUploading, fileInputRef, triggerFileInput }) => (
  <div className={styles.avatarBlock}>
    <div className={styles.avatarWrapper}>
      <div className={styles.avatarCircle}>
        {avatarImage ? (
          <img
            src={avatarImage}
            alt='Avatar'
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
        ) : (
          userName.charAt(0) || 'U'
        )}
      </div>
      <div className={styles.avatarMeta}>
        <p className={styles.avatarTitle}>Avatar</p>
        <p className={styles.avatarDesc}>
          {avatarImage
            ? 'Imagen personalizada cargada.'
            : 'Sube una imagen personalizada para tu perfil.'}
        </p>
        <div className={styles.avatarActions}>
          <input
            ref={fileInputRef}
            type='file'
            accept='image/*'
            onChange={onUpload}
            style={{ display: 'none' }}
          />
          <Button
            size='small'
            variant='secondary'
            onClick={triggerFileInput}
            disabled={isUploading}
          >
            {isUploading ? 'Subiendo...' : 'Subir Imagen'}
          </Button>
          <Button
            size='small'
            variant='outline'
            onClick={onRemove}
            disabled={!avatarImage || isUploading}
          >
            Eliminar
          </Button>
        </div>
      </div>
    </div>
    <div className={styles.divider}></div>
  </div>
));

// Componente completamente separado para el perfil con su propio estado
const ProfileSection = memo<{
  onShowPasswordModal: () => void;
}>(({ onShowPasswordModal }) => {
  const [localProfileData, setLocalProfileData] = useState({
    nombre_completo: currentUser.nombre_completo,
    email: currentUser.email,
  });
  const [savedProfileData, setSavedProfileData] = useState({
    nombre_completo: currentUser.nombre_completo,
    email: currentUser.email,
  });
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isProfileDirty = useMemo(() => {
    return localProfileData.nombre_completo.trim() !== savedProfileData.nombre_completo;
  }, [localProfileData, savedProfileData]);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalProfileData((prev) => ({ ...prev, nombre_completo: e.target.value }));
  }, []);

  const handleUpdateProfile = useCallback(() => {
    setSavedProfileData({
      nombre_completo: localProfileData.nombre_completo,
      email: localProfileData.email,
    });
    setSuccessMessage('Información de perfil actualizada exitosamente.');
    setShowSuccessModal(true);
  }, [localProfileData]);

  const handleAvatarUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setSuccessMessage('Por favor selecciona una imagen válida (JPG, PNG, GIF).');
      setShowSuccessModal(true);
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setSuccessMessage('La imagen es muy grande. El tamaño máximo es 5MB.');
      setShowSuccessModal(true);
      return;
    }

    setIsUploadingAvatar(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setTimeout(() => {
        setAvatarImage(result);
        setIsUploadingAvatar(false);
        setSuccessMessage('Avatar actualizado exitosamente.');
        setShowSuccessModal(true);
      }, 1500);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleRemoveAvatar = useCallback(() => {
    setAvatarImage(null);
    setSuccessMessage('Avatar eliminado exitosamente.');
    setShowSuccessModal(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <>
      <div className={styles.profileView}>
        <TitleDescription
          title='Mi Perfil'
          description='Gestiona tu información personal, tu avatar y la seguridad de tu cuenta.'
          titleSize={32}
          descriptionSize={16}
          spacing='0.5rem'
          align='left'
        />
        <div className={styles.profileLayout}>
          <div className={styles.mainColumn}>
            <div className={styles.card}>
              <div className={styles.sectionHeader}>
                <h2>Datos de la Cuenta</h2>
                <span className={styles.sectionHint}>Información visible para tu equipo</span>
              </div>

              <ProfileAvatar
                avatarImage={avatarImage}
                userName={localProfileData.nombre_completo}
                onUpload={handleAvatarUpload}
                onRemove={handleRemoveAvatar}
                isUploading={isUploadingAvatar}
                fileInputRef={fileInputRef}
                triggerFileInput={triggerFileInput}
              />

              <div className={styles.formGrid}>
                <Input
                  label='Nombre Completo'
                  value={localProfileData.nombre_completo}
                  onChange={handleNameChange}
                  placeholder='Ingrese su nombre completo'
                />
                <Input
                  label='Correo Electrónico'
                  type='email'
                  value={localProfileData.email}
                  disabled
                  placeholder='correo@ejemplo.com'
                />
              </div>

              <div className={styles.inlineInfo}>
                <StatusTag
                  text={currentUser.rol}
                  backgroundColor='var(--pri-100)'
                  textColor='var(--pri-800)'
                  width='auto'
                  height={28}
                />
                <span className={styles.mutedText}>Rol asignado por administración</span>
              </div>

              <div className={styles.actionsRow}>
                <Button
                  variant='primary'
                  size='medium'
                  fullWidth
                  disabled={!isProfileDirty || !localProfileData.nombre_completo.trim()}
                  onClick={handleUpdateProfile}
                >
                  Guardar Cambios
                </Button>
              </div>
            </div>
          </div>
          <ProfileSidebar
            savedProfileData={savedProfileData}
            currentUserRole={currentUser.rol}
            onPasswordChange={onShowPasswordModal}
          />
        </div>
      </div>

      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title='Operación Exitosa'
        message={successMessage}
        modalType='success'
        confirmButtonText='Entendido'
      />
    </>
  );
});

// Componentes memoizados FUERA del componente principal

const UsersDemo = () => {
  const [currentView, setCurrentView] = useState('profile');
  const [users, setUsers] = useState(teamUsers);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editUserData, setEditUserData] = useState({
    rol: '',
    estado: '',
  });
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteData, setInviteData] = useState({
    nombre_completo: '',
    email: '',
    rol: '',
  });

  const roleOptions = [
    { value: 'Vendedor', label: 'Vendedor - Gestión de ventas y clientes' },
    { value: 'Encargado de Almacén', label: 'Encargado de Almacén - Gestión de inventario' },
    { value: 'Contador', label: 'Contador - Gestión financiera y reportes' },
  ];

  const isPasswordFormValid = useMemo(() => {
    return (
      passwordData.currentPassword.trim() !== '' &&
      passwordData.newPassword.trim() !== '' &&
      passwordData.confirmPassword.trim() !== '' &&
      passwordData.newPassword.length >= 6 &&
      passwordData.newPassword === passwordData.confirmPassword
    );
  }, [passwordData]);

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { level: 0, label: 'Vacía', color: '#d1d5db' };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    const map = [
      { label: 'Muy débil', color: '#dc2626' },
      { label: 'Débil', color: '#f59e0b' },
      { label: 'Aceptable', color: '#eab308' },
      { label: 'Buena', color: '#10b981' },
      { label: 'Fuerte', color: '#059669' },
      { label: 'Excelente', color: '#047857' },
    ];
    return { level: score, ...map[Math.min(score, 5)] };
  };

  const passwordStrength = getPasswordStrength(passwordData.newPassword);
  const passwordMismatch =
    passwordData.newPassword &&
    passwordData.confirmPassword &&
    passwordData.newPassword !== passwordData.confirmPassword;

  const handleChangePassword = () => {
    setSuccessMessage('Contraseña actualizada exitosamente.');
    setShowSuccessModal(true);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Administrador':
        return { backgroundColor: 'var(--error-100)', textColor: 'var(--error-800)' };
      case 'Vendedor':
        return { backgroundColor: 'var(--success-100)', textColor: 'var(--success-800)' };
      case 'Encargado de Almacén':
        return { backgroundColor: 'var(--warning-100)', textColor: 'var(--warning-800)' };
      case 'Contador':
        return { backgroundColor: 'var(--pri-100)', textColor: 'var(--pri-800)' };
      default:
        return { backgroundColor: 'var(--pri-100)', textColor: 'var(--pri-800)' };
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'Activo':
        return { backgroundColor: 'var(--success-100)', textColor: 'var(--success-800)' };
      case 'Pendiente':
        return { backgroundColor: 'var(--warning-100)', textColor: 'var(--warning-800)' };
      case 'Inactivo':
        return { backgroundColor: 'var(--error-100)', textColor: 'var(--error-800)' };
      default:
        return { backgroundColor: 'var(--pri-100)', textColor: 'var(--pri-800)' };
    }
  };

  const TeamView = () => {
    const statsCount = 4; // Número total de tarjetas de estadísticas
    const getStatsGridClass = () => {
      switch (statsCount) {
        case 1:
          return `${styles.statsGrid} ${styles.singleCard}`;
        case 2:
          return `${styles.statsGrid} ${styles.twoCards}`;
        case 3:
          return `${styles.statsGrid} ${styles.threeCards}`;
        case 4:
          return `${styles.statsGrid} ${styles.fourCards}`;
        default:
          return styles.statsGrid;
      }
    };

    return (
      <div className={styles.teamView}>
        <div className={styles.viewHeader}>
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
              <svg
                className={styles.iconSmall}
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
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

        <div className={getStatsGridClass()}>
          <div className={styles.statsCard}>
            <div className={styles.statsFlex}>
              <div className={`${styles.statsIcon} ${styles.bgBlue}`}>
                <svg
                  className={`${styles.iconMedium} ${styles.iconBlue}`}
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
                  />
                </svg>
              </div>
              <div className={styles.statsContent}>
                <p className={styles.statsLabel}>Total Usuarios</p>
                <p className={styles.statsValue}>{users.length}</p>
                <div className={styles.statsProgress}>
                  <div className={styles.progressBarSmall}>
                    <div
                      className={styles.progressFillBlue}
                      style={{ width: `${(users.length / 10) * 100}%` }}
                    ></div>
                  </div>
                  <span className={styles.progressText}>{users.length} de 10 usuarios</span>
                </div>
                <div className={styles.statsChange}>
                  <span className={styles.changeIcon}>↗</span>
                  <span className={styles.changeText}>+2 este mes</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.statsCard}>
            <div className={styles.statsFlex}>
              <div className={`${styles.statsIcon} ${styles.bgGreen}`}>
                <svg
                  className={`${styles.iconMedium} ${styles.iconGreen}`}
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>
              <div className={styles.statsContent}>
                <p className={styles.statsLabel}>Usuarios Activos</p>
                <p className={styles.statsValue}>
                  {users.filter((u) => u.estado === 'Activo').length}
                </p>
                <div className={styles.statsProgress}>
                  <div className={styles.progressBarSmall}>
                    <div
                      className={styles.progressFillGreen}
                      style={{
                        width: `${(users.filter((u) => u.estado === 'Activo').length / users.length) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className={styles.progressText}>
                    {Math.round(
                      (users.filter((u) => u.estado === 'Activo').length / users.length) * 100
                    )}
                    % del total
                  </span>
                </div>
                <div className={styles.statsChange}>
                  <span className={styles.changeIcon}>✓</span>
                  <span className={styles.changeText}>Excelente actividad</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.statsCard}>
            <div className={styles.statsFlex}>
              <div className={`${styles.statsIcon} ${styles.bgYellow}`}>
                <svg
                  className={`${styles.iconMedium} ${styles.iconYellow}`}
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>
              <div className={styles.statsContent}>
                <p className={styles.statsLabel}>Pendientes</p>
                <p className={styles.statsValue}>
                  {users.filter((u) => u.estado === 'Pendiente').length}
                </p>
                <div className={styles.statsProgress}>
                  <div className={styles.progressBarSmall}>
                    <div
                      className={styles.progressFillYellow}
                      style={{
                        width: `${(users.filter((u) => u.estado === 'Pendiente').length / users.length) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className={styles.progressText}>Esperando confirmación</span>
                </div>
                <div className={styles.statsChange}>
                  <span className={styles.changeIcon}>⏳</span>
                  <span className={styles.changeText}>Revisar invitaciones</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.statsCard}>
            <div className={styles.statsFlex}>
              <div className={`${styles.statsIcon} ${styles.bgPurple}`}>
                <svg
                  className={`${styles.iconMedium} ${styles.iconPurple}`}
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
                  />
                </svg>
              </div>
              <div className={styles.statsContent}>
                <p className={styles.statsLabel}>Roles Únicos</p>
                <p className={styles.statsValue}>3</p>
                <div className={styles.statsProgress}>
                  <div className={styles.rolesList}>
                    <span className={styles.roleChip}>Admin</span>
                    <span className={styles.roleChip}>Vendedor</span>
                    <span className={styles.roleChip}>Almacén</span>
                  </div>
                </div>
                <div className={styles.statsChange}>
                  <span className={styles.changeIcon}>👥</span>
                  <span className={styles.changeText}>Buena distribución</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <div className={styles.tableHeader}>
            <h2 className={styles.tableTitle}>Miembros del Equipo</h2>
          </div>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const roleColors = getRoleColor(user.rol);
                  const statusColors = getStatusColor(user.estado);
                  return (
                    <tr key={user.id}>
                      <td>
                        <div className={styles.userCell}>
                          <div className={styles.avatar}>
                            <span>{user.nombre_completo.charAt(0)}</span>
                          </div>
                          <div>
                            <div className={styles.userName}>{user.nombre_completo}</div>
                            <div className={styles.userEmail}>{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <StatusTag
                          text={user.rol}
                          backgroundColor={roleColors.backgroundColor}
                          textColor={roleColors.textColor}
                          width='auto'
                          height={28}
                        />
                      </td>
                      <td>
                        <StatusTag
                          text={user.estado}
                          backgroundColor={statusColors.backgroundColor}
                          textColor={statusColors.textColor}
                          width='auto'
                          height={28}
                        />
                      </td>
                      <td className={styles.dateCell}>
                        {new Date(user.fecha_creacion).toLocaleDateString('es-ES')}
                      </td>
                      <td>
                        <div className={styles.actionsCell}>
                          <Button
                            variant='outline'
                            size='small'
                            onClick={() => handleEditUser(user)}
                            icon={
                              <svg
                                className={styles.iconSmall}
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                                />
                              </svg>
                            }
                            iconPosition='left'
                          >
                            Editar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setEditUserData({
      rol: user.rol,
      estado: user.estado,
    });
    setShowEditUserModal(true);
  };

  const handleSaveUserChanges = () => {
    if (!selectedUser) return;

    // Actualizar el usuario en la lista
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === selectedUser.id
          ? { ...user, rol: editUserData.rol, estado: editUserData.estado }
          : user
      )
    );

    setSuccessMessage(`Usuario ${selectedUser.nombre_completo} actualizado exitosamente.`);
    setShowSuccessModal(true);
    setShowEditUserModal(false);
    setSelectedUser(null);
  };

  // Agrega función para manejar el submit del formulario de invitación
  const handleInviteUser = () => {
    const newUser = {
      id: users.length + 1,
      nombre_completo: inviteData.nombre_completo,
      email: inviteData.email,
      rol: inviteData.rol,
      estado: 'Pendiente',
      fecha_creacion: new Date().toISOString().split('T')[0],
    };
    setUsers([...users, newUser]);
    setSuccessMessage(`Invitación enviada a ${inviteData.nombre_completo} exitosamente.`);
    setShowSuccessModal(true);
    setInviteData({ nombre_completo: '', email: '', rol: '' });
    setShowInviteModal(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.viewContent}>
        {currentView === 'profile' && (
          <ProfileSection onShowPasswordModal={() => setShowPasswordModal(true)} />
        )}
        {currentView === 'team' && <TeamView />}
      </div>

      {/* Modal de invitación */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title='Invitar Nuevo Miembro'
        modalType='custom'
        showCancelButton={false}
        showConfirmButton={false}
        confirmButtonText=''
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleInviteUser();
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          <Input
            label='Nombre Completo'
            value={inviteData.nombre_completo}
            onChange={(e) => setInviteData({ ...inviteData, nombre_completo: e.target.value })}
            placeholder='Ingrese el nombre completo'
            required
          />
          <Input
            label='Correo Electrónico'
            type='email'
            value={inviteData.email}
            onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
            placeholder='correo@ejemplo.com'
            required
          />
          <Select
            label='Rol Asignado'
            value={inviteData.rol}
            onChange={(e) => setInviteData({ ...inviteData, rol: e.target.value })}
            options={roleOptions}
            placeholder='Seleccione un rol...'
            required
          />
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <Button
              type='submit'
              variant='primary'
              size='medium'
              disabled={
                !inviteData.nombre_completo.trim() ||
                !inviteData.email.trim() ||
                !inviteData.rol.trim()
              }
            >
              Enviar Invitación
            </Button>
            <Button
              type='button'
              variant='secondary'
              size='medium'
              onClick={() => setShowInviteModal(false)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title='Operación Exitosa'
        message={successMessage}
        modalType='success'
        confirmButtonText='Entendido'
      />

      <Modal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        }}
        title='Cambiar Contraseña'
        modalType='custom'
        showCancelButton={false}
        showConfirmButton={false}
        confirmButtonText=''
      >
        <div className={styles.passwordModalContent}>
          <p className={styles.passwordModalDescription}>
            Mantén tu cuenta protegida actualizando tu contraseña regularmente.
          </p>

          <div className={styles.passwordForm}>
            <Input
              label='Contraseña Actual'
              type='password'
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, currentPassword: e.target.value })
              }
              placeholder='Ingresa tu contraseña actual'
            />

            <div>
              <Input
                label='Nueva Contraseña'
                type='password'
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder='Mínimo 6 caracteres'
              />
              <div className={styles.strengthBar}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className={styles.strengthSegment}
                    style={{
                      background: passwordStrength.level > i ? passwordStrength.color : '#e5e7eb',
                    }}
                  ></span>
                ))}
              </div>
              <p className={styles.strengthLabel}>
                Fuerza:{' '}
                <strong style={{ color: passwordStrength.color }}>{passwordStrength.label}</strong>
              </p>
            </div>

            <Input
              label='Confirmar Nueva Contraseña'
              type='password'
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, confirmPassword: e.target.value })
              }
              placeholder='Repite la nueva contraseña'
            />

            {passwordMismatch && <p className={styles.errorText}>Las contraseñas no coinciden.</p>}

            <div className={styles.passwordModalActions}>
              <Button
                variant='accent'
                size='medium'
                fullWidth
                disabled={!isPasswordFormValid}
                onClick={() => {
                  handleChangePassword();
                  setShowPasswordModal(false);
                }}
              >
                Actualizar Contraseña
              </Button>
              <Button
                variant='secondary'
                size='medium'
                fullWidth
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal para editar usuario */}
      <Modal
        isOpen={showEditUserModal}
        onClose={() => {
          setShowEditUserModal(false);
          setSelectedUser(null);
        }}
        title={`Editar Usuario: ${selectedUser?.nombre_completo}`}
        modalType='custom'
        showCancelButton={false}
        showConfirmButton={false}
        confirmButtonText=''
      >
        <div className={styles.editUserModalContent}>
          <p className={styles.editUserDescription}>
            Modifica el rol y estado de {selectedUser?.nombre_completo}.
          </p>

          <div className={styles.editUserForm}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Rol</label>
              <select
                className={styles.formSelect}
                value={editUserData.rol}
                onChange={(e) => setEditUserData({ ...editUserData, rol: e.target.value })}
              >
                <option value='Administrador'>Administrador</option>
                <option value='Vendedor'>Vendedor</option>
                <option value='Encargado de Almacén'>Encargado de Almacén</option>
                <option value='Contador'>Contador</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Estado</label>
              <select
                className={styles.formSelect}
                value={editUserData.estado}
                onChange={(e) => setEditUserData({ ...editUserData, estado: e.target.value })}
              >
                <option value='Activo'>Activo</option>
                <option value='Inactivo'>Inactivo</option>
                <option value='Pendiente'>Pendiente</option>
              </select>
            </div>

            <div className={styles.editUserModalActions}>
              <Button variant='primary' size='medium' fullWidth onClick={handleSaveUserChanges}>
                Guardar Cambios
              </Button>
              <Button
                variant='secondary'
                size='medium'
                fullWidth
                onClick={() => {
                  setShowEditUserModal(false);
                  setSelectedUser(null);
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Componente separado y memoizado para el sidebar
const ProfileSidebar = React.memo<{
  savedProfileData: { nombre_completo: string; email: string };
  currentUserRole: string;
  onPasswordChange: () => void;
}>(({ savedProfileData, currentUserRole, onPasswordChange }) => (
  <aside className={styles.sideColumn}>
    <div className={styles.card}>
      <div className={styles.sectionHeaderSmall}>
        <h3>Resumen de la Cuenta</h3>
      </div>
      <ul className={styles.metaList}>
        <li>
          <span className={styles.metaLabel}>Nombre</span>
          <span className={styles.metaValue}>{savedProfileData.nombre_completo}</span>
        </li>
        <li>
          <span className={styles.metaLabel}>Correo</span>
          <span className={styles.metaValue}>{savedProfileData.email}</span>
        </li>
        <li>
          <span className={styles.metaLabel}>Rol</span>
          <span className={styles.metaValue}>{currentUserRole}</span>
        </li>
        <li>
          <span className={styles.metaLabel}>Estado</span>
          <span className={styles.metaValue}>
            <StatusTag
              text='Activo'
              backgroundColor='var(--success-100)'
              textColor='var(--success-800)'
              width='auto'
              height={24}
            />
          </span>
        </li>
      </ul>

      <div className={styles.passwordActionRow}>
        <Button
          variant='accent'
          size='medium'
          fullWidth
          onClick={onPasswordChange}
          icon={
            <svg className={styles.iconSmall} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
              />
            </svg>
          }
          iconPosition='left'
        >
          Cambiar Contraseña
        </Button>
      </div>
    </div>
  </aside>
));

export default UsersDemo;
