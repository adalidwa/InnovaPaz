import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ShoppingPage from '../../features/shopping/pages/ShoppingPage';
import ProvisioningPage from '../../features/shopping/pages/ProvisioningPage';

const ShoppingRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<ShoppingPage />} />
      <Route path='provisioning' element={<ProvisioningPage />} />
    </Routes>
  );
};

export default ShoppingRoutes;
