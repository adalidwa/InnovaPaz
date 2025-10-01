import React from 'react';
import Table from '../../../components/common/Table';
import type { TableColumn } from '../../../components/common/Table';
import type { TableAction } from '../../../components/common/Table';
import StatusTag from '../../../components/common/StatusTag';
import styles from './UserList.module.css';

interface UserListProps {
  users: any[];
  onEditUser: (user: any) => void;
  loading?: boolean;
  compact?: boolean;
}

const UserList: React.FC<UserListProps> = ({
  users,
  onEditUser,
  loading = false,
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

  const columns: TableColumn<any>[] = [
    {
      key: 'usuario',
      header: 'Usuario',
      render: (_, user) => (
        <div className={styles.rowContent}>
          <div className={styles.avatar}>
            <span>{user.nombre_completo.charAt(0)}</span>
          </div>
          <div>
            <p className={styles.name}>{user.nombre_completo}</p>
            <p className={styles.email}>{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'rol',
      header: 'Rol',
      render: (_, user) => {
        const roleColors = getRoleColor(user.rol);
        return (
          <StatusTag
            text={user.rol}
            backgroundColor={roleColors.backgroundColor}
            textColor={roleColors.textColor}
            width='auto'
            height={28}
          />
        );
      },
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (_, user) => {
        const statusColors = getStatusColor(user.estado);
        return (
          <StatusTag
            text={user.estado}
            backgroundColor={statusColors.backgroundColor}
            textColor={statusColors.textColor}
            width='auto'
            height={28}
          />
        );
      },
    },
    {
      key: 'fecha_creacion',
      header: 'Fecha de Unión',
      render: (value) => new Date(value).toLocaleDateString('es-ES'),
    },
  ];

  const actions: TableAction<any>[] = [
    {
      label: 'Editar',
      onClick: (user: any) => onEditUser(user),
      variant: 'primary',
    },
  ];

  if (loading) {
    return (
      <div className={styles.loadingList}>
        {[...Array(3)].map((_, index) => (
          <div key={index} className={styles.loadingItem}></div>
        ))}
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>
          <svg width={32} height={32} fill='none' stroke='#9ca3af' viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
            />
          </svg>
        </div>
        <h3 className={styles.emptyTitle}>No hay usuarios</h3>
        <p className={styles.emptyText}>Comienza invitando a tu primer miembro del equipo.</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={styles.compactList}>
        {users.map((user) => {
          const roleColors = getRoleColor(user.rol);
          return (
            <div key={user.id} className={styles.card}>
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
        })}
      </div>
    );
  }

  return (
    <Table
      data={users}
      columns={columns}
      actions={actions}
      loading={loading}
      emptyMessage='No hay usuarios. Comienza invitando a tu primer miembro del equipo.'
      className={styles.userTable}
    />
  );
};

export default UserList;
