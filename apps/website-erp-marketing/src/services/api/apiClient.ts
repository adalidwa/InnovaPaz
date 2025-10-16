import { auth } from '../../configs/firebaseConfig';

const API_BASE_URL = 'http://localhost:4000'; // URL de tu backend sin /api

// Función para obtener el token JWT de tu backend usando el token de Firebase
const getBackendToken = async (): Promise<string | null> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;

    // Obtener el token de Firebase
    const firebaseToken = await currentUser.getIdToken();

    // Intercambiarlo por el token JWT de tu backend
    const response = await fetch(`${API_BASE_URL}/api/auth/login-firebase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken: firebaseToken }),
    });

    if (!response.ok) {
      throw new Error('Error al obtener token del backend');
    }

    const data = await response.json();
    return data.token; // Tu token JWT del backend
  } catch (error) {
    console.error('Error obteniendo token del backend:', error);
    return null;
  }
};

export const apiClient = async (endpoint: string, options: RequestInit = {}) => {
  const { headers, ...customOptions } = options;

  // Obtener el token JWT de tu backend
  let authHeader = {};
  const backendToken = await getBackendToken();
  if (backendToken) {
    authHeader = {
      Authorization: `Bearer ${backendToken}`,
    };
  }

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
      ...headers,
    },
    ...customOptions,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error en la petición al backend');
  }

  try {
    return await response.json();
  } catch (e) {
    // En caso de que la respuesta no tenga cuerpo (ej. 204 No Content)
    return null;
  }
};
