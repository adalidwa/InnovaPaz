import { useState } from 'react';
import { IoMail, IoCamera } from 'react-icons/io5';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import Select from '../../../components/common/Select';
import Modal from '../../../components/common/Modal';
import './PersonalInfoSection.css';

const roleOptions = [
  { value: 'admin', label: 'Administrador' },
  { value: 'user', label: 'Usuario' },
  { value: 'manager', label: 'Gerente' },
];

function PersonalInfoSection() {
  const [formData, setFormData] = useState({
    fullName: 'Edison García',
    email: 'edison.garcia@innovapaz.com',
    role: 'admin',
  });

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Función para obtener iniciales del nombre
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Función para manejar cambio de avatar
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    setShowModal(true);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original values
    setFormData({
      fullName: 'Edison García',
      email: 'edison.garcia@innovapaz.com',
      role: 'admin',
    });
  };

  return (
    <div className='personal-info-section'>
      <div className='section-header'>
        <h2 className='section-title'>Información Personal</h2>
        <p className='section-subtitle'>Actualiza tu información y foto de perfil</p>
      </div>

      <div className='personal-info-content'>
        {/* Avatar Section */}
        <div className='avatar-section'>
          <div className='avatar-container'>
            {avatarUrl ? (
              <img src={avatarUrl} alt='Avatar' className='avatar-image' />
            ) : (
              <div className='avatar-initials'>{getInitials(formData.fullName)}</div>
            )}
            <label htmlFor='avatar-upload' className='avatar-upload-btn'>
              <IoCamera size={16} />
              <input
                id='avatar-upload'
                type='file'
                accept='image/*'
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
            </label>
          </div>
          <div className='avatar-info'>
            <h3 className='user-name'>{formData.fullName}</h3>
            <p className='user-role'>{roleOptions.find((r) => r.value === formData.role)?.label}</p>
          </div>
        </div>

        {/* Form Section */}
        <div className='form-section'>
          <div className='form-row'>
            <div className='form-field'>
              <Input
                label='Nombre Completo'
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder='Tu nombre completo'
                disabled={!isEditing}
                required
              />
            </div>
          </div>

          <div className='form-row'>
            <div className='form-field'>
              <Input
                label='Correo Electrónico'
                type='email'
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder='correo@ejemplo.com'
                leftIcon={<IoMail />}
                disabled={true}
              />
              <div className='field-note'>El correo electrónico no puede ser modificado</div>
            </div>
            <div className='form-field'>
              <Select
                label='Rol Asignado'
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                options={roleOptions}
                disabled={true}
              />
              <div className='field-note'>Asignado por administrador</div>
            </div>
          </div>

          <div className='form-actions'>
            {!isEditing ? (
              <Button variant='primary' onClick={handleEdit} size='medium'>
                Editar Información
              </Button>
            ) : (
              <div className='edit-actions'>
                <Button variant='secondary' onClick={handleCancel} size='medium'>
                  Cancelar
                </Button>
                <Button variant='primary' onClick={handleSave} size='medium'>
                  Guardar Cambios
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title='Información Actualizada'
        message='Tu información personal ha sido actualizada exitosamente.'
        modalType='success'
        confirmButtonText='Aceptar'
      />
    </div>
  );
}

export default PersonalInfoSection;
