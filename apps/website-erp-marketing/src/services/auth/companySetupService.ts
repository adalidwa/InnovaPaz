import { auth } from '../../configs/firebaseConfig';
import { buildApiUrl } from '../../configs/appConfig';

// Servicio para completar la configuración de la empresa para un usuario existente

interface CompleteCompanySetupData {
  empresa_data: {
    nombre: string;
    tipo_empresa_id: number;
    plan_id: number;
  };
}

export async function completeCompanySetup(data: CompleteCompanySetupData) {
  try {
    // Obtener token de Firebase del usuario autenticado
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    const idToken = await user.getIdToken();

    const response = await fetch(buildApiUrl('/api/users/complete-company-setup'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al completar la configuración de la empresa.');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en completeCompanySetup:', error);
    throw error;
  }
}
