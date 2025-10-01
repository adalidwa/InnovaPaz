import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ShoppingPage from '../../features/shopping/pages/ShoppingPage';
import ProvisioningPage from '../../features/shopping/pages/ProvisioningPage';
import ProvidersPage from '../../features/shopping/pages/ProvidersPage';

const ShoppingRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<ShoppingPage />} />
      <Route path='provisioning' element={<ProvisioningPage />} />
      <Route path='providers' element={<ProvidersPage />} />
    </Routes>
  );
};

export default ShoppingRoutes;
