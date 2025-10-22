import { useState } from 'react';
import { uploadCompanyLogo } from '../services/companyUploadService';

export function useUploadCompanyLogo(empresaId: string, token: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadLogo = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const result = await uploadCompanyLogo(empresaId, file, token);
      setLoading(false);
      return result;
    } catch (err: any) {
      setError(err.message || 'Error al subir el logo');
      setLoading(false);
      return null;
    }
  };

  return { uploadLogo, loading, error };
}
