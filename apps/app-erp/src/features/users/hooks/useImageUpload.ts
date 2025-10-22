import { useState, useRef } from 'react';

interface UseImageUploadOptions {
  allowedTypes?: string[];
  maxSize?: number;
  onSuccess?: (imageUrl: string) => void;
  onError?: (error: string) => void;
}

export const useImageUpload = (options: UseImageUploadOptions = {}) => {
  const {
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
    maxSize = 5 * 1024 * 1024,
    onSuccess,
    onError,
  } = options;

  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return 'Tipo de archivo no válido. Solo se permiten imágenes JPG, PNG y GIF.';
    }

    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      return `La imagen es muy grande. El tamaño máximo es ${maxSizeMB}MB.`;
    }

    return null;
  };

  const uploadImage = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      onError?.(validationError);
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;

      setTimeout(() => {
        setImageUrl(result);
        setIsUploading(false);
        onSuccess?.(result);
      }, 1500);
    };

    reader.onerror = () => {
      setIsUploading(false);
      onError?.('Error al cargar la imagen. Inténtalo de nuevo.');
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadImage(file);
    }
  };

  const removeImage = () => {
    setImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return {
    isUploading,
    imageUrl,
    fileInputRef,
    handleFileChange,
    removeImage,
    triggerFileInput,
    uploadImage,
  };
};
