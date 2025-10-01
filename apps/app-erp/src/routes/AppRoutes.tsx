import { Routes, Route } from 'react-router-dom';
import ShoppingRoutes from './shopping/ShoppingRoutes';
import ProductManagementRoutes from './inventories/ProductManagementRoutes';
import ReportsRoutes from './reports/ReportsRoutes';
import UserRoutes from './users/UserRoutes';

const AppRoutes = () => (
  <Routes>
    <Route path='/shopping/*' element={<ShoppingRoutes />} />
    <Route path='/productos/*' element={<ProductManagementRoutes />} />
    <Route path='/reportes/*' element={<ReportsRoutes />} />
    <Route path='/configuracion/*' element={<UserRoutes />} />
  </Routes>
);

export default AppRoutes;
