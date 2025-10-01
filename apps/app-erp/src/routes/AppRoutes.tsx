import { Routes, Route } from 'react-router-dom';
import ShoppingRoutes from './shopping/ShoppingRoutes';
import SalesRoutes from './sales/SalesRoutes';
import InventariesRoutes from './inventories/InventariesRoutes';
import ReportsRoutes from './reports/ReportsRoutes';
import UserRoutes from './users/UserRoutes';

const AppRoutes = () => (
  <Routes>
    <Route path='/shopping/*' element={<ShoppingRoutes />} />
    <Route path='/*' element={<SalesRoutes />} />
    <Route path='/productos/*' element={<InventariesRoutes />} />
    <Route path='/reportes/*' element={<ReportsRoutes />} />
    <Route path='/configuracion/*' element={<UserRoutes />} />
  </Routes>
);

export default AppRoutes;
