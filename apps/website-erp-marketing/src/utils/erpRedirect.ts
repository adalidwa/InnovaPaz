// Utilidad para manejar redirecciones entre marketing y ERP

export const setERPRedirectFlag = () => {
  localStorage.setItem('redirectToERP', 'true');
};

export const clearERPRedirectFlag = () => {
  localStorage.removeItem('redirectToERP');
};

export const shouldRedirectToERP = (): boolean => {
  return localStorage.getItem('redirectToERP') === 'true';
};

// Función para cuando el usuario haga clic en "Acceder al ERP" desde el marketing
export const goToERP = () => {
  setERPRedirectFlag();
  // Si ya está logueado, la redirección será automática por UserContext
  // Si no está logueado, irá al login y luego al ERP
  window.location.href = import.meta.env.VITE_ERP_URL || 'http://localhost:5175';
};
