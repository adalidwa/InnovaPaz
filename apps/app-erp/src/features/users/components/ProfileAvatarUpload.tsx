import React, { useRef, useState } from 'react';
import { useUploadAvatar } from '../hooks/useUploadAvatar';
import Modal from '../../../components/common/Modal';
import './ProfileAvatarUpload.css';

interface Props {
  userId: string;
  token: string;
  onUploaded: (url: string, publicId: string) => void;
  avatarPreview?: string | null;
  children?: React.ReactNode;
}

const PencilIcon = ({ active }: { active?: boolean }) => (
  <svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
    <path
      d='M4 20h4l10.5-10.5a1.5 1.5 0 0 0-2.12-2.12L6 17.88V20z'
      stroke={active ? 'var(--sec-700)' : 'var(--pri-600)'}
      strokeWidth='2'
      fill='var(--white)'
    />
    <path d='M14.5 6.5l3 3' stroke={active ? 'var(--sec-700)' : 'var(--pri-600)'} strokeWidth='2' />
  </svg>
);

const ProfileAvatarUpload: React.FC<Props> = ({
  userId,
  token,
  onUploaded,
  avatarPreview,
  children,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { uploadAvatar, loading, error } = useUploadAvatar(userId, token);
  const [showModal, setShowModal] = useState(false);
  const [pencilActive, setPencilActive] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setShowModal(false);
    const result = await uploadAvatar(file);
    if (result) {
      onUploaded(result.avatar_url, result.avatar_public_id);
    }
  };

  const handleClick = () => {
    setShowModal(true);
  };

  const handleModalConfirm = () => {
    setShowModal(false);
    inputRef.current?.click();
  };

  return (
    <div className={`avatar-upload ${avatarPreview ? 'avatar-upload--with-image' : ''}`}>
      {avatarPreview ? (
        <div className='avatar-preview-container'>
          <img src={avatarPreview} alt='Avatar' className='avatar-preview-img' />
          <button
            type='button'
            className='avatar-pencil-btn'
            onClick={handleClick}
            aria-label='Cambiar foto de perfil'
            onMouseDown={() => setPencilActive(true)}
            onMouseUp={() => setPencilActive(false)}
            onMouseLeave={() => setPencilActive(false)}
          >
            <PencilIcon active={pencilActive} />
          </button>
        </div>
      ) : (
        <div className='avatar-initials'>
          <span className='avatar-initials-text'>{children}</span>
          <button
            type='button'
            className='avatar-pencil-btn'
            onClick={handleClick}
            aria-label='Subir foto de perfil'
            onMouseDown={() => setPencilActive(true)}
            onMouseUp={() => setPencilActive(false)}
            onMouseLeave={() => setPencilActive(false)}
          >
            <PencilIcon active={pencilActive} />
          </button>
        </div>
      )}
      <input
        type='file'
        accept='.png,.jpg,.jpeg'
        ref={inputRef}
        onChange={handleFileChange}
        className='avatar-file-input'
        aria-label='Seleccionar avatar'
        disabled={loading}
        style={{ display: 'none' }}
      />
      {loading && <span>Subiendo...</span>}
      {error && <span className='avatar-upload-error'>{error}</span>}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title='Subir foto de perfil'
        message='Formatos permitidos: JPG, PNG. Tamaño máximo: 2MB.'
        modalType='info'
        confirmButtonText='Seleccionar archivo'
        onConfirm={handleModalConfirm}
      />
    </div>
  );
};

export default ProfileAvatarUpload;
