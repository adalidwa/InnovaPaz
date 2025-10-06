import { Routes, Route } from 'react-router-dom';
import ShoppingRoutes from './shopping/ShoppingRoutes';
import ProductManagementRoutes from './inventories/ProductManagementRoutes';
import Dashboard from '../features/inventories/pages/Dashboard';
import ReportsRoutes from './reports/ReportsRoutes';
import SalesRoutes from './sales/SalesRoutes';
import UserRoutes from './users/UserRoutes';

const AppRoutes = () => (
  <Routes>
    <Route path='/*' element={<SalesRoutes />} />
    <Route path='/*' element={<SalesRoutes />} />
    <Route path='/shopping/*' element={<ShoppingRoutes />} />
    <Route path='/productos/*' element={<ProductManagementRoutes />} />
    <Route path='/reportes/*' element={<ReportsRoutes />} />
    <Route path='/configuracion/*' element={<UserRoutes />} />
    <Route path='/dashboard/*' element={<Dashboard />} />
    <Route path='/dashboard' element={<Dashboard />} />
    <Route path='/ventas/*' element={<SalesRoutes />} />
  </Routes>
);

export default AppRoutes;
