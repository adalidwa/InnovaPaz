import './App.css';
import AppRoutes from './routes/AppRoutes';
import Input from './components/common/Input';
import SearchProducts from './components/common/SearchProducts';
import ProductCard, { type Product } from './components/common/ProductCard';
import { useState } from 'react';
import Select from './components/common/Select';
import { BiUser, BiPhone, BiEnvelope, BiCheck } from 'react-icons/bi';

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

  // Productos de ejemplo basados en la imagen
  const sampleProducts: Product[] = [
    {
      id: '1',
      code: 'COC500',
      name: 'Coca Cola 500ml',
      price: 3.5,
      stock: 48,
      currency: 'Bs.',
    },
    {
      id: '2',
      code: 'ARR1KG',
      name: 'Arroz Paisana 1kg',
      price: 12.0,
      stock: 15,
      currency: 'Bs.',
    },
    {
      id: '3',
      code: 'PAC355',
      name: 'Cerveza Paceña 355ml',
      price: 8.5,
      stock: 72,
      currency: 'Bs.',
    },
    {
      id: '4',
      code: 'OUT001',
      name: 'Producto sin Stock',
      price: 15.0,
      stock: 0,
      currency: 'Bs.',
    },
  ];

  const handleSearch = (searchTerm: string) => {
    console.log('Buscando productos:', searchTerm);
  };

  const handleAddToCart = (product: Product, quantity: number) => {
    console.log(`Producto agregado al carrito:`, {
      product: product.name,
      code: product.code,
      quantity: quantity,
      total: product.price * quantity,
    });
    // Aquí implementarías la lógica real para agregar al carrito
    // como actualizar el estado global, localStorage, etc.
  };

  return (
    <div
      style={{
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      <AppRoutes />

      {/* Sección de Product Cards */}
      <div style={{ marginTop: '2rem' }}>
        <h2
          style={{
            color: 'var(--pri-800)',
            marginBottom: '1.5rem',
            fontSize: 'var(--font-25)',
            fontWeight: '600',
          }}
        >
          📦 Product Cards Demo
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px',
            marginBottom: '3rem',
            padding: '20px',
            backgroundColor: 'var(--bg-50)',
            borderRadius: '12px',
          }}
        >
          {sampleProducts.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
          ))}
        </div>
      </div>

      <hr style={{ border: '1px solid var(--pri-100)', margin: '2rem 0' }} />

      {/* Componentes existentes */}
      <h2
        style={{
          color: 'var(--pri-800)',
          marginBottom: '1.5rem',
          fontSize: 'var(--font-25)',
          fontWeight: '600',
        }}
      >
        🛠️ Otros Componentes
      </h2>

      {/* Componente SearchProducts */}
      <SearchProducts onSearch={handleSearch} />

      {/* Input con icono izquierdo */}
      <Input
        label='Usuario'
        placeholder='Ingresa tu usuario...'
        leftIcon={<BiUser size={20} />}
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      {/* Input password - ahora con ojo automático */}
      <Input
        label='Contraseña'
        type='password'
        placeholder='Ingresa tu contraseña...'
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

      {/* Otro input password para probar */}
      <Input
        label='Confirmar Contraseña'
        type='password'
        placeholder='Confirma tu contraseña...'
        leftIcon={<BiUser size={20} />}
      />
    </div>
  );
}

export default App;
