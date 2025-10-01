import { Routes, Route } from 'react-router-dom';
import ShoppingRoutes from './shopping/ShoppingRoutes';
import ProductManagementRoutes from './inventories/ProductManagementRoutes';

const AppRoutes = () => (
  <Routes>
    <Route path='/shopping/*' element={<ShoppingRoutes />} />
    <Route path='/productos/*' element={<ProductManagementRoutes />} />
  </Routes>
);

export default AppRoutes;
