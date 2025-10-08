// Servicio de autenticación que usa el backend coordinador
const API_BASE_URL = 'http://localhost:4000/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      firebase_uid: string;
      email: string;
      nombre: string;
      apellido: string;
      telefono?: string;
      estado: string;
      empresa_id?: string;
      setup_completed?: boolean;
    };
    token?: string;
  };
  error?: string;
}

// Login usando el backend coordinador
export const loginWithBackend = async (loginData: LoginRequest): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/simple-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Error al iniciar sesión',
        error: result.error,
      };
    }

    return result;
  } catch (error) {
    console.error('Error en loginWithBackend:', error);
    return {
      success: false,
      message: 'Error de conexión con el servidor',
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
};

// Registro usando el backend coordinador
export const registerWithBackend = async (registerData: RegisterRequest): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/simple-register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerData),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Error al registrar usuario',
        error: result.error,
      };
    }

    return result;
  } catch (error) {
    console.error('Error en registerWithBackend:', error);
    return {
      success: false,
      message: 'Error de conexión con el servidor',
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
};

// Verificar token de usuario
export const verifyUserToken = async (token: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Token inválido',
        error: result.error,
      };
    }

    return result;
  } catch (error) {
    console.error('Error en verifyUserToken:', error);
    return {
      success: false,
      message: 'Error de conexión con el servidor',
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
};

// Utilidades para manejo de sesión
export const saveUserSession = (userData: any, token?: string) => {
  localStorage.setItem('user', JSON.stringify(userData));
  if (token) {
    localStorage.setItem('authToken', token);
  }
};

export const getUserSession = () => {
  const user = localStorage.getItem('user');
  const token = localStorage.getItem('authToken');
  return {
    user: user ? JSON.parse(user) : null,
    token,
  };
};

export const clearUserSession = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('authToken');
};

// Verificar si el usuario necesita configurar empresa
export const needsCompanySetup = (userData: any): boolean => {
  return !userData.empresa_id || !userData.setup_completed;
};

// Construir URL de redirección al ERP
export const buildERPRedirectUrl = (userData: any): string => {
  const erpBaseUrl = 'http://localhost:5175'; // ✅ CORREGIDO: puerto 5175

  if (needsCompanySetup(userData)) {
    // Si necesita configurar empresa, va a company-setup
    return `${erpBaseUrl}/company-setup`;
  }

  // Si ya tiene empresa configurada, va al dashboard
  return `${erpBaseUrl}/dashboard`;
};
