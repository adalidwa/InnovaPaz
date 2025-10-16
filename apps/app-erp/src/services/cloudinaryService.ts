// Configuración para upload de imágenes a través del backend

const API_BASE_URL = 'http://localhost:4000';

// Configuraciones de transformación
export const CLOUDINARY_CONFIG = {
  TRANSFORMATIONS: {
    PRODUCT_THUMBNAIL: 'c_fill,w_400,h_400,q_auto,f_auto',
    PRODUCT_MEDIUM: 'c_fill,w_800,h_600,q_auto,f_auto',
    PRODUCT_LARGE: 'c_fit,w_1200,h_900,q_auto,f_auto',
  },

  // Límites de archivos
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FORMATS: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
} as const;

// Función para validar archivos
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Validar tipo de archivo
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'El archivo debe ser una imagen' };
  }

  // Validar formato
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  if (
    !fileExtension ||
    !(CLOUDINARY_CONFIG.ALLOWED_FORMATS as readonly string[]).includes(fileExtension)
  ) {
    return {
      valid: false,
      error: `Formato no soportado. Use: ${CLOUDINARY_CONFIG.ALLOWED_FORMATS.join(', ')}`,
    };
  }

  // Validar tamaño
  if (file.size > CLOUDINARY_CONFIG.MAX_FILE_SIZE) {
    const maxSizeMB = CLOUDINARY_CONFIG.MAX_FILE_SIZE / (1024 * 1024);
    return {
      valid: false,
      error: `El archivo debe ser menor a ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
};

// Función para subir imagen a través del backend
export const uploadImageToCloudinary = async (
  file: File
): Promise<{
  success: boolean;
  url?: string;
  error?: string;
}> => {
  try {
    // Validar archivo
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Preparar FormData para el backend
    const formData = new FormData();
    formData.append('image', file);

    // Subir a través del backend
    const response = await fetch(`${API_BASE_URL}/api/upload/upload`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Error al subir la imagen');
    }

    if (result.success && result.data?.url) {
      return {
        success: true,
        url: result.data.url,
      };
    } else {
      throw new Error('Respuesta inválida del servidor');
    }
  } catch (error) {
    console.error('Error uploading via backend:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al subir imagen',
    };
  }
};

// Función para eliminar imagen (opcional)
export const deleteImageFromCloudinary = async (
  publicId: string
): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/upload/delete/${encodeURIComponent(publicId)}`,
      {
        method: 'DELETE',
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Error al eliminar la imagen');
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al eliminar imagen',
    };
  }
};
