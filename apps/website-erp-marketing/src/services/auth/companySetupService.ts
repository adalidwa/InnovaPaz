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

    // Preparar los datos incluyendo el firebase_uid y email
    const requestData = {
      firebase_uid: user.uid,
      user_email: user.email,
      user_name: user.displayName || 'Usuario',
      ...data,
    };

    const response = await fetch(buildApiUrl('/api/users/complete-company-setup'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(requestData),
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
