import React, { useRef, useState } from 'react';
import { useUploadCompanyLogo } from '../hooks/useUploadCompanyLogo';
import ImageAdjuster from './ImageAdjuster';
import ImageAdjusterPreview from './ImageAdjusterPreview';
import Modal from '../../../components/common/Modal';
import './CompanyLogoUpload.css';

interface Props {
  empresaId: string;
  token: string;
  onUploaded: (url: string, publicId: string) => void;
  logoPreview?: string | null;
}

const CompanyLogoUpload: React.FC<Props> = ({ empresaId, token, onUploaded, logoPreview }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { uploadLogo, loading, error } = useUploadCompanyLogo(empresaId, token);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [showAdjuster, setShowAdjuster] = useState(false);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [removeBgError, setRemoveBgError] = useState<string | null>(null);
  const [removeBgChecked, setRemoveBgChecked] = useState(true);

  const removeBgKeys = [
    import.meta.env.VITE_REMOVEBG_API_KEY_0,
    import.meta.env.VITE_REMOVEBG_API_KEY_1,
    import.meta.env.VITE_REMOVEBG_API_KEY_2,
  ];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRemoveBgError(null);
    setOriginalFile(file);
    const reader = new FileReader();
    const imageToUse = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    setSelectedImage(imageToUse);
    setShowAdjuster(true);
  };

  async function tryRemoveBg(file: File): Promise<string | null> {
    for (let i = 0; i < removeBgKeys.length; i++) {
      const apiKey = removeBgKeys[i];
      if (!apiKey) continue;
      try {
        const formData = new FormData();
        formData.append('image_file', file);
        const res = await fetch('https://api.remove.bg/v1.0/removebg', {
          method: 'POST',
          headers: { 'X-Api-Key': apiKey },
          body: formData,
        });
        if (res.ok) {
          const blob = await res.blob();
          const reader = new FileReader();
          return await new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } else if (res.status === 402) {
          continue;
        }
      } catch (error) {}
    }
    return null;
  }

  const handleSaveAdjuster = async (cropped: string) => {
    setCroppedImage(cropped);
    setShowAdjuster(false);

    const res = await fetch(cropped);
    const blob = await res.blob();
    const croppedFile = new File([blob], 'logo-ajustado.png', { type: 'image/png' });

    let finalImage: string | null = null;

    if (
      removeBgChecked &&
      originalFile &&
      (originalFile.type === 'image/jpeg' || originalFile.type === 'image/jpg')
    ) {
      finalImage = await tryRemoveBg(croppedFile);
      if (!finalImage) {
        setRemoveBgError('No se pudo quitar el fondo, se usará la imagen original.');
      }
    }

    if (!finalImage) {
      finalImage = cropped;
    }

    const uploadRes = await fetch(finalImage);
    const uploadBlob = await uploadRes.blob();
    const uploadFile = new File([uploadBlob], 'logo-ajustado.png', { type: 'image/png' });
    const result = await uploadLogo(uploadFile);
    if (result) {
      onUploaded(result.logo_url, result.logo_public_id);
    }
  };

  const handleResetAdjuster = () => {
    setSelectedImage(null);
    setShowAdjuster(false);
    setCroppedImage(null);
  };

  return (
    <div
      className={`logo-upload logo-upload--large ${logoPreview ? 'logo-upload--with-image' : ''}`}
    >
      {logoPreview ? (
        <img src={logoPreview} alt='Logo' className='logo-preview-img logo-preview-img--large' />
      ) : (
        <div className='logo-upload-inner logo-upload-inner--large'>
          <span className='logo-icon logo-icon--large'>⬆</span>
          <span className='logo-text logo-text--large'>
            Subir Logo
            <br />
            <small>JPG, PNG o SVG. Máx 2MB.</small>
          </span>
        </div>
      )}
      <input
        type='file'
        accept='.png,.jpg,.jpeg,.svg'
        ref={inputRef}
        onChange={handleFileChange}
        className='logo-file-input'
        aria-label='Seleccionar logo'
        disabled={loading}
        style={{ display: showAdjuster ? 'none' : undefined }}
      />
      {loading && <span>Subiendo...</span>}
      {error && <span className='logo-upload-error'>{error}</span>}
      {removeBgError && <span className='logo-remove-bg-error'>{removeBgError}</span>}
      <Modal
        isOpen={showAdjuster && !!selectedImage}
        onClose={handleResetAdjuster}
        title='Ajustar Logo'
        message='Ajusta el logo antes de guardar. Puedes mover y hacer zoom en el área de recorte.'
        modalType='info'
        showCloseButton={true}
      >
        {selectedImage && (
          <>
            <ImageAdjuster
              imageSrc={selectedImage}
              aspect={1}
              onSave={handleSaveAdjuster}
              onReset={handleResetAdjuster}
            />
            <div className='logo-remove-bg-checkbox-container'>
              <label className='logo-remove-bg-checkbox'>
                <input
                  type='checkbox'
                  checked={removeBgChecked}
                  onChange={(e) => setRemoveBgChecked(e.target.checked)}
                  className='logo-remove-bg-checkbox-input'
                />
                <span className='logo-remove-bg-checkbox-label'>
                  Quitar fondo al guardar{' '}
                  <span className='logo-remove-bg-checkbox-hint'>(solo JPG/JPEG)</span>
                </span>
              </label>
            </div>
          </>
        )}
        {croppedImage && <ImageAdjusterPreview image={croppedImage} size={64} />}
      </Modal>
    </div>
  );
};

export default CompanyLogoUpload;
