import { Routes, Route } from 'react-router-dom';
import ProductManagement from '../../features/inventories/pages/ProductManagement';

function InventariesRoutes() {
  return (
    <Routes>
      <Route index element={<ProductManagement />} />
    </Routes>
  );
}

export default InventariesRoutes;
