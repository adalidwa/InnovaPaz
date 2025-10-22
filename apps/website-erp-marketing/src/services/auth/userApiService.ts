import { apiClient } from '../api/apiClient';

export interface BackendUserPayload {
  firebase_uid: string;
  email: string;
  nombre: string;
  apellido: string;
  // Puedes agregar otros campos como nombreEmpresa, planId, etc.
}

// Guarda el usuario en el backend (PostgreSQL)
export const saveUserInBackend = async (userData: BackendUserPayload) => {
  try {
    const response = await apiClient('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return { success: true, data: response };
  } catch (error) {
    console.error('Error saving user in backend:', error);
    return { success: false, error };
  }
};
