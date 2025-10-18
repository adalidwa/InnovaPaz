import React, { useState, useRef } from 'react';
import Button from '../../../components/common/Button';
import { uploadImageToCloudinary } from '../../../services/cloudinaryService';
import './ImageUpload.css';

interface ImageUploadProps {
  label?: string;
  currentImage?: string;
  onImageUpload: (imageUrl: string) => void;
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  label = 'Imagen del Producto',
  currentImage,
  onImageUpload,
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(currentImage || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      // Crear preview local
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);

      // Subir usando el servicio de Cloudinary
      const result = await uploadImageToCloudinary(file);

      if (result.success && result.url) {
        setPreviewUrl(result.url);
        onImageUpload(result.url);

        // Limpiar preview local
        URL.revokeObjectURL(localPreview);
      } else {
        throw new Error(result.error || 'Error al subir la imagen');
      }
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'Error al subir la imagen. Por favor intenta de nuevo.'
      );
      setPreviewUrl(currentImage || '');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl('');
    onImageUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className='image-upload-container'>
      <label className='image-upload-label'>{label}</label>

      <div className='image-upload-content'>
        {previewUrl ? (
          <div className='image-preview'>
            <img src={previewUrl} alt='Preview del producto' className='preview-image' />
            <div className='image-actions'>
              <Button
                variant='secondary'
                size='small'
                onClick={handleFileSelect}
                disabled={disabled || uploading}
              >
                {uploading ? 'Subiendo...' : 'Cambiar'}
              </Button>
              <Button
                variant='warning'
                size='small'
                onClick={handleRemoveImage}
                disabled={disabled || uploading}
              >
                Quitar
              </Button>
            </div>
          </div>
        ) : (
          <div className='image-placeholder'>
            <div className='placeholder-content'>
              <svg
                className='placeholder-icon'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                />
              </svg>
              <p className='placeholder-text'>{uploading ? 'Subiendo imagen...' : 'Sin imagen'}</p>
              <Button
                variant='primary'
                size='medium'
                onClick={handleFileSelect}
                disabled={disabled || uploading}
              >
                {uploading ? 'Subiendo...' : 'Seleccionar Imagen'}
              </Button>
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type='file'
        accept='image/*'
        onChange={handleFileChange}
        style={{ display: 'none' }}
        disabled={disabled || uploading}
      />

      <div className='upload-help-text'>
        <small>Formatos soportados: JPG, PNG, GIF, WebP. Tamaño máximo: 5MB</small>
      </div>
    </div>
  );
};

export default ImageUpload;
