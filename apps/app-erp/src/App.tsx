import './App.css';
import AppRoutes from './routes/AppRoutes';
import Input from './components/common/Input';
import SearchProducts from './components/common/SearchProducts';
import { useState } from 'react';
import Select from './components/common/Select';
import { BiUser, BiLock, BiPhone, BiEnvelope, BiCheck } from 'react-icons/bi';
import Modal from './components/common/Modal';
import Button from './components/common/Button';

function App() {
  const [expiryDate, setExpiryDate] = useState('');
  const [category, setCategory] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

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

      <Button onClick={() => setShowInfoModal(true)}>Show Info Modal</Button>
      <Button onClick={() => setShowSuccessModal(true)} variant='success'>
        Show Success Modal
      </Button>
      <Button onClick={() => setShowWarningModal(true)} variant='warning'>
        Show Warning Modal
      </Button>
      <Button onClick={() => setShowErrorModal(true)} variant='accent'>
        Show Error Modal
      </Button>

      <Modal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        title='Information'
        message='This is an informational message to provide context or details about a specific action or state.'
        modalType='info'
        confirmButtonText='Entendido'
      />

      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title='Success'
        message='Your operation has been completed successfully. All changes have been saved.'
        modalType='success'
        confirmButtonText='Bien!'
      />

      <Modal
        isOpen={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        title='Warning'
        message='This action may have unintended consequences. Are you sure you want to proceed?'
        modalType='warning'
        confirmButtonText='Proceder'
        showCancelButton={true}
        cancelButtonText='Cancelar'
        onConfirm={() => {
          console.log('User confirmed warning');
          setShowWarningModal(false);
        }}
        onCancel={() => {
          console.log('User cancelled');
          setShowWarningModal(false);
        }}
      />

      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title='Error'
        message='An unexpected error occurred while processing your request. Please try again later.'
        modalType='error'
        confirmButtonText='Intentar otra vez'
        showCancelButton={true}
        cancelButtonText='Cancelar'
        size='small'
      />
    </div>
  );
}

export default App;
