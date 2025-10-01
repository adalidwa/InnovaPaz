import React, { useState } from 'react';
import PropTypes from 'prop-types';
import UserForm from '../components/UserForm';
import Button from '../../../components/common/Button';
import StatusTag from '../../../components/common/StatusTag';
import TitleDescription from '../../../components/common/TitleDescription';
import styles from './InviteUserPage.module.css';

// Define la interfaz para los datos del formulario
interface InviteFormData {
  email: string;
  rol: string;
  nombre_completo: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
}

interface PlanInfo {
  name: string;
  maxUsers: number;
  currentUsers: number;
  features: string[];
}

interface InviteUserPageProps {
  availableRoles: Role[];
  planInfo: PlanInfo;
  onInviteUser: (data: InviteFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const InviteUserPage: React.FC<InviteUserPageProps> = ({
  availableRoles,
  planInfo,
  onInviteUser,
  onCancel,
  loading = false,
}) => {
  const [inviteData, setInviteData] = useState<InviteFormData>({
    email: '',
    rol: '',
    nombre_completo: '',
  });

  const canInviteMore = planInfo.currentUsers < planInfo.maxUsers;

  const getRoleColor = (role: string) => {
    switch (role) {
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

  const handleInvite = async (formData: InviteFormData) => {
    try {
      await onInviteUser({
        email: formData.email,
        rol: formData.rol,
        nombre_completo: formData.nombre_completo,
      });
      alert(`Invitación enviada exitosamente a ${formData.email}`);
      onCancel();
    } catch (error) {
      alert('Error al enviar la invitación');
    }
  };

  return (
    <div className={styles.inviteWrapper}>
      {/* Header */}
      <div className={styles.header}>
        <nav className={styles.breadcrumb} aria-label='Breadcrumb'>
          <ol className={styles.breadcrumbList}>
            <li>
              <Button variant='secondary' size='small' onClick={onCancel}>
                Gestión de Equipo
              </Button>
            </li>
            <li>
              <svg className={styles.breadcrumbIcon} fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
                  clipRule='evenodd'
                />
              </svg>
            </li>
            <li>
              <span className={styles.breadcrumbCurrent}>Invitar Miembro</span>
            </li>
          </ol>
        </nav>

        <TitleDescription
          title='Invitar Nuevo Miembro al Equipo'
          description='Agrega un nuevo miembro a tu equipo asignándole un rol específico.'
          titleSize={32}
          descriptionSize={16}
          spacing='0.5rem'
          align='left'
        />
      </div>

      <div className={styles.sections}>
        {/* Formulario de Invitación */}
        <div className={styles.formSection}>
          {canInviteMore ? (
            <UserForm
              mode='invite'
              availableRoles={availableRoles.map((role) => role.name)}
              onSubmit={handleInvite}
              onCancel={onCancel}
              loading={loading}
            />
          ) : (
            <div className={styles.limitCard}>
              <div className={styles.limitCardContent}>
                <div className={styles.limitIconWrapper}>
                  <svg
                    className={styles.limitIcon}
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.96-.833-2.73 0L3.084 16.5c-.77.833.192 2.5 1.732 2.5z'
                    />
                  </svg>
                </div>

                <TitleDescription
                  title='Límite de usuarios alcanzado'
                  description={`Has alcanzado el límite de ${planInfo.maxUsers} usuarios para tu plan ${planInfo.name}. Actualiza tu plan para invitar más miembros.`}
                  titleSize={20}
                  descriptionSize={14}
                  spacing='0.5rem'
                  align='center'
                />

                <ul className={styles.featuresList}>
                  {planInfo.features.map((feature, index) => (
                    <li key={index} className={styles.featureItem}>
                      <svg
                        className={styles.featureIcon}
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M5 13l4 4L19 7'
                        />
                      </svg>
                      <span className={styles.featureText}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div style={{ marginTop: '1.5rem' }}>
                  <Button variant='primary' size='medium' fullWidth>
                    Actualizar Plan
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Panel Lateral */}
        <div className={styles.sidePanel}>
          {/* Uso del Plan */}
          <div className={styles.planUsageCard}>
            <TitleDescription
              title='Uso del Plan'
              description={`${planInfo.currentUsers} de ${planInfo.maxUsers} usuarios`}
              titleSize={18}
              descriptionSize={14}
              spacing='0.25rem'
              align='left'
            />

            <div className={styles.progressContainer}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progress}
                  style={{ width: `${(planInfo.currentUsers / planInfo.maxUsers) * 100}%` }}
                />
              </div>
              <div className={styles.planInfo}>
                <StatusTag
                  text={planInfo.name}
                  backgroundColor='var(--pri-100)'
                  textColor='var(--pri-800)'
                  width='auto'
                  height={24}
                />
                <p
                  style={{
                    color: canInviteMore ? '#22c55e' : '#ef4444',
                    fontSize: 14,
                    marginTop: '0.5rem',
                  }}
                >
                  {canInviteMore
                    ? `Puedes agregar ${planInfo.maxUsers - planInfo.currentUsers} usuario(s) más`
                    : 'Has alcanzado el límite de usuarios'}
                </p>
              </div>
            </div>
          </div>

          {/* Roles Disponibles */}
          <div className={styles.rolesSection}>
            <TitleDescription
              title='Roles Disponibles'
              description='Roles que puedes asignar a los nuevos miembros'
              titleSize={18}
              descriptionSize={14}
              spacing='0.25rem'
              align='left'
            />

            <div className={styles.rolesList}>
              {availableRoles
                .filter((role) => role.id !== 'administrador')
                .map((role) => {
                  const roleColors = getRoleColor(role.name);
                  return (
                    <div key={role.id} className={styles.roleItem}>
                      <StatusTag
                        text={role.name}
                        backgroundColor={roleColors.backgroundColor}
                        textColor={roleColors.textColor}
                        width='auto'
                        height={28}
                      />
                      <span className={styles.roleDescription}>{role.description}</span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

InviteUserPage.propTypes = {
  availableRoles: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
    })
  ).isRequired,
  planInfo: PropTypes.shape({
    name: PropTypes.string.isRequired,
    maxUsers: PropTypes.number.isRequired,
    currentUsers: PropTypes.number.isRequired,
    features: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  onInviteUser: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default InviteUserPage;
