import './App.css';
import AppRoutes from './routes/AppRoutes';
import Input from './components/common/Input';
import SearchProducts from './components/common/SearchProducts';
import { useState } from 'react';
import Select from './components/common/Select';
import { BiUser, BiLock, BiPhone, BiEnvelope, BiCheck } from 'react-icons/bi';

function App() {
  const [expiryDate, setExpiryDate] = useState('');
  const [category, setCategory] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const categories = [
    { value: 'electronics', label: 'Electrónica' },
    { value: 'clothing', label: 'Ropa' },
    { value: 'food', label: 'Alimentos' },
    { value: 'furniture', label: 'Muebles' },
  ];

  const handleSearch = (searchTerm: string) => {
    console.log('Buscando productos:', searchTerm);
  };

  return (
    <div
      style={{
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        maxWidth: '800px',
        margin: '0 auto',
      }}
    >
      <AppRoutes />

      <SearchProducts onSearch={handleSearch} />

      {/* Input con icono izquierdo */}
      <Input
        label='Usuario'
        placeholder='Ingresa tu usuario...'
        leftIcon={<BiUser size={20} />}
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      {/* Input con icono derecho */}
      <Input
        label='Contraseña'
        type='password'
        placeholder='Ingresa tu contraseña...'
        rightIcon={<BiLock size={20} />}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {/* Input con ambos iconos */}
      <Input
        label='Teléfono'
        placeholder='Número de teléfono...'
        leftIcon={<BiPhone size={20} />}
        rightIcon={<BiCheck size={20} />}
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      {/* Input original sin iconos */}
      <Input label='Descripción' placeholder='Descripción del producto...' />

      {/* Input tipo date */}
      <Input
        label='Válido Hasta'
        type='date'
        value={expiryDate}
        onChange={(e) => setExpiryDate(e.target.value)}
      />

      {/* Select component */}
      <Select
        label='Categoría'
        options={categories}
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        required
      />

      {/* Email input con icono */}
      <Input
        label='Email'
        type='email'
        placeholder='tu@email.com'
        leftIcon={<BiEnvelope size={20} />}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
    </div>
  );
}

export default App;
