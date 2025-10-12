import { Routes, Route, Navigate } from 'react-router-dom';
import ShoppingRoutes from './shopping/ShoppingRoutes';
import ProductManagementRoutes from './inventories/ProductManagementRoutes';
import SalesRoutes from './sales/SalesRoutes';
import ReportsRoutes from './reports/ReportsRoutes';
import UserRoutes from './users/UserRoutes';
import Dashboard from '../features/inventories/pages/Dashboard';

const AppRoutes = () => (
  <Routes>
    <Route path='/' element={<Navigate to='/configuracion' replace />} />
    <Route path='/shopping/*' element={<ShoppingRoutes />} />
    <Route path='/productos/*' element={<ProductManagementRoutes />} />
    <Route path='/ventas/*' element={<SalesRoutes />} />
    <Route path='/reportes/*' element={<ReportsRoutes />} />
    <Route path='/configuracion/*' element={<UserRoutes />} />
    <Route path='/dashboard' element={<Dashboard />} />
    <Route path='*' element={<Navigate to='/configuracion' replace />} />
  </Routes>
);

export default AppRoutes;
