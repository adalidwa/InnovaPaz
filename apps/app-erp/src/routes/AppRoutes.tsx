import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import ShoppingRoutes from './shopping/ShoppingRoutes';
import ProductManagementRoutes from './inventories/ProductManagementRoutes';
import SalesRoutes from './sales/SalesRoutes';
import ReportsRoutes from './reports/ReportsRoutes';
import UserRoutes from './users/UserRoutes';
import Dashboard from '../features/inventories/pages/Dashboard';
import LoginPage from '../features/users/pages/LoginPage';

import React from 'react';

const ProtectedRoutes: React.FC = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to='/login' replace />;
  }
  return <Outlet />;
};

const AppRoutes = () => (
  <Routes>
    <Route path='/login' element={<LoginPage />} />
    <Route element={<ProtectedRoutes />}>
      <Route path='/' element={<Navigate to='/app-erp/configuracion/empresa#general' replace />} />
      <Route path='/app-erp/shopping/*' element={<ShoppingRoutes />} />
      <Route path='/app-erp/productos/*' element={<ProductManagementRoutes />} />
      <Route path='/app-erp/ventas/*' element={<SalesRoutes />} />
      <Route path='/app-erp/reportes/*' element={<ReportsRoutes />} />
      <Route path='/app-erp/configuracion/*' element={<UserRoutes />} />
      <Route path='/app-erp/dashboard' element={<Dashboard />} />
    </Route>
    <Route path='*' element={<Navigate to='/app-erp/configuracion/empresa#general' replace />} />
  </Routes>
);

export default AppRoutes;
