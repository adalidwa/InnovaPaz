/**
 * Configuración centralizada para las URLs del API
 */

// URL base del backend desde variables de entorno
const getApiBaseUrl = (): string => {
  // Usar VITE_API_URL si está definida, sino usar VITE_BACKEND_API_URL sin el /api, sino localhost
  return (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_BACKEND_API_URL?.replace('/api', '') ||
    'http://localhost:4000'
  );
};

export const API_BASE_URL = getApiBaseUrl();

// URLs específicas de endpoints
export const API_ENDPOINTS = {
  auth: `${API_BASE_URL}/api/auth`,
  users: `${API_BASE_URL}/api/users`,
  companies: `${API_BASE_URL}/api/companies`,
  roles: `${API_BASE_URL}/api/roles`,
  rolesPlantilla: `${API_BASE_URL}/api/roles-plantilla`,
  subscriptions: `${API_BASE_URL}/api/subscriptions`,
  plans: `${API_BASE_URL}/api/plans`,
  invoices: `${API_BASE_URL}/api/subscriptions/invoices`,
  products: `${API_BASE_URL}/api/products`,
  categories: `${API_BASE_URL}/api/categories`,
  brands: `${API_BASE_URL}/api/brands`,
  inventories: `${API_BASE_URL}/api/inventories`,
  tasks: `${API_BASE_URL}/api/tasks`,
} as const;

// Helper para construir URLs completas
export const buildApiUrl = (endpoint: string): string => {
  // Si ya incluye el dominio, lo devolvemos tal como está
  if (endpoint.startsWith('http')) {
    return endpoint;
  }

  // Si comienza con /api, lo concatenamos con la base
  if (endpoint.startsWith('/api')) {
    return `${API_BASE_URL}${endpoint}`;
  }

  // Si no tiene prefijo, asumimos que necesita /api
  return `${API_BASE_URL}/api/${endpoint}`;
};

// Helper para headers comunes
export const getAuthHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Si no se pasa token, intentar obtenerlo de localStorage
  const authToken = token || localStorage.getItem('token');

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  return headers;
};
