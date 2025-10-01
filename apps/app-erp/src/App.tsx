import './App.css';
import AppRoutes from './routes/AppRoutes';
import Input from './components/common/Input';
import SearchProducts from './components/common/SearchProducts';
import ProductCard, { type Product } from './components/common/ProductCard';
import { useState } from 'react';
import Select from './components/common/Select';
import { BiUser, BiPhone, BiEnvelope, BiCheck } from 'react-icons/bi';
import ProductManagement from './features/inventories/pages/ProductManagement';

function App() {
  return (
    <div>
      <ProductManagement />
    </div>
  );
}

export default App;
