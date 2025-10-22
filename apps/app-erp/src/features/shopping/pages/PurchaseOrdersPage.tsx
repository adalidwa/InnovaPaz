import '../../../assets/styles/theme.css';
import './PurchaseOrdersPage.css';
import TitleDescription from '../../../components/common/TitleDescription';
import Input from '../../../components/common/Input';
import Table from '../../../components/common/Table';
import StatusTag from '../../../components/common/StatusTag';
import Pagination from '../../../components/common/Pagination';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import { IoSearch, IoAdd, IoEye } from 'react-icons/io5';
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

    receiveOrder,

    handleSearchChange,
    handlePageChange,
    formatCurrency,
    formatDate,
    ITEMS_PER_PAGE,
  } = usePurchaseOrders();

  const { resetForm } = usePurchaseOrderForm();
  const {
    showViewOrderModal,
    showReceiveModal,
    selectedOrder,
    openNewOrderModal,

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

  const handleConfirmReceive = () => {
    if (selectedOrder) {
      receiveOrder(selectedOrder.id);
      closeReceiveModal();
    }
  };

  // Handlers para formulario de items

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
      render: (value: number, row: PurchaseOrder) => {
        void value;
        void value;
        const count = row.items?.length || row.totalItems || 2; // Fallback temporal
        return `${count} items`;
      },
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

      {/* Modal Recibir Orden */}

      {/* Modal Ver Orden */}
      <Modal
        isOpen={showViewOrderModal}
        onClose={closeViewOrderModal}
        title={`Orden ${selectedOrder?.orderNumber}`}
        modalType='info'
        showCancelButton={false}
        confirmButtonText='Cerrar'
        onConfirm={closeViewOrderModal}
      >
        {selectedOrder && (
          <div style={{ padding: '1rem' }}>
            <p>
              <strong>Proveedor:</strong> {selectedOrder.supplierName}
            </p>
            <p>
              <strong>Fecha:</strong> {formatDate(selectedOrder.date)}
            </p>
            <p>
              <strong>Estado:</strong> {selectedOrder.status}
            </p>
            <p>
              <strong>Items:</strong> {selectedOrder.items?.length || 0} productos
            </p>
            <p>
              <strong>Total:</strong> {formatCurrency(selectedOrder.totalAmount)}
            </p>
            {selectedOrder.notes && (
              <p>
                <strong>Notas:</strong> {selectedOrder.notes}
              </p>
            )}
          </div>
        )}
      </Modal>
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
