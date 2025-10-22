import { useState } from 'react';
import { type Product } from '../types';
import { BsPlus } from 'react-icons/bs';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import StatusTag from '../../../components/common/StatusTag';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product, quantity: number) => void;
  className?: string;
}

function ProductCard({ product, onAddToCart, className = '' }: ProductCardProps) {
  const [showQuantityInput, setShowQuantityInput] = useState(false);
  const [quantity, setQuantity] = useState('1');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [addedQuantity, setAddedQuantity] = useState(0);

  const handleAddClick = () => {
    if (!showQuantityInput) {
      setShowQuantityInput(true);
      return;
    }

    const qty = parseInt(quantity, 10) || 1;
    if (qty > 0 && qty <= product.stock) {
      // Guardar cantidad agregada para el modal
      setAddedQuantity(qty);

      // Ejecutar callback si existe
      onAddToCart?.(product, qty);

      // Resetear estado del input
      setShowQuantityInput(false);
      setQuantity('1');

      // Mostrar modal de éxito
      setShowSuccessModal(true);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || (parseInt(value, 10) >= 1 && parseInt(value, 10) <= product.stock)) {
      setQuantity(value);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddClick();
    }
    if (e.key === 'Escape') {
      setShowQuantityInput(false);
      setQuantity('1');
    }
  };

  const handleCancel = () => {
    setShowQuantityInput(false);
    setQuantity('1');
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
  };

  // Determinar colores del stock según disponibilidad
  const getStockColors = () => {
    if (product.stock === 0) {
      return {
        backgroundColor: 'var(--acc-50)',
        textColor: 'var(--acc-600)',
      };
    } else if (product.stock <= 10) {
      return {
        backgroundColor: 'var(--var-50)',
        textColor: 'var(--var-800)',
      };
    } else {
      return {
        backgroundColor: 'var(--sec-100)',
        textColor: 'var(--sec-700)',
      };
    }
  };

  const stockColors = getStockColors();

  return (
    <>
      <div className={`product-card-sales ${className}`}>
        <div className='product-card-sales__header'>
          <StatusTag
            text={product.code}
            backgroundColor='var(--pri-100)'
            textColor='var(--pri-600)'
            width='auto'
            height={24}
            radius={6}
            uppercase={true}
            className='product-card-sales__code-tag'
          />

          <StatusTag
            text={`Stock: ${product.stock}`}
            backgroundColor={stockColors.backgroundColor}
            textColor={stockColors.textColor}
            width='auto'
            height={24}
            radius={6}
            className='product-card-sales__stock-tag'
          />
        </div>

        <div className='product-card-sales__content'>
          <h3 className='product-card-sales__title'>{product.name}</h3>
          <div className='product-card-sales__price'>
            {'Bs.'} {product.price.toFixed(2)}
          </div>
        </div>

        <div className='product-card-sales__actions'>
          {showQuantityInput ? (
            <div className='product-card-sales__quantity-section'>
              <div className='product-card-sales__quantity-input'>
                <Input
                  type='number'
                  value={quantity}
                  onChange={handleQuantityChange}
                  onKeyDown={handleKeyPress}
                  min='1'
                  max={product.stock.toString()}
                  placeholder='Cantidad'
                  autoFocus
                />
              </div>
              <div className='product-card-sales__quantity-actions'>
                <Button
                  variant='outline'
                  size='small'
                  onClick={handleCancel}
                  className='product-card-sales__cancel-btn'
                >
                  Cancelar
                </Button>
                <Button
                  variant='secondary'
                  size='small'
                  onClick={handleAddClick}
                  disabled={!quantity || parseInt(quantity, 10) <= 0}
                  className='product-card-sales__confirm-btn'
                >
                  Agregar
                </Button>
              </div>
            </div>
          ) : (
            <button
              className='product-card-sales__add-btn'
              onClick={handleAddClick}
              disabled={product.stock === 0}
              aria-label={`Agregar ${product.name} al carrito`}
            >
              <BsPlus size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Modal de confirmación */}
      <Modal
        isOpen={showSuccessModal}
        onClose={handleCloseModal}
        title='¡Producto Agregado!'
        message={`${product.name} (${addedQuantity} ${addedQuantity === 1 ? 'unidad' : 'unidades'}) ha sido agregado al carrito exitosamente.`}
        modalType='success'
        confirmButtonText='Continuar'
        size='small'
        closeOnOverlayClick={true}
      />
    </>
  );
}

export default ProductCard;
