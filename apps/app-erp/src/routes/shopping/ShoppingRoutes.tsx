import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ShoppingPage from '../../features/shopping/pages/ShoppingPage';

const ShoppingRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<ShoppingPage />} />
    </Routes>
  );
};

export default ShoppingRoutes;
