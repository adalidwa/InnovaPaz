import { useState } from 'react';
import ProductsHeader from '../components/ProductsHeader';
import ProductosSearchBar from '../components/ProductosSearchBar';
import ProductsCardCrud from '../components/ProductsCardCrud';
import ModalImputs from '../components/ModalImputs';
import { useProductsContext } from '../context/ProductsContext';
import type { ProductFormData } from '../hooks/useProducts';
import './ProductManagement.css';

function ProductManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { products, loading, addProduct, deleteProduct } = useProductsContext();

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveProduct = (productData: ProductFormData) => {
    const result = addProduct(productData);
    if (result.success) {
      handleCloseModal();
      // Aquí podrías agregar una notificación de éxito
      console.log('Producto agregado exitosamente:', result.product);
    } else {
      // Aquí podrías mostrar un mensaje de error
      console.error('Error al agregar producto:', result.error);
    }
    return result;
  };

  const handleEditProduct = (product: any) => {
    // TODO: Implementar edición de productos
    console.log('Editar producto:', product);
  };

  const handleDeleteProduct = (productId: string) => {
    const result = deleteProduct(productId);
    if (result.success) {
      console.log('Producto eliminado exitosamente');
    } else {
      console.error('Error al eliminar producto:', result.error);
    }
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
        {products.length === 0 ? (
          <div className='no-products'>
            <p>No hay productos registrados. ¡Agrega tu primer producto!</p>
          </div>
        ) : (
          products.map((product) => (
            <ProductsCardCrud
              key={product.id}
              product={product}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
            />
          ))
        )}
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
              <ModalImputs
                onSave={handleSaveProduct}
                onCancel={handleCloseModal}
                loading={loading}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductManagement;
