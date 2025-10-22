import { useState, useEffect } from 'react';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import Select from '../../../components/common/Select';
import OrdersService, { type Order } from '../services/ordersService';
import './OrderDetailsModal.css';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
  empresaId: string;
  onStatusUpdate: (orderId: number, newStatusId: number) => void;
}

function OrderDetailsModal({
  isOpen,
  onClose,
  orderId,
  empresaId,
  onStatusUpdate,
}: OrderDetailsModalProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const isCompleted = order?.estadoId === 3; // Estado "Completado

  useEffect(() => {
    if (isOpen && orderId) {
      loadOrderDetails();
    }
  }, [isOpen, orderId]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const data = await OrdersService.getOrderById(empresaId, orderId);
      setOrder(data);
      setSelectedStatus(data.estadoId.toString());
    } catch (error) {
      console.error('Error al cargar detalle del pedido:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = () => {
    if (order && selectedStatus !== order.estadoId.toString()) {
      onStatusUpdate(order.id, parseInt(selectedStatus));
      onClose();
    }
  };

  const formatCurrency = (amount: number) => {
    return `Bs. ${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const statusOptions = [
    { value: '1', label: 'Pendiente' },
    { value: '2', label: 'En Proceso' },
    { value: '3', label: 'Completado' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Detalle del Pedido'
      message=''
      modalType='info'
      size='large'
      showConfirmButton={false}
    >
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando...</div>
      ) : order ? (
        <div className='order-details'>
          {/* Información General */}
          <div className='order-details__section'>
            <h4 className='order-details__subtitle'>Información General</h4>
            <div className='order-details__grid'>
              <div className='order-details__field'>
                <span className='order-details__label'>Número de Pedido:</span>
                <span className='order-details__value'>{order.numero}</span>
              </div>
              <div className='order-details__field'>
                <span className='order-details__label'>Fecha:</span>
                <span className='order-details__value'>{formatDate(order.fecha)}</span>
              </div>
              <div className='order-details__field'>
                <span className='order-details__label'>Cliente:</span>
                <span className='order-details__value'>{order.clientName}</span>
              </div>
              {order.clientNit && (
                <div className='order-details__field'>
                  <span className='order-details__label'>NIT:</span>
                  <span className='order-details__value'>{order.clientNit}</span>
                </div>
              )}
              {order.cotizacion && (
                <div className='order-details__field'>
                  <span className='order-details__label'>Cotización:</span>
                  <span className='order-details__value'>{order.cotizacion}</span>
                </div>
              )}
              {order.fechaEntrega && (
                <div className='order-details__field'>
                  <span className='order-details__label'>Fecha de Entrega:</span>
                  <span className='order-details__value'>{formatDate(order.fechaEntrega)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Productos */}
          <div className='order-details__section'>
            <h4 className='order-details__subtitle'>Productos</h4>
            <table className='order-details__table'>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio Unit.</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.productos.map((product, index) => (
                  <tr key={index}>
                    <td>
                      <strong>{product.nombre}</strong>
                      <br />
                      <small style={{ color: 'var(--text-secondary)' }}>{product.codigo}</small>
                    </td>
                    <td>{product.cantidad}</td>
                    <td>{formatCurrency(product.precio)}</td>
                    <td>{formatCurrency(product.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totales */}
          <div className='order-details__section'>
            <div className='order-details__totals'>
              <div className='order-details__total-line'>
                <span>Subtotal:</span>
                <strong>{formatCurrency(order.subtotal)}</strong>
              </div>
              {order.descuento > 0 && (
                <div className='order-details__total-line'>
                  <span>Descuento:</span>
                  <strong>- {formatCurrency(order.descuento)}</strong>
                </div>
              )}
              {order.impuesto > 0 && (
                <div className='order-details__total-line'>
                  <span>Impuesto:</span>
                  <strong>{formatCurrency(order.impuesto)}</strong>
                </div>
              )}
              <div className='order-details__total-line order-details__total-final'>
                <span>Total:</span>
                <strong>{formatCurrency(order.total)}</strong>
              </div>
            </div>
            {isCompleted && (
              <p
                style={{
                  marginTop: '0.75rem',
                  color: 'var(--success-600)',
                  fontSize: '0.875rem',
                  fontStyle: 'italic',
                }}
              >
                Este pedido está completado y no se puede modificar su estado. La venta ha sido
                registrada en el historial.
              </p>
            )}
          </div>

          {/* Observaciones */}
          {order.observaciones && (
            <div className='order-details__section'>
              <h4 className='order-details__subtitle'>Observaciones</h4>
              <p className='order-details__observations'>{order.observaciones}</p>
            </div>
          )}

          {/* Estado */}
          <div className='order-details__section'>
            <h4 className='order-details__subtitle'>Estado del Pedido</h4>
            <div className='order-details__status-control'>
              <Select
                options={statusOptions}
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                label='Cambiar Estado'
                disabled={isCompleted}
              />
              {!isCompleted && selectedStatus !== order.estadoId.toString() && (
                <Button variant='primary' size='medium' onClick={handleStatusChange}>
                  Actualizar Estado
                </Button>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className='order-details__footer'>
            <Button variant='outline' size='medium' onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      ) : (
        <div style={{ padding: '2rem', textAlign: 'center' }}>No se pudo cargar el pedido</div>
      )}
    </Modal>
  );
}

export default OrderDetailsModal;
