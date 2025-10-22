import { Routes, Route } from 'react-router-dom';
import MovementsPage from '../../features/sales/pages/MovementsPage';

const SalesRoutes = () => (
  <Routes>
    <Route path='/' element={<MovementsPage />} />
  </Routes>
);

export default SalesRoutes;
