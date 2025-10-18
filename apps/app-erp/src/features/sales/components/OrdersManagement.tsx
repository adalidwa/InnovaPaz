import { useState, useEffect } from 'react';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import OrderCard from './OrderCard';
import OrderDetailsModal from './OrderDetailsModal';
import OrdersService, { type Order, type OrderStats } from '../services/ordersService';
import { FiClock, FiRefreshCw, FiCheckCircle } from 'react-icons/fi';
import './OrdersManagement.css';

function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'Todos' | 'Pendiente' | 'En Proceso' | 'Completado'>(
    'Todos'
  );
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const empresaId = localStorage.getItem('empresaId') || '5dc644b0-3ce9-4c41-a83d-c7da2962214d';

  useEffect(() => {
    loadOrders();
    loadStats();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await OrdersService.getAllOrders(empresaId);
      setOrders(data);
    } catch (error: any) {
      setModalMessage(error.response?.data?.message || 'Error al cargar pedidos');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await OrdersService.getStats(empresaId);
      setStats(data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const handleViewDetail = (orderId: string) => {
    setSelectedOrderId(parseInt(orderId));
    setShowDetailsModal(true);
  };

  const handleUpdateStatus = async (orderId: number, newStatusId: number) => {
    try {
      await OrdersService.updateOrderStatus(empresaId, orderId, newStatusId);
      setModalMessage('Estado del pedido actualizado exitosamente');
      setShowSuccessModal(true);
      loadOrders();
      loadStats();
    } catch (error: any) {
      setModalMessage(error.response?.data?.message || 'Error al actualizar estado');
      setShowErrorModal(true);
    }
  };

  // Filter orders based on selected filter
  const filteredOrders =
    filter === 'Todos' ? orders : orders.filter((order) => order.estado === filter);

  // Group filtered orders by status for section rendering
  const groupedOrders = {
    Pendiente: filteredOrders.filter((order) => order.estado === 'Pendiente'),
    'En Proceso': filteredOrders.filter((order) => order.estado === 'En Proceso'),
    Completado: filteredOrders.filter((order) => order.estado === 'Completado'),
  };

  const sectionConfig = {
    Pendiente: { color: 'var(--var-700)', Icon: FiClock },
    'En Proceso': { color: 'var(--sec-700)', Icon: FiRefreshCw },
    Completado: { color: 'var(--acc-700)', Icon: FiCheckCircle },
  } as const;

  if (loading) {
    return (
      <div className='orders-management'>
        <div className='orders-management__container'>
          <div className='orders-management__loading'>Cargando pedidos...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className='orders-management'>
        <div className='orders-management__container'>
          {/* Summary Cards */}
          <div className='orders-management__summary'>
            <div className='orders-summary-card orders-summary-card--pending'>
              <div className='orders-summary-card__icon-wrapper'>
                <div className='orders-summary-card__icon'>
                  <FiClock size={28} />
                </div>
              </div>
              <div className='orders-summary-card__content'>
                <div className='orders-summary-card__number orders-summary-card__number--pending'>
                  {stats?.pendientes || 0}
                </div>
                <div className='orders-summary-card__label'>Pendientes</div>
              </div>
            </div>

            <div className='orders-summary-card orders-summary-card--in-process'>
              <div className='orders-summary-card__icon-wrapper'>
                <div className='orders-summary-card__icon'>
                  <FiRefreshCw size={28} />
                </div>
              </div>
              <div className='orders-summary-card__content'>
                <div className='orders-summary-card__number orders-summary-card__number--in-process'>
                  {stats?.enProceso || 0}
                </div>
                <div className='orders-summary-card__label'>En Proceso</div>
              </div>
            </div>

            <div className='orders-summary-card orders-summary-card--completed'>
              <div className='orders-summary-card__icon-wrapper'>
                <div className='orders-summary-card__icon'>
                  <FiCheckCircle size={28} />
                </div>
              </div>
              <div className='orders-summary-card__content'>
                <div className='orders-summary-card__number orders-summary-card__number--completed'>
                  {stats?.completados || 0}
                </div>
                <div className='orders-summary-card__label'>Completados</div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className='orders-management__filters'>
            {['Todos', 'Pendiente', 'En Proceso', 'Completado'].map((filterOption) => (
              <Button
                key={filterOption}
                variant={filter === filterOption ? 'primary' : 'outline'}
                size='small'
                onClick={() => setFilter(filterOption as typeof filter)}
                className={`orders-filter-tab ${filter === filterOption ? 'orders-filter-tab--active' : ''}`}
              >
                {filterOption}
                {filterOption !== 'Todos' && stats && (
                  <span className='orders-filter-count'>
                    ({filterOption === 'Pendiente' && stats.pendientes}
                    {filterOption === 'En Proceso' && stats.enProceso}
                    {filterOption === 'Completado' && stats.completados})
                  </span>
                )}
              </Button>
            ))}
          </div>

          {/* Orders Cards */}
          <div className='orders-management__content'>
            {filter === 'Todos' ? (
              // Show all sections when "Todos" is selected
              Object.entries(groupedOrders).map(
                ([sectionName, sectionOrders]) =>
                  sectionOrders.length > 0 && (
                    <div key={sectionName} className='orders-management__section'>
                      <h3
                        className='orders-section__title'
                        style={{
                          color: sectionConfig[sectionName as keyof typeof sectionConfig].color,
                        }}
                      >
                        <span className='orders-section__icon'>
                          {(() => {
                            const { Icon } =
                              sectionConfig[sectionName as keyof typeof sectionConfig];
                            return <Icon size={18} />;
                          })()}
                        </span>
                        {sectionName} ({sectionOrders.length})
                      </h3>

                      <div className='orders-cards-grid'>
                        {sectionOrders.map((order) => (
                          <OrderCard
                            key={order.id}
                            order={{
                              id: order.id.toString(),
                              clientName: order.clientName,
                              date: new Date(order.fecha).toLocaleDateString(),
                              quotationNumber: order.cotizacion || 'N/A',
                              items: order.productos.length,
                              total: order.total,
                              status: order.estado as any,
                            }}
                            onViewDetail={handleViewDetail}
                          />
                        ))}
                      </div>
                    </div>
                  )
              )
            ) : (
              // Show filtered section
              <div className='orders-management__section'>
                <h3 className='orders-section__title'>
                  {filter} ({filteredOrders.length})
                </h3>

                <div className='orders-cards-grid'>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={{
                          id: order.id.toString(),
                          clientName: order.clientName,
                          date: new Date(order.fecha).toLocaleDateString(),
                          quotationNumber: order.cotizacion || 'N/A',
                          items: order.productos.length,
                          total: order.total,
                          status: order.estado as any,
                        }}
                        onViewDetail={handleViewDetail}
                      />
                    ))
                  ) : (
                    <div className='orders-empty-state'>
                      <div className='orders-empty-state__icon'>
                        <FiClock size={48} color='var(--pri-300)' />
                      </div>
                      <div className='orders-empty-state__message'>
                        No hay pedidos {filter.toLowerCase()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Detalles */}
      {selectedOrderId && (
        <OrderDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedOrderId(null);
          }}
          orderId={selectedOrderId}
          empresaId={empresaId}
          onStatusUpdate={handleUpdateStatus}
        />
      )}

      {/* Modal de Error */}
      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title='Error'
        message={modalMessage}
        modalType='error'
        confirmButtonText='Entendido'
      />

      {/* Modal de Éxito */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title='Éxito'
        message={modalMessage}
        modalType='success'
        confirmButtonText='Aceptar'
      />
    </>
  );
}

export default OrdersManagement;
