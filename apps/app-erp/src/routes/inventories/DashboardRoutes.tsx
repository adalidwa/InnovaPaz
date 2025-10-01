import { Routes, Route } from 'react-router-dom';
import Dashboard from '../../features/inventories/pages/Dashboard';

interface DashboardRoutesProps {
  businessType?: 'ferreteria' | 'minimarket' | 'licoreria';
}

const DashboardRoutes: React.FC<DashboardRoutesProps> = ({ businessType }) => (
  <Routes>
    <Route path='/' element={<Dashboard businessType={businessType} />} />
  </Routes>
);

export default DashboardRoutes;
