import { Routes, Route } from 'react-router-dom';
import ReportsDashboardPage from '../../features/reports/pages/ReportsDashboardPage';
import SalesReportsPage from '../../features/reports/pages/SalesReportsPage';
import PurchasesReportsPage from '../../features/reports/pages/PurchasesReportsPage';
import InventoryReportsPage from '../../features/reports/pages/InventoryReportsPage';
import AdvancedReportsPage from '../../features/reports/pages/AdvancedReportsPage';

function ReportsRoutes() {
  return (
    <Routes>
      <Route index element={<ReportsDashboardPage />} />
      <Route path='ventas' element={<SalesReportsPage />} />
      <Route path='compras' element={<PurchasesReportsPage />} />
      <Route path='inventario' element={<InventoryReportsPage />} />
      <Route path='avanzados' element={<AdvancedReportsPage />} />
    </Routes>
  );
}

export default ReportsRoutes;
