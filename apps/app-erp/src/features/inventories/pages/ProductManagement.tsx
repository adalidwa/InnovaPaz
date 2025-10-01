import { useState } from 'react';
import ProductsHeader from '../components/ProductsHeader';
import ProductosSearchBar from '../components/ProductosSearchBar';
import ProductsCardCrud from '../components/ProductsCardCrud';
import ModalImputs from '../components/ModalImputs';
import './ProductManagement.css';

function ProductManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <ProductsHeader
        title='Gestion de productos'
        subtitle='Administra el inventario de tu minimarket'
        buttonText='Agregar Producto'
        buttonVariant='primary'
        hasIcon={true}
        icon={<span className='icon-plus'>+</span>}
        iconPosition='left'
        onButtonClick={handleOpenModal}
      />
      <ProductosSearchBar />
      <div className='products-container'>
        <ProductsCardCrud />
        <ProductsCardCrud />
        <ProductsCardCrud />
        <ProductsCardCrud />
        <ProductsCardCrud />
      </div>

      {isModalOpen && (
        <div className='modal-overlay' onClick={handleCloseModal}>
          <div className='modal-container' onClick={(e) => e.stopPropagation()}>
            <div className='modal-header'>
              <h2 className='modal-title'>Agregar Nuevo Producto - Minimarket</h2>
              <button className='modal-close' onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <div className='modal-body'>
              <ModalImputs />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductManagement;
