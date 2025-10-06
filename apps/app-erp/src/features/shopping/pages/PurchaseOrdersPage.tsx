import React from 'react';
import '../../../assets/styles/theme.css';
import './PurchaseOrdersPage.css';
import TitleDescription from '../../../components/common/TitleDescription';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import Table from '../../../components/common/Table';
import StatusTag from '../../../components/common/StatusTag';
import Pagination from '../../../components/common/Pagination';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import { IoSearch, IoAdd, IoEye, IoClose, IoTrash } from 'react-icons/io5';
import {
  usePurchaseOrders,
  usePurchaseOrderForm,
  usePurchaseOrderModals,
  type PurchaseOrder,
} from '../hooks/hooks';

const pageInfo = {
  title: 'Órdenes de Compra',
  description: 'Gestiona tus órdenes de compra y recepciones',
};

function PurchaseOrdersPage() {
  // Hooks principales
  const {
    currentOrders,
    filteredOrders,
    searchTerm,
    currentPage,
    totalPages,
    addOrder,
    receiveOrder,
    getSupplierOptions,
    handleSearchChange,
    handlePageChange,
    formatCurrency,
    formatDate,
    ITEMS_PER_PAGE,
  } = usePurchaseOrders();

  const {
    form,
    currentItem,
    updateField,
    updateCurrentItem,
    addItem,
    removeItem,
    getTotalAmount,
    resetForm,
    validateForm,
  } = usePurchaseOrderForm();

  const {
    showNewOrderModal,
    showViewOrderModal,
    showReceiveModal,
    selectedOrder,
    openNewOrderModal,
    closeNewOrderModal,
    openViewOrderModal,
    closeViewOrderModal,
    openReceiveModal,
    closeReceiveModal,
  } = usePurchaseOrderModals();

  // Handlers
  const handleNewOrder = () => {
    resetForm();
    openNewOrderModal();
  };

  const handleViewOrder = (order: PurchaseOrder) => {
    openViewOrderModal(order);
  };

  const handleReceiveOrderClick = (order: PurchaseOrder) => {
    openReceiveModal(order);
  };

  const handleSaveNewOrder = () => {
    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    addOrder({
      supplierId: form.supplierId,
      items: form.items,
      notes: form.notes,
    });

    closeNewOrderModal();
  };

  const handleConfirmReceive = () => {
    if (selectedOrder) {
      receiveOrder(selectedOrder.id);
      closeReceiveModal();
    }
  };

  // Handlers para formulario de items
  const handleAddItem = () => {
    addItem();
  };

  const handleRemoveItem = (index: number) => {
    removeItem(index);
  };

  // Estilos para estados
  const getStatusStyle = (status: PurchaseOrder['status']) => {
    if (status === 'Recibido') {
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

  // Configuración de la tabla
  const tableColumns = [
    {
      key: 'orderNumber',
      header: 'Orden #',
      width: '15%',
      className: 'text-center',
    },
    {
      key: 'date',
      header: 'Fecha',
      width: '15%',
      className: 'text-center',
      render: (value: string) => formatDate(value),
    },
    {
      key: 'supplierName',
      header: 'Proveedor',
      width: '25%',
    },
    {
      key: 'totalItems',
      header: 'Items',
      width: '10%',
      className: 'text-center',
      render: (value: number) => `${value} items`,
    },
    {
      key: 'totalAmount',
      header: 'Total',
      width: '15%',
      className: 'text-center',
      render: (value: number) => formatCurrency(value),
    },
    {
      key: 'status',
      header: 'Estado',
      width: '15%',
      className: 'text-center',
      render: (value: PurchaseOrder['status']) => {
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
      label: 'Ver',
      onClick: handleViewOrder,
      variant: 'primary' as const,
      show: () => true,
      icon: <IoEye />,
    },
    {
      label: 'Recibir',
      onClick: handleReceiveOrderClick,
      variant: 'secondary' as const,
      show: (row: PurchaseOrder) => row.status === 'Pendiente',
    },
  ];

  return (
    <div className='purchase-orders-page'>
      <div className='purchase-orders-header'>
        <div className='purchase-orders-titleSection'>
          <TitleDescription
            title={pageInfo.title}
            description={pageInfo.description}
            titleSize={32}
            descriptionSize={16}
          />
          <Button
            variant='primary'
            onClick={handleNewOrder}
            icon={<IoAdd />}
            className='new-order-button'
          >
            Nueva Orden
          </Button>
        </div>
        <div className='purchase-orders-search'>
          <Input
            placeholder='Buscar órdenes, proveedores o estados...'
            value={searchTerm}
            onChange={handleSearchChange}
            leftIcon={<IoSearch color='var(--pri-500)' />}
            className='search-input'
          />
        </div>
      </div>

      <div className='purchase-orders-table'>
        <Table
          data={currentOrders}
          columns={tableColumns}
          actions={tableActions}
          emptyMessage='No se encontraron órdenes de compra'
        />
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredOrders.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={handlePageChange}
            itemName='órdenes'
          />
        )}
      </div>

      {/* Modal Nueva Orden */}
      {showNewOrderModal && (
        <div className='modal-overlay'>
          <div className='new-order-modal'>
            <div className='new-order-modal-header'>
              <h3>Nueva Orden de Compra</h3>
              <button className='new-order-modal-close' onClick={closeNewOrderModal} type='button'>
                <IoClose size={20} />
              </button>
            </div>

            <div className='new-order-modal-body'>
              <div className='new-order-modal-section'>
                <h4>Información General</h4>
                <div className='new-order-modal-field'>
                  <label>Proveedor:</label>
                  <Select
                    value={form.supplierId.toString()}
                    onChange={(e) => updateField('supplierId', parseInt(e.target.value) || 0)}
                    options={getSupplierOptions()}
                    placeholder='Seleccionar proveedor'
                    className='new-order-modal-input'
                  />
                </div>
                <div className='new-order-modal-field'>
                  <label>Notas (opcional):</label>
                  <Input
                    type='text'
                    value={form.notes}
                    onChange={(e) => updateField('notes', e.target.value)}
                    placeholder='Notas adicionales sobre la orden'
                    className='new-order-modal-input'
                  />
                </div>
              </div>

              <div className='new-order-modal-section'>
                <h4>Agregar Productos</h4>
                <div className='new-order-item-form'>
                  <div className='new-order-modal-field'>
                    <label>Producto:</label>
                    <Input
                      type='text'
                      value={currentItem.productName}
                      onChange={(e) => updateCurrentItem('productName', e.target.value)}
                      placeholder='Nombre del producto'
                      className='new-order-modal-input'
                    />
                  </div>
                  <div className='new-order-modal-field'>
                    <label>Cantidad:</label>
                    <Input
                      type='number'
                      value={currentItem.quantity.toString()}
                      onChange={(e) => updateCurrentItem('quantity', parseInt(e.target.value) || 1)}
                      placeholder='1'
                      min='1'
                      className='new-order-modal-input'
                    />
                  </div>
                  <div className='new-order-modal-field'>
                    <label>Precio Unitario:</label>
                    <Input
                      type='number'
                      step='0.01'
                      value={currentItem.unitPrice.toString()}
                      onChange={(e) =>
                        updateCurrentItem('unitPrice', parseFloat(e.target.value) || 0)
                      }
                      placeholder='0.00'
                      min='0'
                      className='new-order-modal-input'
                    />
                  </div>
                  <div className='new-order-add-item'>
                    <Button variant='secondary' onClick={handleAddItem}>
                      Agregar
                    </Button>
                  </div>
                </div>
              </div>

              {form.items.length > 0 && (
                <div className='new-order-modal-section'>
                  <h4>Productos Agregados</h4>
                  <div className='order-items-list'>
                    {form.items.map((item, index) => (
                      <div key={index} className='order-item'>
                        <div className='order-item-info'>
                          <span className='order-item-name'>{item.productName}</span>
                          <span className='order-item-details'>
                            {item.quantity} x {formatCurrency(item.unitPrice)} ={' '}
                            {formatCurrency(item.total)}
                          </span>
                        </div>
                        <button
                          className='order-item-remove'
                          onClick={() => handleRemoveItem(index)}
                          type='button'
                        >
                          <IoTrash size={16} />
                        </button>
                      </div>
                    ))}
                    <div className='order-total'>
                      <strong>Total: {formatCurrency(getTotalAmount())}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className='new-order-modal-footer'>
              <div className='new-order-modal-buttons'>
                <Button variant='secondary' onClick={closeNewOrderModal}>
                  Cancelar
                </Button>
                <Button variant='primary' onClick={handleSaveNewOrder}>
                  Crear Orden
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ver Orden */}
      {showViewOrderModal && selectedOrder && (
        <div className='modal-overlay'>
          <div className='view-order-modal'>
            <div className='view-order-modal-header'>
              <h3>Orden {selectedOrder.orderNumber}</h3>
              <button
                className='view-order-modal-close'
                onClick={closeViewOrderModal}
                type='button'
              >
                <IoClose size={20} />
              </button>
            </div>

            <div className='view-order-modal-body'>
              <div className='order-details-grid'>
                <div className='order-detail-item'>
                  <label>Fecha:</label>
                  <span>{formatDate(selectedOrder.date)}</span>
                </div>
                <div className='order-detail-item'>
                  <label>Proveedor:</label>
                  <span>{selectedOrder.supplierName}</span>
                </div>
                <div className='order-detail-item'>
                  <label>Estado:</label>
                  <StatusTag
                    text={selectedOrder.status}
                    backgroundColor={getStatusStyle(selectedOrder.status).backgroundColor}
                    textColor={getStatusStyle(selectedOrder.status).textColor}
                  />
                </div>
                <div className='order-detail-item'>
                  <label>Creado por:</label>
                  <span>{selectedOrder.createdBy}</span>
                </div>
                {selectedOrder.receivedDate && (
                  <>
                    <div className='order-detail-item'>
                      <label>Recibido el:</label>
                      <span>{formatDate(selectedOrder.receivedDate)}</span>
                    </div>
                    <div className='order-detail-item'>
                      <label>Recibido por:</label>
                      <span>{selectedOrder.receivedBy}</span>
                    </div>
                  </>
                )}
                {selectedOrder.notes && (
                  <div className='order-detail-item full-width'>
                    <label>Notas:</label>
                    <span>{selectedOrder.notes}</span>
                  </div>
                )}
              </div>

              <div className='order-items-section'>
                <h4>Productos</h4>
                <div className='order-items-table'>
                  <div className='order-items-header'>
                    <span>Producto</span>
                    <span>Cantidad</span>
                    <span>Precio Unit.</span>
                    <span>Total</span>
                  </div>
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className='order-items-row'>
                      <span>{item.productName}</span>
                      <span>{item.quantity}</span>
                      <span>{formatCurrency(item.unitPrice)}</span>
                      <span>{formatCurrency(item.total)}</span>
                    </div>
                  ))}
                  <div className='order-items-total'>
                    <span>Total General: {formatCurrency(selectedOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className='view-order-modal-footer'>
              <Button variant='secondary' onClick={closeViewOrderModal}>
                Cerrar
              </Button>
              {selectedOrder.status === 'Pendiente' && (
                <Button
                  variant='primary'
                  onClick={() => {
                    closeViewOrderModal();
                    handleReceiveOrderClick(selectedOrder);
                  }}
                >
                  Recibir Orden
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Recibir Orden */}
      <Modal
        isOpen={showReceiveModal}
        onClose={closeReceiveModal}
        title='Recibir Orden'
        message={`¿Está seguro que desea marcar como recibida la orden ${selectedOrder?.orderNumber}? Esta acción cambiará el estado de la orden.`}
        modalType='warning'
        showCancelButton={true}
        confirmButtonText='Recibir'
        cancelButtonText='Cancelar'
        onConfirm={handleConfirmReceive}
        onCancel={closeReceiveModal}
      />
    </div>
  );
}

export default PurchaseOrdersPage;
