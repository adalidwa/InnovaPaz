import { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import StatusTag from '../../../components/common/StatusTag';
import TitleDescription from '../../../components/common/TitleDescription';
import Modal from '../../../components/common/Modal';
import styles from './ProfilePage.module.css';
import { planInfo, type User } from '../config/mockData';

interface ProfilePageProps {
  currentUser: User;
  onUpdateProfile: (data: { nombre_completo: string }) => Promise<void> | void;
  onChangePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<void> | void;
}

interface PasswordState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

const ProfilePage: React.FC<ProfilePageProps> = ({
  currentUser,
  onUpdateProfile,
  onChangePassword,
}) => {
  // Extendemos datos de empresa de forma local (no presentes aún en tipo User base)
  const [profileData, setProfileData] = useState({
    nombre_completo: currentUser?.nombre_completo || '',
    email: currentUser?.email || '',
    rol: currentUser?.rol || '',
    empresa_nombre: 'Ferretería Innovapaz',
    empresa_tipo: 'Retail / Ferretería',
  });

  const [passwordData, setPasswordData] = useState<PasswordState>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState({
    profile: false,
    password: false,
  });

  const [errors, setErrors] = useState<PasswordErrors>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

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

  const handleProfileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar errores
    if ((errors as any)[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading((prev) => ({ ...prev, profile: true }));

    try {
      await onUpdateProfile({
        nombre_completo: profileData.nombre_completo,
      });
      setSuccessMessage('Perfil actualizado correctamente');
      setShowSuccessModal(true);
    } catch (error) {
      setSuccessMessage('Error al actualizar el perfil');
      setShowSuccessModal(true);
    } finally {
      setLoading((prev) => ({ ...prev, profile: false }));
    }
  };

  const validatePasswordForm = () => {
    const newErrors: PasswordErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'La contraseña actual es requerida';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'La nueva contraseña es requerida';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validatePasswordForm()) return;

    setLoading((prev) => ({ ...prev, password: true }));

    try {
      await onChangePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      // Limpiar formulario
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      setSuccessMessage('Contraseña actualizada correctamente');
      setShowSuccessModal(true);
    } catch (error) {
      setSuccessMessage('Error al cambiar la contraseña');
      setShowSuccessModal(true);
    } finally {
      setLoading((prev) => ({ ...prev, password: false }));
    }
  };

  const isPasswordFormValid = () => {
    return (
      passwordData.currentPassword &&
      passwordData.newPassword &&
      passwordData.confirmPassword &&
      passwordData.newPassword === passwordData.confirmPassword &&
      passwordData.newPassword.length >= 6
    );
  };

  const roleColors = getRoleColor(profileData.rol);

  return (
    <div className={styles.profileWrapper}>
      {/* Header */}
      <div className={styles.header}>
        <TitleDescription
          title='Mi Perfil'
          description='Gestiona tu información personal y configuración de seguridad.'
          titleSize={32}
          descriptionSize={16}
          spacing='0.5rem'
          align='left'
        />
      </div>

      <div className={styles.sections}>
        {/* Datos personales a la izquierda */}
        <form onSubmit={handleProfileSubmit} className={styles.card}>
          <h2 className={styles.cardTitle}>
            Datos de la cuenta <span className={styles.inlineBadge}>Perfil</span>
          </h2>
          <p className={styles.subtle}>
            Información básica y atributos de tu usuario dentro del sistema.
          </p>
          <hr className={styles.divider} />
          <div className={styles.fieldsetGrid}>
            <Input
              label='Nombre Completo'
              name='nombre_completo'
              value={profileData.nombre_completo}
              onChange={handleProfileChange}
              disabled={loading.profile}
              placeholder='Ingrese su nombre completo'
            />
            <Input
              label='Correo Electrónico'
              type='email'
              value={profileData.email}
              disabled
              placeholder='correo@ejemplo.com'
            />
            <div>
              <label
                style={{ display: 'block', fontWeight: 500, color: '#374151', marginBottom: 6 }}
              >
                Rol Asignado
              </label>
              <StatusTag
                text={profileData.rol}
                backgroundColor={roleColors.backgroundColor}
                textColor={roleColors.textColor}
                width='auto'
                height={32}
              />
              <p className={styles.fieldNote}>Tu rol es administrado por el equipo de seguridad.</p>
            </div>
          </div>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: '4px 0 0', color: '#0f172a' }}>
            Datos de la Empresa
          </h3>
          <p className={styles.subtle}>
            Estos datos se muestran en reportes y documentos comerciales.
          </p>
          <div className={`${styles.fieldsetGrid} ${styles.twoCols || ''}`}>
            <Input
              label='Nombre Comercial'
              name='empresa_nombre'
              value={profileData.empresa_nombre}
              onChange={handleProfileChange}
              disabled={loading.profile}
              placeholder='Nombre legal o comercial'
            />
            <Input
              label='Sector / Industria'
              name='empresa_tipo'
              value={profileData.empresa_tipo}
              onChange={handleProfileChange}
              disabled={loading.profile}
              placeholder='Ej: Retail, Servicios, Manufactura'
            />
          </div>
          <div className={styles.saveSeparator}>
            <Button
              type='submit'
              variant='primary'
              size='medium'
              fullWidth
              disabled={loading.profile}
              loading={loading.profile}
            >
              Guardar Cambios de Información
            </Button>
          </div>
        </form>

        {/* Plan a la derecha con botón para cambiar contraseña */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            Plan Actual <span className={styles.inlineBadge}>Suscripción</span>
          </h2>
          <p className={styles.subtle}>
            Controla el uso del plan y gestiona upgrades según el crecimiento del equipo.
          </p>
          <hr className={styles.divider} />
          <div className={styles.planMeta}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                {planInfo.name}
              </span>
              <span style={{ fontSize: 12, color: '#64748b' }}>
                {planInfo.currentUsers} de {planInfo.maxUsers} usuarios
              </span>
            </div>
            <div style={{ minWidth: 190, flex: 1 }}>
              <div className={styles.planProgressBar}>
                <div
                  className={styles.planProgressFill}
                  style={{ width: `${(planInfo.currentUsers / planInfo.maxUsers) * 100}%` }}
                />
              </div>
            </div>
          </div>
          <ul className={styles.planFeatures}>
            {planInfo.features.slice(0, 4).map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <div className={styles.smallStatRow}>
            <div className={styles.smallStat}>
              <strong>{planInfo.maxUsers}</strong> Usuarios Máx.
            </div>
            <div className={styles.smallStat}>
              <strong>{Math.round((planInfo.currentUsers / planInfo.maxUsers) * 100)}%</strong>{' '}
              Ocupación
            </div>
            <div className={styles.smallStat}>
              <strong>{'Mensual'}</strong> Ciclo
            </div>
          </div>
          <div className={styles.actionsRow}>
            <Button
              variant='primary'
              size='small'
              disabled={planInfo.currentUsers < planInfo.maxUsers - 1}
            >
              Ampliar Capacidad
            </Button>
            <Button variant='secondary' size='small'>
              Ver Planes
            </Button>
            <Button
              type='button'
              variant='accent'
              size='small'
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? 'Ocultar Contraseña' : 'Cambiar Contraseña'}
            </Button>
          </div>
          {planInfo.currentUsers >= planInfo.maxUsers && (
            <p style={{ margin: 0, fontSize: 12, color: 'var(--error-600)', fontWeight: 500 }}>
              Has alcanzado el límite de usuarios de tu plan. Actualiza para agregar más miembros.
            </p>
          )}
          {showPassword && (
            <form onSubmit={handlePasswordSubmit} className={styles.passwordForm}>
              <Input
                label='Contraseña Actual'
                type='password'
                name='currentPassword'
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                disabled={loading.password}
                placeholder='Ingresa tu contraseña actual'
                required
              />
              {errors.currentPassword && (
                <p style={{ color: '#dc2626', fontSize: 13, marginTop: -4 }}>
                  {errors.currentPassword}
                </p>
              )}
              <Input
                label='Nueva Contraseña'
                type='password'
                name='newPassword'
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                disabled={loading.password}
                placeholder='Mínimo 6 caracteres'
                required
              />
              {errors.newPassword && (
                <p style={{ color: '#dc2626', fontSize: 13, marginTop: -4 }}>
                  {errors.newPassword}
                </p>
              )}
              <Input
                label='Confirmar Nueva Contraseña'
                type='password'
                name='confirmPassword'
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                disabled={loading.password}
                placeholder='Repite la nueva contraseña'
                required
              />
              {errors.confirmPassword && (
                <p style={{ color: '#dc2626', fontSize: 13, marginTop: -4 }}>
                  {errors.confirmPassword}
                </p>
              )}
              <Button
                type='submit'
                variant='accent'
                size='small'
                disabled={loading.password || !isPasswordFormValid()}
                loading={loading.password}
              >
                Actualizar Contraseña
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* Modal de éxito */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title='Operación Completada'
        message={successMessage}
        modalType={successMessage.includes('Error') ? 'error' : 'success'}
        confirmButtonText='Entendido'
      />
    </div>
  );
};

export default ProfilePage;
