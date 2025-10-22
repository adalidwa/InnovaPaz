import React, { useState, useEffect } from 'react';
import '../../../assets/styles/theme.css';
import './ReceptionsPage.css';
import TitleDescription from '../../../components/common/TitleDescription';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import Pagination from '../../../components/common/Pagination';
import { IoDownload, IoReturnDownBack, IoSearch } from 'react-icons/io5';
import { useReceptions } from '../hooks/hooks';
import { providersApi, purchaseOrdersApi, productsApi } from '../services/shoppingApi';

const pageInfo = {
  title: 'Control de Recepciones y Devoluciones',
  description: 'Registra recepciones de mercadería y gestiona devoluciones',
};

interface ReceptionForm {
  purchaseOrderId: string;
  receptionDate: string;
  productId: string;
  quantity: number;
  lotNumber: string;
  expiryDate: string;
}

interface ReturnForm {
  productId: string;
  supplierId: string;
  quantity: number;
  reason: string;
  observations: string;
}

function ReceptionsPage() {
  // Hook principal para recepciones con nueva funcionalidad
  const {
    getReturnReasonOptions,
    getMovementHistory,
    getMovementDetails,
    handleSearchChange,
    handlePageChange,
    searchTerm,
    currentPage,
    loading,
    formatDate,
  } = useReceptions();

  // Estados para formularios
  const [receptionForm, setReceptionForm] = useState<ReceptionForm>({
    purchaseOrderId: '',
    receptionDate: '2025-09-30',
    productId: '',
    quantity: 0,
    lotNumber: '',
    expiryDate: '',
  });

  const [returnForm, setReturnForm] = useState<ReturnForm>({
    productId: '',
    supplierId: '',
    quantity: 0,
    reason: '',
    observations: '',
  });

  // Estados para modales
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<any>(null);
  const [pendingAction, setPendingAction] = useState<'reception' | 'return' | null>(null);

  // Estados para datos de la API
  const [providers, setProviders] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');

  // Cargar datos de la API al inicializar
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [providersData, ordersData, productsData] = await Promise.all([
          providersApi.getAll(),
          purchaseOrdersApi.getAll(),
          productsApi.getAll(),
        ]);
        setProviders(providersData);
        setPurchaseOrders(ordersData);
        setProducts(productsData);
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };
    loadInitialData();
  }, []);

  // Obtener datos del historial con paginación
  const historyData = getMovementHistory();
  const movements = historyData.movements || [];
  const pagination = historyData.pagination || {};

  // Funciones locales para obtener opciones reales
  const getSupplierOptionsLocal = () => {
    return [
      { value: '', label: 'Seleccionar proveedor...' },
      ...providers.map((p) => ({
        value: p.id.toString(),
        label: p.title || p.name,
      })),
    ];
  };

  const getPurchaseOrderOptionsLocal = () => {
    return [
      { value: '', label: 'Seleccionar orden...' },
      ...purchaseOrders.map((o) => ({
        value: o.id.toString(),
        label: `Orden ${o.order_number} - ${o.supplier_name}`,
      })),
    ];
  };

  const getProductOptionsLocal = () => {
    return [
      { value: '', label: 'Buscar producto...' },
      ...products.map((p) => ({
        value: p.id.toString(),
        label: `${p.name} - ${p.supplier_name}`,
      })),
    ];
  };

  // Handlers de formularios
  const handleReceptionInputChange =
    (field: keyof ReceptionForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setReceptionForm((prev) => ({
        ...prev,
        [field]: field === 'quantity' ? Number(e.target.value) : e.target.value,
      }));
    };

  const handleReturnInputChange =
    (field: keyof ReturnForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setReturnForm((prev) => ({
        ...prev,
        [field]: field === 'quantity' ? Number(e.target.value) : e.target.value,
      }));
    };

  // Handler para ver detalles del movimiento
  const handleViewDetail = (movementId: string) => {
    const details = getMovementDetails(movementId);
    setSelectedMovement({ id: movementId, ...details });
    setShowDetailModal(true);
  };

  // Handlers de confirmación
  const confirmAction = () => {
    if (pendingAction === 'reception') {
      // Lógica para confirmar recepción
      console.log('Confirmed reception:', receptionForm);
    } else if (pendingAction === 'return') {
      // Lógica para confirmar devolución
      console.log('Confirmed return:', returnForm);
    }
    setShowConfirmModal(false);
    setPendingAction(null);
  };

  const getConfirmMessage = () => {
    if (pendingAction === 'reception') {
      return '¿Está seguro de registrar esta recepción?';
    }
    return '¿Está seguro de registrar esta devolución?';
  };

  // Renderizar modal de detalle
  const renderDetailModal = () => {
    if (!selectedMovement) return null;

    const isReception = selectedMovement.id.startsWith('reception-');

    return (
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={isReception ? 'Detalle de Recepción' : 'Detalle de Devolución'}
        modalType='info'
        showCancelButton={false}
        confirmButtonText='Cerrar'
        onConfirm={() => setShowDetailModal(false)}
      >
        <div className='movement-detail-content'>
          {isReception ? (
            <div className='reception-details'>
              <div className='detail-row'>
                <strong>Número de Orden:</strong>
                <span>{selectedMovement.orderNumber}</span>
              </div>
              <div className='detail-row'>
                <strong>Proveedor:</strong>
                <span>{selectedMovement.supplierName}</span>
              </div>
              <div className='detail-row'>
                <strong>Fecha:</strong>
                <span>{formatDate(selectedMovement.date)}</span>
              </div>
              <div className='detail-row'>
                <strong>Estado:</strong>
                <span className={`status-badge ${selectedMovement.status}`}>
                  {selectedMovement.status === 'completed' ? 'Completado' : 'Pendiente'}
                </span>
              </div>
              <div className='detail-products'>
                <strong>Productos:</strong>
                {selectedMovement.items?.map((item: any, index: number) => (
                  <div key={index} className='product-item'>
                    <span>
                      {item.productName} - Cantidad: {item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className='return-details'>
              <div className='detail-row'>
                <strong>Producto:</strong>
                <span>{selectedMovement.productName}</span>
              </div>
              <div className='detail-row'>
                <strong>Proveedor:</strong>
                <span>{selectedMovement.supplierName}</span>
              </div>
              <div className='detail-row'>
                <strong>Cantidad:</strong>
                <span>{selectedMovement.quantity} unidades</span>
              </div>
              <div className='detail-row'>
                <strong>Motivo:</strong>
                <span>{selectedMovement.reasonText}</span>
              </div>
              <div className='detail-row'>
                <strong>Fecha:</strong>
                <span>{formatDate(selectedMovement.date)}</span>
              </div>
              <div className='detail-row'>
                <strong>Estado:</strong>
                <span className={`status-badge ${selectedMovement.status}`}>
                  {selectedMovement.status === 'completed' ? 'Completado' : 'Pendiente'}
                </span>
              </div>
              <div className='detail-row'>
                <strong>Observaciones:</strong>
                <span>{selectedMovement.observations}</span>
              </div>
            </div>
          )}
        </div>
      </Modal>
    );
  };

  return (
    <div className='receptions-container'>
      <TitleDescription title={pageInfo.title} description={pageInfo.description} />

      <div className='receptions-content'>
        {/* Sección de Registro de Recepciones */}
        <div className='receptions-section'>
          <div className='section-header'>
            <h3>Registrar Recepción</h3>
          </div>
          <div className='section-form'>
            <div className='form-row'>
              <div className='form-field'>
                <Select
                  label='Orden de Compra'
                  value={receptionForm.purchaseOrderId}
                  onChange={handleReceptionInputChange('purchaseOrderId')}
                  options={getPurchaseOrderOptionsLocal()}
                  className='form-input'
                />
              </div>
              <div className='form-field'>
                <Input
                  label='Fecha de Recepción'
                  type='date'
                  value={receptionForm.receptionDate}
                  onChange={handleReceptionInputChange('receptionDate')}
                  className='form-input'
                />
              </div>
            </div>
            <div className='form-row'>
              <div className='form-field'>
                <Select
                  label='Producto'
                  value={receptionForm.productId}
                  onChange={handleReceptionInputChange('productId')}
                  options={getProductOptionsLocal()}
                  className='form-input'
                />
              </div>
              <div className='form-field'>
                <Input
                  label='Cantidad'
                  type='number'
                  value={receptionForm.quantity}
                  onChange={handleReceptionInputChange('quantity')}
                  min='1'
                  className='form-input'
                />
              </div>
            </div>
            <div className='form-row'>
              <div className='form-field'>
                <Input
                  label='Número de Lote'
                  value={receptionForm.lotNumber}
                  onChange={handleReceptionInputChange('lotNumber')}
                  className='form-input'
                />
              </div>
              <div className='form-field'>
                <Input
                  label='Fecha de Vencimiento'
                  type='date'
                  value={receptionForm.expiryDate}
                  onChange={handleReceptionInputChange('expiryDate')}
                  className='form-input'
                />
              </div>
            </div>
            <div className='form-actions'>
              <Button
                variant='primary'
                icon={<IoDownload />}
                onClick={() => {
                  setPendingAction('reception');
                  setShowConfirmModal(true);
                }}
                className='action-button'
              >
                Registrar Recepción
              </Button>
            </div>
          </div>
        </div>

        {/* Sección de Registro de Devoluciones */}
        <div className='receptions-section'>
          <div className='section-header'>
            <h3>Registrar Devolución</h3>
          </div>
          <div className='section-form'>
            <div className='form-row'>
              <div className='form-field'>
                <Select
                  label='Producto'
                  value={returnForm.productId}
                  onChange={handleReturnInputChange('productId')}
                  options={getProductOptionsLocal()}
                  className='form-input'
                />
              </div>
              <div className='form-field'>
                <Select
                  label='Proveedor'
                  value={returnForm.supplierId}
                  onChange={handleReturnInputChange('supplierId')}
                  options={getSupplierOptionsLocal()}
                  className='form-input'
                />
              </div>
            </div>
            <div className='form-row'>
              <div className='form-field'>
                <Input
                  label='Cantidad'
                  type='number'
                  value={returnForm.quantity}
                  onChange={handleReturnInputChange('quantity')}
                  min='1'
                  className='form-input'
                />
              </div>
              <div className='form-field'>
                <Select
                  label='Motivo de Devolución'
                  value={returnForm.reason}
                  onChange={handleReturnInputChange('reason')}
                  options={getReturnReasonOptions()}
                  className='form-input'
                />
              </div>
            </div>
            <div className='form-field full-width'>
              <Input
                label='Observaciones'
                value={returnForm.observations}
                onChange={handleReturnInputChange('observations')}
                placeholder='Observaciones adicionales...'
                className='form-textarea'
              />
            </div>
            <div className='form-actions'>
              <Button
                variant='secondary'
                icon={<IoReturnDownBack />}
                onClick={() => {
                  setPendingAction('return');
                  setShowConfirmModal(true);
                }}
                className='action-button'
              >
                Registrar Devolución
              </Button>
            </div>
          </div>
        </div>

        {/* Historial de Movimientos Mejorado */}
        <div className='receptions-section'>
          <div className='section-header'>
            <h3>Historial de Movimientos</h3>
            <div className='history-search'>
              <Input
                placeholder='Buscar en el historial...'
                value={searchTerm}
                onChange={handleSearchChange}
                leftIcon={<IoSearch color='var(--pri-500)' />}
                className='search-input'
              />
            </div>
          </div>

          {loading ? (
            <div className='loading-state'>
              <p>Cargando historial...</p>
            </div>
          ) : (
            <>
              <div className='history-list'>
                {movements.map((movement) => (
                  <div key={movement.id} className='history-item'>
                    <div className='history-icon'>{movement.icon}</div>
                    <div className='history-content'>
                      <div className='history-title'>{movement.title}</div>
                      <div className='history-description'>
                        {movement.description} • {movement.date}
                      </div>
                    </div>
                    <div className='history-actions'>
                      <Button
                        variant='secondary'
                        onClick={() => handleViewDetail(movement.id)}
                        className='detail-button'
                        size='small'
                      >
                        Ver Detalle
                      </Button>
                    </div>
                  </div>
                ))}

                {movements.length === 0 && (
                  <div className='empty-history'>
                    <p>No hay movimientos registrados</p>
                  </div>
                )}
              </div>

              {/* Paginación */}
              {pagination.totalPages > 1 && (
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.totalItems}
                  itemsPerPage={pagination.itemsPerPage}
                  itemName='movimientos'
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de Confirmación */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title='Confirmar Acción'
        message={getConfirmMessage()}
        modalType='warning'
        showCancelButton={true}
        confirmButtonText='Confirmar'
        cancelButtonText='Cancelar'
        onConfirm={confirmAction}
        onCancel={() => setShowConfirmModal(false)}
      />

      {/* Modal de Detalle */}
      {showDetailModal && renderDetailModal()}
    </div>
  );
}

export default ReceptionsPage;
