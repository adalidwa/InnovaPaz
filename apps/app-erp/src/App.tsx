import './App.css';
import AppRoutes from './routes/AppRoutes';
import Layout from './components/layout/Layout';
import { getSidebarConfig } from './config/sidebarConfigs';
import { useLocation } from 'react-router-dom';
import { CompanyConfigProvider } from './contexts/CompanyConfigContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { useMemo } from 'react';
import { useUser } from './features/users/hooks/useContextBase';

function App() {
  const location = useLocation();
  const { user, loading } = useUser();
  const empresaId = user?.empresa_id || '';

  const isLoginRoute = useMemo(() => location.pathname === '/login', [location.pathname]);

  const currentModule = 'dashboard';
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
    return (
      <ThemeProvider>
        <AppRoutes />
      </ThemeProvider>
    );
  }

  if (!empresaId) {
    window.location.href = '/login';
    return null;
  }

  return (
    <ThemeProvider>
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
    </ThemeProvider>
  );
}

export default App;
