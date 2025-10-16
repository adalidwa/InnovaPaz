import { useState } from 'react';
import Button from '../../../components/common/Button';
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

const mockCartItems: CartItemData[] = [
  {
    id: '1',
    name: 'Arroz Paisana 1kg',
    price: 12.0,
    quantity: 1,
  },
];

function SalesCart({
  cartItems = mockCartItems,
  onQuantityChange,
  onRemoveItem,
  onProcessSale,
  onCancel,
}: SalesCartProps) {
  const [internalCartItems, setInternalCartItems] = useState<CartItemData[]>(mockCartItems);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isProcessing, setIsProcessing] = useState(false);

  const taxRate = 0.13; // 13% tax

  const currentCartItems = cartItems || internalCartItems;

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

  const handleProcessSale = async () => {
    if (!selectedClient) {
      alert('Por favor selecciona un cliente');
      return;
    }

    if (currentCartItems.length === 0) {
      alert('El carrito está vacío');
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
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity,
        })),
        subtotal,
        discount: 0,
        total,
        paymentMethod,
      };

      await SalesService.createSale(saleData);

      if (onProcessSale) {
        onProcessSale(saleData);
      } else {
        setInternalCartItems([]);
        setSelectedClient(null);
        setPaymentMethod('cash');
      }

      alert('¡Venta procesada exitosamente!');
    } catch (error: any) {
      console.error('Error al procesar venta:', error);
      alert(error.message || 'Error al procesar la venta');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      setInternalCartItems([]);
      setSelectedClient(null);
      setPaymentMethod('cash');
    }
  };

  const subtotal = calculateSubtotal();
  const taxAmount = calculateTaxAmount();
  const total = calculateTotal();

  return (
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
                disabled={currentCartItems.length === 0 || !selectedClient}
                className='sales-cart__process-btn'
              >
                {isProcessing ? 'Procesando...' : 'Procesar Venta'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SalesCart;
