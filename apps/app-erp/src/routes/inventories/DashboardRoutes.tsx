import { Routes, Route } from 'react-router-dom';
import Dashboard from '../../features/inventories/pages/Dashboard';
function DashboardRoutes() {
  return (
    <Routes>
      <Route index element={<Dashboard />} />
    </Routes>
  );
}

export default DashboardRoutes;
