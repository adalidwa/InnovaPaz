import React from 'react';
import Select from '../../../components/common/Select';
import StatusTag from '../../../components/common/StatusTag';
import TitleDescription from '../../../components/common/TitleDescription';
import styles from './UserRoleSelector.module.css';

interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
}

interface UserRoleSelectorProps {
  selectedRole: string;
  onRoleChange: (roleId: string) => void;
  availableRoles: Role[];
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const UserRoleSelector: React.FC<UserRoleSelectorProps> = ({
  selectedRole,
  onRoleChange,
  availableRoles,
  disabled = false,
  size = 'medium',
}) => {
  const getRoleColor = (roleName: string) => {
    switch (roleName) {
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

  const filteredRoles = availableRoles.filter((role) => role.id !== 'administrador');

  const roleOptions = filteredRoles.map((role) => ({
    value: role.id,
    label: `${role.name} - ${role.description}`,
  }));

  const selectedRoleData = availableRoles.find((role) => role.id === selectedRole);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onRoleChange(e.target.value);
  };

  return (
    <div className={styles.selectorWrapper}>
      <Select
        label='Seleccionar Rol'
        value={selectedRole}
        onChange={handleRoleChange}
        disabled={disabled}
        options={roleOptions}
        placeholder='Seleccione un rol...'
        required
      />

      {selectedRoleData && (
        <div className={styles.selectedRoleInfo}>
          <TitleDescription
            title='Rol Seleccionado'
            description={selectedRoleData.description}
            titleSize={16}
            descriptionSize={14}
            titleWeight='medium'
            descriptionWeight='normal'
            spacing='0.25rem'
            align='left'
          />
          <StatusTag
            text={selectedRoleData.name}
            backgroundColor={getRoleColor(selectedRoleData.name).backgroundColor}
            textColor={getRoleColor(selectedRoleData.name).textColor}
            width='auto'
            height={28}
          />
        </div>
      )}
    </div>
  );
};

export default UserRoleSelector;
