// Configuración de URLs de las aplicaciones
export const APP_URLS = {
  // URLs para desarrollo local
  ERP_APP_URL:
    process.env.NODE_ENV === 'production'
      ? 'https://app-erp.innovapaz.com' // URL de producción (cambiar por la real)
      : 'http://localhost:5175', // URL de desarrollo local

  MARKETING_APP_URL:
    process.env.NODE_ENV === 'production'
      ? 'https://marketing.innovapaz.com' // URL de producción (cambiar por la real)
      : 'http://localhost:5174', // URL de desarrollo local
};

// Rutas específicas para redirección
export const ERP_ROUTES = {
  DASHBOARD: '/dashboard',
  LOGIN: '/login',
  HOME: '/',
};

// Función helper para construir URLs completas
export const buildERPUrl = (route: string = ERP_ROUTES.DASHBOARD): string => {
  return `${APP_URLS.ERP_APP_URL}${route}`;
};
