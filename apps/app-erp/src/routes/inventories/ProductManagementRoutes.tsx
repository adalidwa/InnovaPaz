import { Routes, Route } from 'react-router-dom';
import { ProductsProvider } from '../../features/inventories/context/ProductsContext';
import ProductManagement from '../../features/inventories/pages/ProductManagement';
import SeeInventories from '../../features/inventories/pages/SeeInventories';

function ProductManagementRoutes() {
  return (
    <ProductsProvider>
      <Routes>
        <Route index element={<ProductManagement />} />
        <Route path='ver' element={<SeeInventories />} />
        <Route path='ver/:id' element={<SeeInventories />} />
      </Routes>
    </ProductsProvider>
  );
}

export default ProductManagementRoutes;
