import { Routes, Route } from 'react-router-dom';
import ShoppingRoutes from './shopping/ShoppingRoutes';
import ProductManagementRoutes from './inventories/ProductManagementRoutes';
import DashboardRoutes from './inventories/DashboardRoutes';

interface AppRoutesProps {
  subtitle?: string;
}

const AppRoutes: React.FC<AppRoutesProps> = ({ subtitle = 'Sistema' }) => {
  const getBusinessType = (): 'ferreteria' | 'minimarket' | 'licoreria' => {
    const lowerSubtitle = subtitle.toLowerCase();
    if (lowerSubtitle.includes('ferretería') || lowerSubtitle.includes('ferreteria')) {
      return 'ferreteria';
    }
    if (lowerSubtitle.includes('licorería') || lowerSubtitle.includes('licoreria')) {
      return 'licoreria';
    }
    return 'minimarket';
  };

  const businessType = getBusinessType();

  return (
    <Routes>
      <Route path='/shopping/*' element={<ShoppingRoutes businessType={businessType} />} />
      <Route
        path='/productos/*'
        element={<ProductManagementRoutes businessType={businessType} />}
      />
      <Route path='/dashboard/*' element={<DashboardRoutes businessType={businessType} />} />
    </Routes>
  );
};

export default AppRoutes;
