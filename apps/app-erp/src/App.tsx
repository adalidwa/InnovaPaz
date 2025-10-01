import './App.css';
import AppRoutes from './routes/AppRoutes';
import Input from './components/common/Input';
import { useState } from 'react';

function App() {
  const [expiryDate, setExpiryDate] = useState('');
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
    </>
  );
}

export default App;
