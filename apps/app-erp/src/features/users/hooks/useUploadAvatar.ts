import { useState } from 'react';
import { uploadUserAvatar } from '../services/userUploadService';

export function useUploadAvatar(userId: string, token: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadAvatar = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const result = await uploadUserAvatar(userId, file, token);
      setLoading(false);
      return result;
    } catch (err: any) {
      setError(err.message || 'Error al subir el avatar');
      setLoading(false);
      return null;
    }
  };

  return { uploadAvatar, loading, error };
}
