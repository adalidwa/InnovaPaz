import { useState, useEffect } from 'react';
import { IoMail } from 'react-icons/io5';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import Select from '../../../components/common/Select';
import Modal from '../../../components/common/Modal';
import ProfileAvatarUpload from './ProfileAvatarUpload';
import './PersonalInfoSection.css';
import { useUser } from '../hooks/useContextBase.ts';

const roleOptions = [
  { value: 'admin', label: 'Administrador' },
  { value: 'user', label: 'Usuario' },
  { value: 'manager', label: 'Gerente' },
];

function PersonalInfoSection() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: '',
  });
  const [userId, setUserId] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const { updateAvatar } = useUser();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (res.ok) {
          const data = await res.json();
          setUserId(data.usuario.uid);
          setFormData({
            fullName: data.usuario.nombre_completo || '',
            email: data.usuario.email || '',
            role: data.usuario.rol_id || '',
          });
          setAvatarUrl(data.usuario.avatar_url || null);
        }
      } catch (error) {
        console.error('Error obteniendo usuario:', error);
      }
    };
    fetchUser();
  }, []);

  const handleAvatarUploaded = (url: string) => {
    setAvatarUrl(url);
    if (updateAvatar) updateAvatar(url);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !userId) return;
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre_completo: formData.fullName }),
      });
      if (res.ok) {
        setShowModal(true);
        setIsEditing(false);
      } else {
        alert('No se pudo actualizar la información personal');
      }
    } catch {
      alert('Error de red al actualizar información');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className='personal-info-section'>
      <div className='section-header'>
        <h2 className='section-title'>Información Personal</h2>
        <p className='section-subtitle'>Actualiza tu información y foto de perfil</p>
      </div>

      <div className='personal-info-content'>
        <div className='avatar-section'>
          <div className='avatar-container'>
            {avatarUrl ? (
              <ProfileAvatarUpload
                userId={userId}
                token={localStorage.getItem('token') || ''}
                onUploaded={handleAvatarUploaded}
                avatarPreview={avatarUrl}
              />
            ) : (
              <ProfileAvatarUpload
                userId={userId}
                token={localStorage.getItem('token') || ''}
                onUploaded={handleAvatarUploaded}
                avatarPreview={null}
              >
                {getInitials(formData.fullName)}
              </ProfileAvatarUpload>
            )}
          </div>
          <div className='avatar-info'>
            <h3 className='user-name'>{formData.fullName}</h3>
            <p className='user-role'>{roleOptions.find((r) => r.value === formData.role)?.label}</p>
          </div>
        </div>

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
