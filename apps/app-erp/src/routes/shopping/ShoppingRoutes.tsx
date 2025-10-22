import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ShoppingPage from '../../features/shopping/pages/ShoppingPage';
import ProvisioningPage from '../../features/shopping/pages/ProvisioningPage';
import ProvidersPage from '../../features/shopping/pages/ProvidersPage';
import PurchaseOrdersPage from '../../features/shopping/pages/PurchaseOrdersPage';
import ReceptionsPage from '../../features/shopping/pages/ReceptionsPage';
import QuotesPage from '../../features/shopping/pages/QuotesPage';
import ContractsPage from '../../features/shopping/pages/ContractsPage';
import ReportsPage from '../../features/shopping/pages/ReportsPage';

const ShoppingRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<ShoppingPage />} />
      <Route path='provisioning' element={<ProvisioningPage />} />
      <Route path='providers' element={<ProvidersPage />} />
      <Route path='purchase-orders' element={<PurchaseOrdersPage />} />
      <Route path='receptions' element={<ReceptionsPage />} />
      <Route path='quotes' element={<QuotesPage />} />
      <Route path='contracts' element={<ContractsPage />} />
      <Route path='reports' element={<ReportsPage />} />
    </Routes>
  );
};

export default ShoppingRoutes;
