import { Routes, Route } from 'react-router-dom';
import ShoppingRoutes from './shopping/ShoppingRoutes';
import InventariesRoutes from './inventories/InventariesRoutes';

const AppRoutes = () => (
  <Routes>
    <Route path='/shopping/*' element={<ShoppingRoutes />} />
    <Route path='/productos/*' element={<InventariesRoutes />} />
  </Routes>
);

export default AppRoutes;
