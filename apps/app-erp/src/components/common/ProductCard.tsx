import { useState } from 'react';
import { BsPlus } from 'react-icons/bs';
import Input from './Input';
import Button from './Button';
import Modal from './Modal';
import './ProductCard.css';

export interface Product {
  id: string;
  code: string;
  name: string;
  price: number;
  stock: number;
  currency?: string;
}

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

  return (
    <>
      <div className={`product-card ${className}`}>
        <div className='product-card__header'>
          <span className='product-card__code'>{product.code}</span>
          <span className='product-card__stock'>Stock: {product.stock}</span>
        </div>

        <div className='product-card__content'>
          <h3 className='product-card__title'>{product.name}</h3>
          <div className='product-card__price'>
            {product.currency || 'Bs.'} {product.price.toFixed(2)}
          </div>
        </div>

        <div className='product-card__actions'>
          {showQuantityInput ? (
            <div className='product-card__quantity-section'>
              <div className='product-card__quantity-input'>
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
              <div className='product-card__quantity-actions'>
                <Button
                  variant='outline'
                  size='small'
                  onClick={handleCancel}
                  className='product-card__cancel-btn'
                >
                  Cancelar
                </Button>
                <Button
                  variant='secondary'
                  size='small'
                  onClick={handleAddClick}
                  disabled={!quantity || parseInt(quantity, 10) <= 0}
                  className='product-card__confirm-btn'
                >
                  Agregar
                </Button>
              </div>
            </div>
          ) : (
            <button
              className='product-card__add-btn'
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
