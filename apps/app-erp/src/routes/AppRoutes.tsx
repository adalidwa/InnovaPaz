import { Routes, Route } from 'react-router-dom';
import ShoppingRoutes from './shopping/ShoppingRoutes';
import SalesRoutes from './sales/SalesRoutes';

const AppRoutes = () => (
  <Routes>
    <Route path='/shopping/*' element={<ShoppingRoutes />} />
    <Route path='/*' element={<SalesRoutes />} />
  </Routes>
);

export default AppRoutes;
