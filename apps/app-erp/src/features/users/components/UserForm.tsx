import React, { useState, useCallback, memo } from 'react';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import TitleDescription from '../../../components/common/TitleDescription';
import styles from './UserForm.module.css';

interface UserFormData {
  nombre_completo: string;
  email: string;
  rol: string;
}

interface UserFormProps {
  mode: 'invite' | 'edit';
  availableRoles: string[];
  onSubmit: (data: UserFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  initialData?: Partial<UserFormData>;
}

// Componente memoizado para el input del nombre
const NameInput = memo<{
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}>(({ value, onChange, disabled = false }) => {
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
      placeholder='Ingrese el nombre completo'
      required
      disabled={disabled}
    />
  );
});

// Componente memoizado para el input del email
const EmailInput = memo<{
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}>(({ value, onChange, disabled = false }) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  return (
    <Input
      label='Correo Electrónico'
      type='email'
      value={value}
      onChange={handleChange}
      placeholder='correo@ejemplo.com'
      required
      disabled={disabled}
    />
  );
});

// Componente memoizado para el select de rol
const RoleSelect = memo<{
  value: string;
  onChange: (value: string) => void;
  options: string[];
  disabled?: boolean;
}>(({ value, onChange, options, disabled = false }) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  const roleOptions = options.map((role) => ({
    value: role,
    label: `${role} - ${getRoleDescription(role)}`,
  }));

  return (
    <Select
      label='Rol Asignado'
      value={value}
      onChange={handleChange}
      options={roleOptions}
      placeholder='Seleccione un rol...'
      required
      disabled={disabled}
    />
  );
});

const getRoleDescription = (role: string): string => {
  switch (role) {
    case 'Vendedor':
      return 'Gestión de ventas y clientes';
    case 'Encargado de Almacén':
      return 'Gestión de inventario';
    case 'Contador':
      return 'Gestión financiera y reportes';
    default:
      return 'Rol del sistema';
  }
};

const UserForm: React.FC<UserFormProps> = memo(
  ({ mode, availableRoles, onSubmit, onCancel, loading = false, initialData = {} }) => {
    const [formData, setFormData] = useState<UserFormData>({
      nombre_completo: initialData.nombre_completo || '',
      email: initialData.email || '',
      rol: initialData.rol || '',
    });

    const [errors, setErrors] = useState<Partial<UserFormData>>({});

    // Callbacks optimizados para cada campo
    const handleNameChange = useCallback(
      (newName: string) => {
        setFormData((prev) => ({ ...prev, nombre_completo: newName }));
        if (errors.nombre_completo) {
          setErrors((prev) => ({ ...prev, nombre_completo: undefined }));
        }
      },
      [errors.nombre_completo]
    );

    const handleEmailChange = useCallback(
      (newEmail: string) => {
        setFormData((prev) => ({ ...prev, email: newEmail }));
        if (errors.email) {
          setErrors((prev) => ({ ...prev, email: undefined }));
        }
      },
      [errors.email]
    );

    const handleRoleChange = useCallback(
      (newRole: string) => {
        setFormData((prev) => ({ ...prev, rol: newRole }));
        if (errors.rol) {
          setErrors((prev) => ({ ...prev, rol: undefined }));
        }
      },
      [errors.rol]
    );

    const validateForm = (): boolean => {
      const newErrors: Partial<UserFormData> = {};

      if (!formData.nombre_completo.trim()) {
        newErrors.nombre_completo = 'El nombre es obligatorio';
      }

      if (!formData.email.trim()) {
        newErrors.email = 'El email es obligatorio';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'El email no es válido';
      }

      if (!formData.rol) {
        newErrors.rol = 'Debe seleccionar un rol';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) return;

      try {
        await onSubmit(formData);
      } catch (error) {
        console.error('Error en el formulario:', error);
      }
    };

    const isFormValid =
      formData.nombre_completo.trim() &&
      formData.email.trim() &&
      formData.rol &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

    return (
      <div className={styles.formWrapper}>
        <TitleDescription
          title={mode === 'invite' ? 'Invitar Nuevo Miembro' : 'Editar Usuario'}
          description={
            mode === 'invite'
              ? 'Completa la información para enviar una invitación'
              : 'Modifica la información del usuario'
          }
          titleSize={18}
          descriptionSize={14}
          spacing='0.25rem'
          align='left'
        />

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldGroup}>
            <NameInput
              value={formData.nombre_completo}
              onChange={handleNameChange}
              disabled={loading}
            />
            {errors.nombre_completo && (
              <span className={styles.error}>{errors.nombre_completo}</span>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <EmailInput value={formData.email} onChange={handleEmailChange} disabled={loading} />
            {errors.email && <span className={styles.error}>{errors.email}</span>}
          </div>

          <div className={styles.fieldGroup}>
            <RoleSelect
              value={formData.rol}
              onChange={handleRoleChange}
              options={availableRoles}
              disabled={loading}
            />
            {errors.rol && <span className={styles.error}>{errors.rol}</span>}
          </div>

          <div className={styles.actions}>
            <Button
              type='submit'
              variant='primary'
              size='medium'
              disabled={!isFormValid || loading}
              loading={loading}
            >
              {mode === 'invite' ? 'Enviar Invitación' : 'Guardar Cambios'}
            </Button>
            <Button
              type='button'
              variant='secondary'
              size='medium'
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    );
  }
);

export default UserForm;
