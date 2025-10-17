import { useState } from 'react';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import CartItem from './CartItem';
import CartSummary from './CartSummary';
import PaymentMethod from './PaymentMethod';
import ClientSelector, { type Client } from './ClientSelector';
import SalesService from '../services/salesService';
import './SalesCart.css';

interface CartItemData {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface SalesCartProps {
  cartItems?: CartItemData[];
  onQuantityChange?: (itemId: string, newQuantity: number) => void;
  onRemoveItem?: (itemId: string) => void;
  onProcessSale?: (saleData: any) => void;
  onCancel?: () => void;
}

function SalesCart({
  cartItems = [],
  onQuantityChange,
  onRemoveItem,
  onProcessSale,
  onCancel,
}: SalesCartProps) {
  // Carrito inicia vacío - no hay productos precargados
  const [internalCartItems, setInternalCartItems] = useState<CartItemData[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isProcessing, setIsProcessing] = useState(false);

  // Estados para modales
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [saleDetails, setSaleDetails] = useState<{
    total: number;
    clientName: string;
    paymentMethod: string;
  } | null>(null);

  const taxRate = 0.13; // 13% tax

  const currentCartItems = cartItems.length > 0 ? cartItems : internalCartItems;

  const calculateSubtotal = () => {
    return currentCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const calculateTaxAmount = () => {
    return calculateSubtotal() * taxRate;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTaxAmount();
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (onQuantityChange) {
      onQuantityChange(itemId, newQuantity);
    } else {
      setInternalCartItems((items) =>
        items.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item))
      );
    }
  };

  const handleRemoveItem = (itemId: string) => {
    if (onRemoveItem) {
      onRemoveItem(itemId);
    } else {
      setInternalCartItems((items) => items.filter((item) => item.id !== itemId));
    }
  };

  const getPaymentMethodLabel = (method: string): string => {
    const labels: Record<string, string> = {
      cash: 'Efectivo',
      credit: 'Tarjeta de Crédito',
      debit: 'Tarjeta de Débito',
      transfer: 'Transferencia',
    };
    return labels[method] || method;
  };

  const handleProcessSale = async () => {
    // Validaciones
    if (!selectedClient) {
      setModalMessage('Por favor selecciona un cliente');
      setShowWarningModal(true);
      return;
    }

    if (currentCartItems.length === 0) {
      setModalMessage('El carrito está vacío. Agrega productos para continuar.');
      setShowWarningModal(true);
      return;
    }

    setIsProcessing(true);

    try {
      const subtotal = calculateSubtotal();
      const total = calculateTotal();

      const saleData = {
        clientId: selectedClient.id,
        products: currentCartItems.map((item) => ({
          id: parseInt(item.id),
          name: item.name,
          code: item.id,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity,
        })),
        subtotal,
        discount: 0,
        total,
        paymentMethod,
      };

      console.log('📤 Enviando venta al backend:', saleData);

      // Crear la venta en el backend
      await SalesService.createSale(saleData);

      console.log('✅ Venta procesada exitosamente');

      // Guardar detalles para el modal
      setSaleDetails({
        total,
        clientName: selectedClient.name,
        paymentMethod: getPaymentMethodLabel(paymentMethod),
      });

      // Limpiar el carrito y cliente
      if (onProcessSale) {
        onProcessSale(saleData);
      } else {
        setInternalCartItems([]);
        setSelectedClient(null);
        setPaymentMethod('cash');
      }

      // Mostrar modal de éxito
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('❌ Error al procesar venta:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Error desconocido al procesar la venta';
      setModalMessage(`${errorMessage}\n\nPor favor, intenta nuevamente.`);
      setShowErrorModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      if (currentCartItems.length > 0) {
        const confirmCancel = confirm(
          '¿Estás seguro de cancelar la venta? Se perderán los productos del carrito.'
        );
        if (!confirmCancel) return;
      }
      setInternalCartItems([]);
      setSelectedClient(null);
      setPaymentMethod('cash');
    }
  };

  const subtotal = calculateSubtotal();
  const taxAmount = calculateTaxAmount();
  const total = calculateTotal();

  return (
    <>
      <div className='sales-cart'>
        <div className='sales-cart__container'>
          <div className='sales-cart__header'>
            <div className='sales-cart__title-section'>
              <div className='sales-cart__icon'>
                <svg width='24' height='24' viewBox='0 0 24 24' fill='currentColor'>
                  <path d='M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z' />
                </svg>
              </div>
              <h2 className='sales-cart__title'>Carrito de Venta</h2>
            </div>
          </div>

          <div className='sales-cart__content'>
            <div className='sales-cart__section'>
              <ClientSelector onSelectClient={setSelectedClient} selectedClient={selectedClient} />
            </div>

            <div className='sales-cart__section'>
              <div className='sales-cart__items'>
                {currentCartItems.length === 0 ? (
                  <div className='sales-cart__empty'>
                    <div className='sales-cart__empty-icon'>
                      <svg width='48' height='48' viewBox='0 0 24 24' fill='currentColor'>
                        <path d='M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z' />
                      </svg>
                    </div>
                    <p className='sales-cart__empty-text'>No hay productos en el carrito</p>
                    <p className='sales-cart__empty-hint'>Agrega productos desde la lista</p>
                  </div>
                ) : (
                  currentCartItems.map((item) => (
                    <CartItem
                      key={item.id}
                      id={item.id}
                      name={item.name}
                      price={item.price}
                      quantity={item.quantity}
                      onQuantityChange={handleQuantityChange}
                      onRemove={handleRemoveItem}
                    />
                  ))
                )}
              </div>

              {currentCartItems.length > 0 && (
                <>
                  <CartSummary
                    subtotal={subtotal}
                    taxRate={taxRate}
                    taxAmount={taxAmount}
                    total={total}
                  />

                  <PaymentMethod
                    value={paymentMethod}
                    onChange={setPaymentMethod}
                    disabled={isProcessing}
                  />
                </>
              )}
            </div>

            {currentCartItems.length > 0 && (
              <div className='sales-cart__actions'>
                <Button
                  variant='secondary'
                  fullWidth
                  onClick={handleCancel}
                  disabled={isProcessing}
                  className='sales-cart__cancel-btn'
                >
                  Cancelar
                </Button>
                <Button
                  variant='primary'
                  fullWidth
                  onClick={handleProcessSale}
                  loading={isProcessing}
                  disabled={currentCartItems.length === 0 || !selectedClient || isProcessing}
                  className='sales-cart__process-btn'
                >
                  {isProcessing ? 'Procesando...' : 'Procesar Venta'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Éxito */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title='¡Venta Procesada Exitosamente!'
        message=''
        modalType='success'
        confirmButtonText='Aceptar'
      >
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
            La venta se ha registrado correctamente
          </p>
          {saleDetails && (
            <div
              style={{
                textAlign: 'left',
                background: '#f5f5f5',
                padding: '1rem',
                borderRadius: '8px',
              }}
            >
              <p>
                <strong>Total:</strong> Bs. {saleDetails.total.toFixed(2)}
              </p>
              <p>
                <strong>Cliente:</strong> {saleDetails.clientName}
              </p>
              <p>
                <strong>Método de pago:</strong> {saleDetails.paymentMethod}
              </p>
            </div>
          )}
        </div>
      </Modal>

      {/* Modal de Error */}
      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title='Error al Procesar Venta'
        message={modalMessage}
        modalType='error'
        confirmButtonText='Entendido'
      />

      {/* Modal de Advertencia */}
      <Modal
        isOpen={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        title='Atención'
        message={modalMessage}
        modalType='warning'
        confirmButtonText='Entendido'
      />
    </>
  );
}

export default SalesCart;
