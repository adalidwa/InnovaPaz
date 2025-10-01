import { useState } from 'react';
import '../../../assets/styles/theme.css';
import './ProvisioningPage.css';
import TitleDescription from '../../../components/common/TitleDescription';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import Table from '../../../components/common/Table';
import StatusTag from '../../../components/common/StatusTag';
import Pagination from '../../../components/common/Pagination';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import { IoSearch, IoClose, IoAdd, IoTrash } from 'react-icons/io5';
import { useProducts, useProductForm, type ProductItem } from '../hooks/hooks';

type ProductStatus = 'Normal' | 'Critico';

const pageInfo = {
  title: 'Provisionamiento',
  description: 'Define umbrales de stock para reabastecimiento automático',
};

function ProvisioningPage() {
  // Hooks para productos
  const {
    currentProducts,
    filteredProducts,
    searchTerm,
    currentPage,
    totalPages,
    addProduct,
    updateProduct,
    deleteProduct,
    buyProduct,
    getSupplierOptions,
    handleSearchChange,
    handlePageChange,
    ITEMS_PER_PAGE,
  } = useProducts();

  // Hook para formulario
  const { form, updateField, resetForm, loadProduct, validateProduct } = useProductForm();

  // Estados para modales
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Estados para productos seleccionados
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [buyProduct_modal, setBuyProduct_modal] = useState<ProductItem | null>(null);
  const [deleteProduct_modal, setDeleteProduct_modal] = useState<ProductItem | null>(null);

  // Handlers para modales
  const handleAddProduct = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleSaveAdd = () => {
    const validationError = validateProduct();
    if (validationError) {
      alert(validationError);
      return;
    }

    addProduct({
      product: form.product.trim(),
      supplierId: form.supplierId,
      currentStock: form.currentStock,
      minStock: form.minStock,
      maxStock: form.maxStock,
    });
    setShowAddModal(false);
  };

  const handleEditProduct = (product: ProductItem) => {
    setSelectedProduct(product);
    loadProduct(product);
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!selectedProduct) return;

    const validationError = validateProduct();
    if (validationError) {
      alert(validationError);
      return;
    }

    updateProduct(selectedProduct.id, {
      product: form.product.trim(),
      supplierId: form.supplierId,
      currentStock: form.currentStock,
      minStock: form.minStock,
      maxStock: form.maxStock,
    });
    setShowEditModal(false);
    setSelectedProduct(null);
  };

  const handleDeleteClick = () => {
    if (selectedProduct) {
      setDeleteProduct_modal(selectedProduct);
      setShowDeleteModal(true);
      setShowEditModal(false);
    }
  };

  const handleConfirmDelete = () => {
    if (deleteProduct_modal) {
      deleteProduct(deleteProduct_modal.id);
      setShowDeleteModal(false);
      setDeleteProduct_modal(null);
      setSelectedProduct(null);
    }
  };

  const handleBuyProductClick = (product: ProductItem) => {
    setBuyProduct_modal(product);
    setShowBuyModal(true);
  };

  const handleConfirmBuy = () => {
    if (buyProduct_modal) {
      buyProduct(buyProduct_modal.id, 50);
      setShowBuyModal(false);
      setBuyProduct_modal(null);
    }
  };

  const getStatusStyle = (status: ProductStatus) => {
    if (status === 'Normal') {
      return {
        backgroundColor: 'var(--sec-100)',
        textColor: 'var(--sec-800)',
      };
    }
    return {
      backgroundColor: 'var(--acc-100)',
      textColor: 'var(--acc-800)',
    };
  };

  const tableColumns = [
    {
      key: 'product',
      header: 'Producto',
      width: '30%',
      render: (value: string, row: ProductItem) => (
        <div className='product-cell'>
          <div className='product-name'>{value}</div>
          <div className='product-supplier'>{row.supplierName}</div>
        </div>
      ),
    },
    {
      key: 'currentStock',
      header: 'Stock Actual',
      width: '12%',
      className: 'text-center',
    },
    {
      key: 'minStock',
      header: 'Stock Mínimo',
      width: '12%',
      className: 'text-center',
    },
    {
      key: 'maxStock',
      header: 'Stock Máximo',
      width: '12%',
      className: 'text-center',
    },
    {
      key: 'status',
      header: 'Estado',
      width: '15%',
      className: 'text-center',
      render: (value: ProductStatus) => {
        const style = getStatusStyle(value);
        return (
          <StatusTag
            text={value}
            backgroundColor={style.backgroundColor}
            textColor={style.textColor}
          />
        );
      },
    },
  ];

  const tableActions = [
    {
      label: 'Editar',
      onClick: handleEditProduct,
      variant: 'primary' as const,
      show: () => true,
    },
    {
      label: 'Comprar',
      onClick: handleBuyProductClick,
      variant: 'danger' as const,
      show: (row: ProductItem) => row.status === 'Critico',
    },
  ];

  return (
    <div className='provisioning-page'>
      <div className='provisioning-header'>
        <div className='provisioning-titleSection'>
          <TitleDescription
            title={pageInfo.title}
            description={pageInfo.description}
            titleSize={32}
            descriptionSize={16}
          />
          <Button
            variant='primary'
            onClick={handleAddProduct}
            icon={<IoAdd />}
            className='add-product-button'
          >
            Agregar Producto
          </Button>
        </div>
        <div className='provisioning-search'>
          <Input
            placeholder='Buscar productos o proveedores...'
            value={searchTerm}
            onChange={handleSearchChange}
            leftIcon={<IoSearch color='var(--pri-500)' />}
            className='search-input'
          />
        </div>
      </div>

      <div className='provisioning-table'>
        <Table
          data={currentProducts}
          columns={tableColumns}
          actions={tableActions}
          emptyMessage='No se encontraron productos'
        />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredProducts.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={handlePageChange}
          itemName='productos'
        />
      </div>

      {(showEditModal || showAddModal) && (
        <div className='modal-overlay'>
          <div className='edit-modal'>
            <div className='edit-modal-header'>
              <h3>{showEditModal ? 'Editar Producto' : 'Agregar Nuevo Producto'}</h3>
              <button
                className='edit-modal-close'
                onClick={() => {
                  setShowEditModal(false);
                  setShowAddModal(false);
                  setSelectedProduct(null);
                }}
                type='button'
              >
                <IoClose size={20} />
              </button>
            </div>
            <div className='edit-modal-body'>
              <div className='edit-modal-field'>
                <label>Nombre del Producto:</label>
                <Input
                  type='text'
                  value={form.product}
                  onChange={(e) => updateField('product', e.target.value)}
                  placeholder='Ingrese el nombre del producto'
                  className='edit-modal-input'
                />
              </div>
              <div className='edit-modal-field'>
                <label>Proveedor:</label>
                <Select
                  value={form.supplierId.toString()}
                  onChange={(e) => updateField('supplierId', parseInt(e.target.value) || 0)}
                  options={getSupplierOptions()}
                  placeholder='Seleccionar proveedor'
                  className='edit-modal-input'
                />
              </div>
              <div className='edit-modal-field'>
                <label>Stock Actual:</label>
                <Input
                  type='number'
                  value={form.currentStock.toString()}
                  onChange={(e) => updateField('currentStock', parseInt(e.target.value) || 0)}
                  className='edit-modal-input'
                />
              </div>
              <div className='edit-modal-field'>
                <label>Stock Mínimo:</label>
                <Input
                  type='number'
                  value={form.minStock.toString()}
                  onChange={(e) => updateField('minStock', parseInt(e.target.value) || 0)}
                  className='edit-modal-input'
                />
              </div>
              <div className='edit-modal-field'>
                <label>Stock Máximo:</label>
                <Input
                  type='number'
                  value={form.maxStock.toString()}
                  onChange={(e) => updateField('maxStock', parseInt(e.target.value) || 0)}
                  className='edit-modal-input'
                />
              </div>
            </div>
            <div className='edit-modal-footer'>
              {showEditModal && (
                <Button
                  variant='accent'
                  onClick={handleDeleteClick}
                  icon={<IoTrash />}
                  className='delete-button'
                >
                  Eliminar
                </Button>
              )}
              <div className='edit-modal-main-muttons'>
                <Button
                  variant='secondary'
                  onClick={() => {
                    setShowEditModal(false);
                    setShowAddModal(false);
                    setSelectedProduct(null);
                  }}
                  className='edit-modal-button'
                >
                  Cancelar
                </Button>
                <Button
                  variant='primary'
                  onClick={showEditModal ? handleSaveEdit : handleSaveAdd}
                  className='edit-modal-button'
                >
                  {showEditModal ? 'Guardar' : 'Agregar'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={showBuyModal}
        onClose={() => setShowBuyModal(false)}
        title='Confirmar Compra'
        message={`¿Está seguro que desea comprar más stock de "${buyProduct_modal?.product}"? Se agregarán 50 unidades al inventario.`}
        modalType='warning'
        showCancelButton={true}
        confirmButtonText='Confirmar Compra'
        cancelButtonText='Cancelar'
        onConfirm={handleConfirmBuy}
        onCancel={() => setShowBuyModal(false)}
      />

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title='Eliminar Producto'
        message={`¿Está seguro que desea eliminar el producto "${deleteProduct_modal?.product}"? Esta acción no se puede deshacer.`}
        modalType='error'
        showCancelButton={true}
        confirmButtonText='Eliminar'
        cancelButtonText='Cancelar'
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}

export default ProvisioningPage;
