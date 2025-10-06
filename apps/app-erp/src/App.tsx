import './App.css';
import AppRoutes from './routes/AppRoutes';
import Layout from './components/layout/Layout';
import { getSidebarConfig } from './config/sidebarConfigs';
import { useLocation } from 'react-router-dom';

function App() {
  const location = useLocation();

  const getCurrentModule = (): string => {
    const path = location.pathname;
    if (path.startsWith('/ventas')) return 'ventas';
    return 'inventario';
  };

  const currentModule = getCurrentModule();
  const sidebarConfig = getSidebarConfig(currentModule);
  const subtitle = 'Ferretería'; // This could come from user settings, API, etc.

  return (
    <Layout
      subtitle={subtitle}
      sidebarTitle={sidebarConfig.title}
      sidebarTitleIcon={sidebarConfig.titleIcon}
      sidebarMenuItems={sidebarConfig.menuItems}
    >
      <AppRoutes subtitle={subtitle} />
    </Layout>
  );
}

export default App;
