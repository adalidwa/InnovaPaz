// Configuración de URLs de las aplicaciones
export const APP_URLS = {
  // URLs para desarrollo local - CORREGIDAS
  ERP_APP_URL:
    process.env.NODE_ENV === 'production'
      ? 'https://app-erp.innovapaz.com'
      : 'http://localhost:5175', // ✅ CORREGIDO: ERP en puerto 5175

  MARKETING_APP_URL:
    process.env.NODE_ENV === 'production'
      ? 'https://marketing.innovapaz.com'
      : 'http://localhost:5174', // ✅ CORREGIDO: Marketing en puerto 5174
};

// Nuevo: Base API backend (centralizado)
export const BACKEND_API_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://api.innovapaz.com' // ajustar a tu dominio real
    : 'http://localhost:4000';

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
