import { apiClient } from './apiClient';

export interface NewUserPayload {
  firebase_uid: string;
  email: string;
  nombre: string;
  apellido: string;
  // Agrega otros campos que necesites enviar al backend
  // nombreEmpresa?: string;
  // planId?: string;
}

export const saveUserInBackend = async (userData: NewUserPayload) => {
  try {
    // Asumiendo un endpoint como '/users' o '/users/create'
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
