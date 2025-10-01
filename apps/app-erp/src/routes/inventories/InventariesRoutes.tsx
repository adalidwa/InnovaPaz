import { Routes, Route } from 'react-router-dom';
import ProductManagement from '../../features/inventories/pages/ProductManagement';
import Dashboard from '../../features/inventories/pages/Dashboard';
function InventariesRoutes() {
  return (
    <Routes>
      <Route index element={<ProductManagement />} />
      <Route path='dashboard' element={<Dashboard />} />
    </Routes>
  );
}

export default InventariesRoutes;
