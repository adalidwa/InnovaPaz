import './App.css';
import AppRoutes from './routes/AppRoutes';
import Input from './components/common/Input';
import { useState } from 'react';
import Select from './components/common/Select';

function App() {
  const [expiryDate, setExpiryDate] = useState('');
  const [category, setCategory] = useState('');

  const categories = [
    { value: 'electronics', label: 'Electrónica' },
    { value: 'clothing', label: 'Ropa' },
    { value: 'food', label: 'Alimentos' },
    { value: 'furniture', label: 'Muebles' },
  ];
  return (
    <>
      <AppRoutes />
      <Input label='Descripción' placeholder='Descripción del producto...' />
      <Input
        label='Válido Hasta'
        type='date'
        value={expiryDate}
        onChange={(e) => setExpiryDate(e.target.value)}
      />
      <Select
        label='Categoría'
        options={categories}
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        required
      />
    </>
  );
}

export default App;
