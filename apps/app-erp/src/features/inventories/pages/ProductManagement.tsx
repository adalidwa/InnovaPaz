import { useState } from 'react';
import ProductsHeader from '../components/ProductsHeader';
import ProductosSearchBar from '../components/ProductosSearchBar';
import ProductsCardCrud from '../components/ProductsCardCrud';
import ModalImputs from '../components/ModalImputs';
import EditProductModal from '../components/EditProductModal';
import { useProductsContext } from '../context/ProductsContext';
import { useCompanyConfig } from '../../../contexts/CompanyConfigContext';

import type { ProductLegacy } from '../types/inventory';
import type { ProductFormData } from '../hooks/useProductsReal';
import './ProductManagement.css';

function ProductManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<ProductLegacy | null>(null);
  const { products, searchTerm, loading, addProduct, updateProduct, deactivateProduct } =
    useProductsContext();
  const { config } = useCompanyConfig();

  // Función para obtener el nombre correcto del tipo de negocio
  const getBusinessTypeName = (tipoNegocio: string): string => {
    if (!tipoNegocio) return 'negocio';

    // Los valores ya vienen normalizados del backend (ferreteria, licoreria, minimarket)
    const businessTypes: Record<string, string> = {
      minimarket: 'minimarket',
      ferreteria: 'ferretería',
      licoreria: 'licorería',
    };

    const normalizedType = tipoNegocio.toLowerCase().trim();
    return businessTypes[normalizedType] || 'negocio';
  };

  // Generar subtítulo dinámico
  const getSubtitle = (): string => {
    const businessType = getBusinessTypeName(config.tipoNegocio);
    return `Administra el inventario de tu ${businessType}`;
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveProduct = async (productData: ProductFormData) => {
    const result = await addProduct(productData);
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

  const handleEditProduct = (product: ProductLegacy) => {
    setProductToEdit(product);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setProductToEdit(null);
  };

  const handleUpdateProduct = async (productData: ProductFormData) => {
    if (!productToEdit) return { success: false, error: 'No hay producto seleccionado' };

    const result = await updateProduct(productToEdit.id, productData);
    if (result.success) {
      console.log('Producto actualizado exitosamente');
      handleCloseEditModal();
    } else {
      console.error('Error al actualizar producto:', result.error);
    }
    return result;
  };

  const handleDeleteProduct = async (productId: string) => {
    const result = await deactivateProduct(productId);
    if (result.success) {
      console.log('Producto desactivado exitosamente');
    } else {
      console.error('Error al desactivar producto:', result.error);
    }
  };

  return (
    <div>
      <ProductsHeader
        title='Gestion de inventario'
        subtitle={getSubtitle()}
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
            {searchTerm ? (
              <p>
                No se encontraron productos que coincidan con "{searchTerm}". Intenta con otro
                término de búsqueda.
              </p>
            ) : (
              <p>No hay productos registrados. ¡Agrega tu primer producto!</p>
            )}
          </div>
        ) : (
          products.map((product) => (
            <ProductsCardCrud
              key={product.id}
              product={product}
              onEdit={handleEditProduct}
              onDeactivate={handleDeleteProduct}
            />
          ))
        )}
      </div>

      {isModalOpen && (
        <div className='modal-overlay' onClick={handleCloseModal}>
          <div className='modal-container' onClick={(e) => e.stopPropagation()}>
            <div className='modal-header'>
              <h2 className='modal-title'>
                Agregar Nuevo Producto -{' '}
                {getBusinessTypeName(config.tipoNegocio).charAt(0).toUpperCase() +
                  getBusinessTypeName(config.tipoNegocio).slice(1)}
              </h2>
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

      {isEditModalOpen && productToEdit && (
        <div className='modal-overlay' onClick={handleCloseEditModal}>
          <div className='modal-container' onClick={(e) => e.stopPropagation()}>
            <div className='modal-header'>
              <h2 className='modal-title'>Editar Producto - {productToEdit.name}</h2>
              <button className='modal-close' onClick={handleCloseEditModal}>
                ×
              </button>
            </div>
            <div className='modal-body'>
              <EditProductModal
                product={productToEdit}
                onSave={handleUpdateProduct}
                onCancel={handleCloseEditModal}
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
