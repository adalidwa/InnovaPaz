import React from 'react';
import Button from '../../../components/common/Button';
import './CartItem.css';

interface CartItemProps {
  id: string;
  name: string;
  price: number;
  quantity: number;
  onQuantityChange: (id: string, newQuantity: number) => void;
  onRemove: (id: string) => void;
}

function CartItem({ id, name, price, quantity, onQuantityChange, onRemove }: CartItemProps) {
  const formatCurrency = (amount: number) => {
    return `Bs. ${amount.toFixed(2)}`;
  };

  const handleIncrement = () => {
    onQuantityChange(id, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      onQuantityChange(id, quantity - 1);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(e.target.value) || 1;
    if (newQuantity > 0) {
      onQuantityChange(id, newQuantity);
    }
  };

  const totalPrice = price * quantity;

  return (
    <div className='cart-item'>
      <div className='cart-item__info'>
        <h4 className='cart-item__name'>{name}</h4>
        <span className='cart-item__unit-price'>{formatCurrency(price)}</span>
      </div>

      <div className='cart-item__controls'>
        <div className='cart-item__quantity'>
          <Button
            variant='outline'
            size='small'
            onClick={handleDecrement}
            disabled={quantity <= 1}
            className='cart-item__qty-btn'
            rounded='full'
          >
            -
          </Button>

          <input
            type='number'
            value={quantity}
            onChange={handleQuantityChange}
            className='cart-item__qty-input'
            min='1'
          />

          <Button
            variant='outline'
            size='small'
            onClick={handleIncrement}
            className='cart-item__qty-btn'
            rounded='full'
          >
            +
          </Button>
        </div>

        <div className='cart-item__actions'>
          <span className='cart-item__total-price'>{formatCurrency(totalPrice)}</span>
          <Button
            variant='outline'
            size='small'
            onClick={() => onRemove(id)}
            className='cart-item__remove-btn'
            icon={
              <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'>
                <path d='M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z' />
              </svg>
            }
          />
        </div>
      </div>
    </div>
  );
}

export default CartItem;
