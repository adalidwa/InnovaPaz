import { Routes, Route } from 'react-router-dom';
import ShoppingRoutes from './shopping/ShoppingRoutes';
import SalesRoutes from './sales/SalesRoutes';
import ReportsRoutes from './reports/ReportsRoutes';
import UserRoutes from './users/UserRoutes';
import Dashboard from '../features/inventories/pages/Dashboard';

const AppRoutes = () => (
  <Routes>
    <Route path='/*' element={<SalesRoutes />} />
    <Route path='/shopping/*' element={<ShoppingRoutes />} />
    <Route path='/reportes/*' element={<ReportsRoutes />} />
    <Route path='/configuracion/*' element={<UserRoutes />} />
    <Route path='/dashboard' element={<Dashboard />} />
    <Route path='/ventas/*' element={<SalesRoutes />} />
  </Routes>
);

export default AppRoutes;
