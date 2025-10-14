import './App.css';
import AppRoutes from './routes/AppRoutes';
import Layout from './components/layout/Layout';
import { getSidebarConfig } from './config/sidebarConfigs';
import { useLocation } from 'react-router-dom';
import { CompanyConfigProvider } from './contexts/CompanyConfigContext';
import { useMemo } from 'react';
import { useUser } from './features/users/hooks/useContextBase';

function App() {
  const location = useLocation();
  const { user, loading } = useUser();
  // Solo tomamos empresaId si el usuario está logueado y tiene empresa_id
  const empresaId = user?.empresa_id || '';

  // Detectar si estamos en la ruta de login
  const isLoginRoute = useMemo(() => location.pathname === '/login', [location.pathname]);

  const getCurrentModule = (): string => {
    const path = location.pathname;
    if (path.startsWith('/ventas')) return 'ventas';
    return 'inventario';
  };

  const currentModule = getCurrentModule();
  const sidebarConfig = getSidebarConfig(currentModule);
  const subtitle = 'Ferretería';

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          fontSize: '18px',
        }}
      >
        Cargando...
      </div>
    );
  }

  if (isLoginRoute) {
    return <AppRoutes />;
  }

  if (!empresaId) {
    window.location.href = '/login';
    return null;
  }

  return (
    <CompanyConfigProvider empresaId={empresaId}>
      <Layout
        subtitle={subtitle}
        sidebarTitle={sidebarConfig.title}
        sidebarTitleIcon={sidebarConfig.titleIcon}
        sidebarMenuItems={sidebarConfig.menuItems}
      >
        <AppRoutes />
      </Layout>
    </CompanyConfigProvider>
  );
}

export default App;
