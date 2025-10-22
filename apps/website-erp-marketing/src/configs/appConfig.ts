// Configuración de URLs de las aplicaciones
export const APP_URLS = {
  // URLs usando variables de entorno
  ERP_APP_URL: import.meta.env.VITE_ERP_URL || 'http://localhost:5175',
  MARKETING_APP_URL: import.meta.env.VITE_MARKETING_URL || 'http://localhost:5174',
};

// Base API backend (centralizado)
export const BACKEND_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Rutas específicas para redirección
export const ERP_ROUTES = {
  DASHBOARD: '/dashboard',
  LOGIN: '/login',
  HOME: '/',
};

// Helper mejorado para construir URL completa del ERP
export const buildERPUrl = (route: string = ERP_ROUTES.DASHBOARD): string => {
  const base = APP_URLS.ERP_APP_URL.replace(/\/+$/, '');
  const path = route ? (route.startsWith('/') ? route : `/${route}`) : '';
  return `${base}${path}`;
};

// Nuevo: construir URLs de API backend
export const buildApiUrl = (path: string) => {
  const base = BACKEND_API_URL.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
};

// Nuevo helper para redirección consistente hacia el ERP
export const redirectToERP = (route: string = ERP_ROUTES.DASHBOARD) => {
  window.location.href = buildERPUrl(route);
};
