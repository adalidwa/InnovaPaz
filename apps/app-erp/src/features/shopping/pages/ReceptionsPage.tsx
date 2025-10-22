import React, { useState, useEffect } from 'react';
import '../../../assets/styles/theme.css';
import './ReceptionsPage.css';
import TitleDescription from '../../../components/common/TitleDescription';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import { IoDownload, IoReturnDownBack, IoClose } from 'react-icons/io5';
import { useReceptions, type Reception, type Return, type Provider } from '../hooks/hooks';
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
  // Hook principal para recepciones
  const {
    getPurchaseOrderOptions,
    getProductOptions,
    getSupplierOptions,
    getReturnReasonOptions,
    addReception,
    addReturn,
    getMovementHistory,
    selectSupplier,
    getMovementDetails,
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

  // Funciones locales para obtener opciones reales
  const getSupplierOptionsLocal = () => {
    return [
      { value: '', label: 'Seleccionar proveedor...' },
      ...providers.map((provider) => ({
        value: provider.id.toString(),
        label: provider.title,
      })),
    ];
  };

  const getPurchaseOrderOptionsLocal = () => {
    return [
      { value: '', label: 'Seleccionar orden...' },
      ...purchaseOrders.map((order) => ({
        value: order.id.toString(),
        label: `${order.order_number} - ${order.supplier_name}`,
      })),
    ];
  };

  const getProductOptionsLocal = () => {
    return [
      { value: '', label: 'Buscar producto...' },
      ...products.map((product) => ({
        value: product.id.toString(),
        label: product.name,
      })),
    ];
  };

  // Obtener historial de movimientos
  const movementHistory = getMovementHistory();

  // Handlers para formulario de recepción
  const handleReceptionChange = (field: keyof ReceptionForm, value: string | number) => {
    setReceptionForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handlers para formulario de devolución
  const handleReturnChange = (field: keyof ReturnForm, value: string | number) => {
    setReturnForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Validaciones
  const validateReceptionForm = (): string | null => {
    if (!receptionForm.purchaseOrderId) return 'Debe seleccionar una orden de compra';
    if (!receptionForm.productId) return 'Debe seleccionar un producto';
    if (receptionForm.quantity <= 0) return 'La cantidad debe ser mayor a 0';
    if (!receptionForm.lotNumber.trim()) return 'El número de lote es obligatorio';
    return null;
  };

  const validateReturnForm = (): string | null => {
    if (!returnForm.productId) return 'Debe seleccionar un producto';
    if (!returnForm.supplierId) return 'Debe seleccionar un proveedor';
    if (returnForm.quantity <= 0) return 'La cantidad debe ser mayor a 0';
    if (!returnForm.reason) return 'Debe seleccionar un motivo de devolución';
    if (!returnForm.observations.trim()) return 'Las observaciones son obligatorias';
    return null;
  };

  // Handlers para envío de formularios
  const handleReceptionSubmit = () => {
    const validationError = validateReceptionForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    setPendingAction('reception');
    setShowConfirmModal(true);
  };

  const handleReturnSubmit = () => {
    const validationError = validateReturnForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    setPendingAction('return');
    setShowConfirmModal(true);
  };

  const confirmAction = () => {
    if (pendingAction === 'reception') {
      addReception({
        purchaseOrderId: parseInt(receptionForm.purchaseOrderId),
        date: receptionForm.receptionDate,
        items: [
          {
            productId: parseInt(receptionForm.productId),
            quantity: receptionForm.quantity,
            lotNumber: receptionForm.lotNumber,
            expiryDate: receptionForm.expiryDate,
          },
        ],
      });

      // Reset form
      setReceptionForm({
        purchaseOrderId: '',
        receptionDate: '2025-09-30',
        productId: '',
        quantity: 0,
        lotNumber: '',
        expiryDate: '',
      });

      alert('✅ Recepción registrada exitosamente');
    } else if (pendingAction === 'return') {
      addReturn({
        productId: parseInt(returnForm.productId),
        supplierId: parseInt(returnForm.supplierId),
        quantity: returnForm.quantity,
        reason: returnForm.reason,
        observations: returnForm.observations,
      });

      // Reset form
      setReturnForm({
        productId: '',
        supplierId: '',
        quantity: 0,
        reason: '',
        observations: '',
      });

      alert('✅ Devolución registrada exitosamente');
    }

    setShowConfirmModal(false);
    setPendingAction(null);
  };

  const handleViewDetail = (movementId: string) => {
    const details = getMovementDetails(movementId);
    setSelectedMovement({ id: movementId, ...details });
    setShowDetailModal(true);
  };

  const getConfirmMessage = () => {
    if (pendingAction === 'reception') {
      return `¿Confirma el registro de la recepción de ${receptionForm.quantity} unidades del producto seleccionado?`;
    } else if (pendingAction === 'return') {
      return `¿Confirma el registro de la devolución de ${returnForm.quantity} unidades por motivo "${getReturnReasonOptions().find((r) => r.value === returnForm.reason)?.label}"?`;
    }
    return '';
  };

  const renderDetailModal = () => {
    if (!selectedMovement) return null;

    const isReception = selectedMovement.id.startsWith('reception-');

    return (
      <div className='modal-overlay'>
        <div className='detail-modal'>
          <div className='detail-modal-header'>
            <h3>{isReception ? 'Detalle de Recepción' : 'Detalle de Devolución'}</h3>
            <button
              className='detail-modal-close'
              onClick={() => setShowDetailModal(false)}
              type='button'
            >
              <IoClose size={20} />
            </button>
          </div>

          <div className='detail-modal-body'>
            {isReception ? (
              <div className='detail-info'>
                <div className='detail-row'>
                  <label>Orden de Compra:</label>
                  <span>{selectedMovement.orderNumber}</span>
                </div>
                <div className='detail-row'>
                  <label>Proveedor:</label>
                  <span>{selectedMovement.supplierName}</span>
                </div>
                <div className='detail-row'>
                  <label>Fecha:</label>
                  <span>{formatDate(selectedMovement.date)}</span>
                </div>
                <div className='detail-row'>
                  <label>Estado:</label>
                  <span className={`status-badge ${selectedMovement.status}`}>
                    {selectedMovement.status === 'completed' ? 'Completado' : 'Pendiente'}
                  </span>
                </div>

                <h4>Productos Recibidos:</h4>
                <div className='products-list'>
                  {selectedMovement.items?.map((item: any, index: number) => (
                    <div key={index} className='product-item'>
                      <div className='product-name'>{item.productName}</div>
                      <div className='product-details'>
                        <span>Cantidad: {item.quantity}</span>
                        <span>Lote: {item.lotNumber}</span>
                        <span>Vencimiento: {formatDate(item.expiryDate)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className='detail-info'>
                <div className='detail-row'>
                  <label>Producto:</label>
                  <span>{selectedMovement.productName}</span>
                </div>
                <div className='detail-row'>
                  <label>Proveedor:</label>
                  <span>{selectedMovement.supplierName}</span>
                </div>
                <div className='detail-row'>
                  <label>Cantidad:</label>
                  <span>{selectedMovement.quantity} unidades</span>
                </div>
                <div className='detail-row'>
                  <label>Motivo:</label>
                  <span>{selectedMovement.reasonText}</span>
                </div>
                <div className='detail-row'>
                  <label>Fecha:</label>
                  <span>{formatDate(selectedMovement.date)}</span>
                </div>
                <div className='detail-row'>
                  <label>Estado:</label>
                  <span className={`status-badge ${selectedMovement.status}`}>
                    {selectedMovement.status === 'completed' ? 'Completado' : 'Pendiente'}
                  </span>
                </div>
                <div className='detail-row'>
                  <label>Observaciones:</label>
                  <span>{selectedMovement.observations}</span>
                </div>
              </div>
            )}
          </div>

          <div className='detail-modal-footer'>
            <Button
              variant='secondary'
              onClick={() => setShowDetailModal(false)}
              className='modal-button'
            >
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className='receptions-page'>
      <div className='receptions-header'>
        <div className='receptions-titleSection'>
          <TitleDescription
            title={pageInfo.title}
            description={pageInfo.description}
            titleSize={32}
            descriptionSize={16}
          />
        </div>
      </div>

      <div className='receptions-content'>
        {/* Selector Principal de Proveedor */}
        <div
          className='provider-selector-section'
          style={{
            marginBottom: '20px',
            padding: '20px',
            border: '1px solid #e5e5e5',
            borderRadius: '8px',
          }}
        >
          <h3 style={{ marginBottom: '15px', color: 'var(--pri-600)' }}>Seleccionar Proveedor</h3>
          <Select
            value={selectedProviderId}
            onChange={(e) => {
              setSelectedProviderId(e.target.value);
              if (e.target.value) {
                selectSupplier(parseInt(e.target.value));
              }
            }}
            options={getSupplierOptionsLocal()}
            className='form-input'
            style={{ maxWidth: '300px' }}
          />
        </div>
        {/* Sección de Registrar Recepción */}
        <div className='receptions-section'>
          <div className='section-header'>
            <IoDownload size={24} color='var(--pri-600)' />
            <h3>Registrar Recepción</h3>
          </div>

          <div className='section-form'>
            <div className='form-row'>
              <div className='form-field'>
                <label>Orden de Compra</label>
                <Select
                  value={receptionForm.purchaseOrderId}
                  onChange={(e) => handleReceptionChange('purchaseOrderId', e.target.value)}
                  options={getPurchaseOrderOptionsLocal()}
                  className='form-input'
                />
              </div>
              <div className='form-field'>
                <label>Fecha de Recepción</label>
                <Input
                  type='date'
                  value={receptionForm.receptionDate}
                  onChange={(e) => handleReceptionChange('receptionDate', e.target.value)}
                  className='form-input'
                />
              </div>
            </div>

            <div className='form-row'>
              <div className='form-field'>
                <label>Producto</label>
                <Select
                  value={receptionForm.productId}
                  onChange={(e) => handleReceptionChange('productId', e.target.value)}
                  options={getProductOptionsLocal()}
                  className='form-input'
                />
              </div>
              <div className='form-field'>
                <label>Cantidad</label>
                <Input
                  type='number'
                  value={receptionForm.quantity.toString()}
                  onChange={(e) => handleReceptionChange('quantity', parseInt(e.target.value) || 0)}
                  className='form-input'
                  min='0'
                />
              </div>
            </div>

            <div className='form-row'>
              <div className='form-field'>
                <label>Lote</label>
                <Input
                  type='text'
                  value={receptionForm.lotNumber}
                  onChange={(e) => handleReceptionChange('lotNumber', e.target.value)}
                  placeholder='Nº de lote'
                  className='form-input'
                />
              </div>
              <div className='form-field'>
                <label>Fecha de Vencimiento</label>
                <Input
                  type='date'
                  value={receptionForm.expiryDate}
                  onChange={(e) => handleReceptionChange('expiryDate', e.target.value)}
                  className='form-input'
                />
              </div>
            </div>

            <div className='form-actions'>
              <Button variant='primary' onClick={handleReceptionSubmit} className='action-button'>
                Registrar Recepción
              </Button>
            </div>
          </div>
        </div>

        {/* Sección de Registrar Devolución */}
        <div className='receptions-section'>
          <div className='section-header'>
            <IoReturnDownBack size={24} color='var(--acc-600)' />
            <h3>Registrar Devolución</h3>
          </div>

          <div className='section-form'>
            <div className='form-row'>
              <div className='form-field'>
                <label>Producto</label>
                <Select
                  value={returnForm.productId}
                  onChange={(e) => handleReturnChange('productId', e.target.value)}
                  options={getProductOptionsLocal()}
                  className='form-input'
                />
              </div>
              <div className='form-field'>
                <label>Proveedor</label>
                <Select
                  value={returnForm.supplierId}
                  onChange={(e) => handleReturnChange('supplierId', e.target.value)}
                  options={getSupplierOptionsLocal()}
                  className='form-input'
                />
              </div>
            </div>

            <div className='form-row'>
              <div className='form-field'>
                <label>Cantidad a Devolver</label>
                <Input
                  type='number'
                  value={returnForm.quantity.toString()}
                  onChange={(e) => handleReturnChange('quantity', parseInt(e.target.value) || 0)}
                  className='form-input'
                  min='0'
                />
              </div>
              <div className='form-field'>
                <label>Motivo de Devolución</label>
                <Select
                  value={returnForm.reason}
                  onChange={(e) => handleReturnChange('reason', e.target.value)}
                  options={getReturnReasonOptions()}
                  className='form-input'
                />
              </div>
            </div>

            <div className='form-row'>
              <div className='form-field full-width'>
                <label>Observaciones</label>
                <textarea
                  value={returnForm.observations}
                  onChange={(e) => handleReturnChange('observations', e.target.value)}
                  placeholder='Detalles adicionales...'
                  className='form-textarea'
                  rows={3}
                />
              </div>
            </div>

            <div className='form-actions'>
              <Button variant='accent' onClick={handleReturnSubmit} className='action-button'>
                Registrar Devolución
              </Button>
            </div>
          </div>
        </div>

        {/* Historial de Movimientos */}
        <div className='receptions-section'>
          <div className='section-header'>
            <h3>Historial de Movimientos</h3>
          </div>

          <div className='history-list'>
            {movementHistory.map((movement) => (
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

            {movementHistory.length === 0 && (
              <div className='empty-history'>
                <p>No hay movimientos registrados</p>
              </div>
            )}
          </div>
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
