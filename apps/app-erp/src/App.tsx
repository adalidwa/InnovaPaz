import './App.css';
import AppRoutes from './routes/AppRoutes';
import Input from './components/common/Input';
import { useState } from 'react';
import Select from './components/common/Select';
import Modal from './components/common/Modal';
import Button from './components/common/Button';

function App() {
  const [expiryDate, setExpiryDate] = useState('');
  const [category, setCategory] = useState('');

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
    </>
  );
}

export default App;
