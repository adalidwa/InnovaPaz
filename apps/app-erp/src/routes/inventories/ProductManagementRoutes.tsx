import { Routes, Route } from 'react-router-dom';
import ProductManagement from '../../features/inventories/pages/ProductManagement';
import Dashboard from '../../features/inventories/pages/Dashboard';
import SeeInventories from '../../features/inventories/pages/SeeInventories';

function ProductManagementRoutes() {
  return (
    <Routes>
      <Route index element={<ProductManagement />} />
      <Route path='dashboard' element={<Dashboard />} />
      <Route path='ver' element={<SeeInventories />} />
    </Routes>
  );
}

export default ProductManagementRoutes;
