import { Routes, Route } from 'react-router-dom';

import Home from '../features/inventories/pages/Home';

// Componente temporal para probar las rutas

const AppRoutes = () => (
  <Routes>
    <Route path='/' element={<Home />} />
    {/* Aquí se importan y usan las rutas de cada módulo */}
    {/* <Route path="/users/*" element={<UsersRoutes />} /> */}
    {/* <Route path="/sales/*" element={<SalesRoutes />} /> */}
    {/* ...otras rutas... */}
  </Routes>
);

export default AppRoutes;
