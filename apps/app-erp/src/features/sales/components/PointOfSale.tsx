import React, { useState } from 'react';
import TitleDescription from '../../../components/common/TitleDescription';
import SearchProducts from './SearchProducts';
import ProductList, { type Product } from './ProductList';
import SalesCart from './SalesCart';
import './PointOfSale.css';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

function PointOfSale() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: '2',
      name: 'Arroz Paisana 1kg',
      price: 12.0,
      quantity: 1,
    },
  ]);
  const [showCart, setShowCart] = useState(false);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleAddToCart = (product: Product, quantity: number) => {
    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === product.id);

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        return [
          ...currentItems,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity,
          },
        ];
      }
    });
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    setCartItems((items) =>
      items.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item))
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems((items) => items.filter((item) => item.id !== itemId));
  };

  const handleProcessSale = (saleData: any) => {
    console.log('Procesando venta:', saleData);
    // Aquí se procesaría la venta
    setCartItems([]);
    setShowCart(false);
    alert('¡Venta procesada exitosamente!');
  };

  const handleCancelSale = () => {
    setShowCart(false);
  };

  return (
    <div className='point-of-sale'>
      <div className='point-of-sale__container'>
        {/* Header */}
        <div className='point-of-sale__header'>
          <TitleDescription
            title='Módulo de Ventas'
            description='Gestión completa de ventas, clientes, cotizaciones y pedidos'
            titleSize={31}
            descriptionSize={16}
            titleWeight='bold'
            descriptionWeight='normal'
            align='left'
            className='point-of-sale__title'
          />
        </div>

        {/* Main Content */}
        <div className='point-of-sale__content'>
          {/* Left Panel - Products */}
          <div className='point-of-sale__products'>
            <SearchProducts onSearch={handleSearch} placeholder='Buscar por código o nombre...' />
            <ProductList onAddToCart={handleAddToCart} searchTerm={searchTerm} />
          </div>

          {/* Right Panel - Cart */}
          <div className='point-of-sale__cart'>
            <SalesCart
              cartItems={cartItems}
              onQuantityChange={handleQuantityChange}
              onRemoveItem={handleRemoveItem}
              onProcessSale={handleProcessSale}
              onCancel={handleCancelSale}
            />
          </div>
        </div>

        {/* Mobile Cart Toggle */}
        <div className='point-of-sale__mobile-cart-toggle'>
          <button className='point-of-sale__cart-btn' onClick={() => setShowCart(!showCart)}>
            <svg width='20' height='20' viewBox='0 0 24 24' fill='currentColor'>
              <path d='M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z' />
            </svg>
            Carrito ({cartItems.length})
          </button>
        </div>

        {/* Mobile Cart Modal */}
        {showCart && (
          <div className='point-of-sale__mobile-cart'>
            <SalesCart
              cartItems={cartItems}
              onQuantityChange={handleQuantityChange}
              onRemoveItem={handleRemoveItem}
              onProcessSale={handleProcessSale}
              onCancel={handleCancelSale}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default PointOfSale;
