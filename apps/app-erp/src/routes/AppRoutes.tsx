import { Routes, Route } from 'react-router-dom';
import ShoppingRoutes from './shopping/ShoppingRoutes';
import ProductManagementRoutes from './inventories/ProductManagementRoutes';
import DashboardRoutes from './inventories/DashboardRoutes';

const AppRoutes = () => (
  <Routes>
    <Route path='/shopping/*' element={<ShoppingRoutes />} />
    <Route path='/productos/*' element={<ProductManagementRoutes />} />
    <Route path='/dashboard/*' element={<DashboardRoutes />} />
  </Routes>
);

export default AppRoutes;
