import { Routes, Route } from 'react-router-dom';
import ReportsDashboardPage from '../../features/reports/pages/ReportsDashboardPage';
import SalesReportsPage from '../../features/reports/pages/SalesReportsPage';
import PurchasesReportsPage from '../../features/reports/pages/PurchasesReportsPage';
import InventoryReportsPage from '../../features/reports/pages/InventoryReportsPage';

function ReportsRoutes() {
  return (
    <Routes>
      <Route index element={<ReportsDashboardPage />} />
      <Route path='ventas' element={<SalesReportsPage />} />
      <Route path='compras' element={<PurchasesReportsPage />} />
      <Route path='inventario' element={<InventoryReportsPage />} />
    </Routes>
  );
}

export default ReportsRoutes;
