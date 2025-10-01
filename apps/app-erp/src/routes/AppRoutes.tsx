import { Routes, Route } from 'react-router-dom';
import ShoppingRoutes from './shopping/ShoppingRoutes';
import ProductManagementRoutes from './inventories/ProductManagementRoutes';
import ReportsRoutes from './reports/ReportsRoutes';
import UserRoutes from './users/UserRoutes';
import SalesRoutes from './sales/SalesRoutes';
import Dashboard from '../features/inventories/pages/Dashboard';

const AppRoutes = () => (
  <Routes>
    <Route path='/*' element={<SalesRoutes />} />
    <Route path='/shopping/*' element={<ShoppingRoutes />} />
    <Route path='/productos/*' element={<ProductManagementRoutes />} />
    <Route path='/reportes/*' element={<ReportsRoutes />} />
    <Route path='/configuracion/*' element={<UserRoutes />} />
    <Route path='/dashboard/*' element={<Dashboard />} />
  </Routes>
);

export default AppRoutes;
