import styles from './UserCard.module.css';
import Button from '../../../components/common/Button';
import StatusTag from '../../../components/common/StatusTag';

interface UserCardProps {
  user: any;
  onEditRole: (id: string) => void;
  onDeleteUser: (id: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  onEditRole,
  onDeleteUser,
  showActions = true,
  compact = false,
}) => {
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

  if (compact) {
    const roleColors = getRoleColor(user.rol);
    return (
      <div className={styles.card}>
        <div className={styles.avatar}>
          <span>{user.nombre_completo.charAt(0)}</span>
        </div>
        <div className={styles.info}>
          <p className={styles.name}>{user.nombre_completo}</p>
          <p className={styles.email}>{user.email}</p>
        </div>
        <StatusTag
          text={user.rol}
          backgroundColor={roleColors.backgroundColor}
          textColor={roleColors.textColor}
          width='auto'
          height={24}
        />
      </div>
    );
  }

  const roleColors = getRoleColor(user.rol);
  const statusColors = getStatusColor(user.estado);

  return (
    <tr className={styles.row}>
      <td className={styles.cell}>
        <div className={styles.rowContent}>
          <div className={styles.avatar}>
            <span>{user.nombre_completo.charAt(0)}</span>
          </div>
          <div>
            <p className={styles.name}>{user.nombre_completo}</p>
            <p className={styles.email}>{user.email}</p>
          </div>
        </div>
      </td>
      <td className={styles.cell}>
        <StatusTag
          text={user.rol}
          backgroundColor={roleColors.backgroundColor}
          textColor={roleColors.textColor}
          width='auto'
          height={28}
        />
      </td>
      <td className={styles.cell}>
        <StatusTag
          text={user.estado}
          backgroundColor={statusColors.backgroundColor}
          textColor={statusColors.textColor}
          width='auto'
          height={28}
        />
      </td>
      <td className={styles.cell}>{new Date(user.fecha_creacion).toLocaleDateString('es-ES')}</td>
      {showActions && (
        <td className={styles.cell}>
          <div className={styles.actions}>
            <Button variant='outline' size='small' onClick={() => onEditRole(user)}>
              Cambiar Rol
            </Button>
            <span className={styles.actionDivider}>|</span>
            <Button variant='accent' size='small' onClick={() => onDeleteUser(user)}>
              Eliminar
            </Button>
          </div>
        </td>
      )}
    </tr>
  );
};

export default UserCard;
