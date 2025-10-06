import { useState } from 'react';
import Button from '../../../components/common/Button';
import OrderCard from './OrderCard';
import { FiClock, FiRefreshCw, FiCheckCircle } from 'react-icons/fi';
import './OrdersManagement.css';

// Define Order interface
export interface Order {
  id: string;
  clientName: string;
  date: string;
  quotationNumber: string;
  items: number;
  total: number;
  status: 'Pendiente' | 'En Proceso' | 'Completada';
}

// Mock data based on the screenshot
const mockOrders: Order[] = [
  {
    id: 'PED-2024-001',
    clientName: 'Juan Perez',
    date: '2024-03-20',
    quotationNumber: 'COT-2024-002',
    items: 5,
    total: 780.0,
    status: 'Pendiente',
  },
  {
    id: 'PED-2024-002',
    clientName: 'Maria Garcia',
    date: '2024-03-19',
    quotationNumber: 'COT-2024-005',
    items: 3,
    total: 450.0,
    status: 'En Proceso',
  },
  {
    id: 'PED-2024-003',
    clientName: 'Pedro López',
    date: '2024-03-18',
    quotationNumber: 'COT-2024-008',
    items: 7,
    total: 1250.0,
    status: 'Completada',
  },
];

function OrdersManagement() {
  const [orders] = useState<Order[]>(mockOrders);
  const [filter, setFilter] = useState<'Todos' | 'Pendientes' | 'En Proceso' | 'Completadas'>(
    'Todos'
  );

  // Filter orders based on selected filter
  const filteredOrders =
    filter === 'Todos' ? orders : orders.filter((order) => order.status === filter);

  // Count orders by status
  const pendingOrders = orders.filter((order) => order.status === 'Pendiente').length;
  const inProcessOrders = orders.filter((order) => order.status === 'En Proceso').length;
  const completedOrders = orders.filter((order) => order.status === 'Completada').length;

  const handleViewDetail = (orderId: string) => {
    console.log('Ver detalle del pedido:', orderId);
    // TODO: Implement order detail view
  };

  // Group filtered orders by status for section rendering
  const groupedOrders = {
    Pendientes: filteredOrders.filter((order) => order.status === 'Pendiente'),
    'En Proceso': filteredOrders.filter((order) => order.status === 'En Proceso'),
    Completadas: filteredOrders.filter((order) => order.status === 'Completada'),
  };

  const sectionConfig = {
    Pendientes: { color: 'var(--var-700)', Icon: FiClock },
    'En Proceso': { color: 'var(--sec-700)', Icon: FiRefreshCw },
    Completadas: { color: 'var(--acc-700)', Icon: FiCheckCircle },
  } as const;

  return (
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
                {pendingOrders}
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
                {inProcessOrders}
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
                {completedOrders}
              </div>
              <div className='orders-summary-card__label'>Completadas</div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className='orders-management__filters'>
          {['Todos', 'Pendientes', 'En Proceso', 'Completadas'].map((filterOption) => (
            <Button
              key={filterOption}
              variant={filter === filterOption ? 'primary' : 'outline'}
              size='small'
              onClick={() => setFilter(filterOption as typeof filter)}
              className={`orders-filter-tab ${filter === filterOption ? 'orders-filter-tab--active' : ''}`}
            >
              {filterOption}
              {filterOption !== 'Todos' && (
                <span className='orders-filter-count'>
                  ({filterOption === 'Pendientes' && pendingOrders}
                  {filterOption === 'En Proceso' && inProcessOrders}
                  {filterOption === 'Completadas' && completedOrders})
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
                          const { Icon } = sectionConfig[sectionName as keyof typeof sectionConfig];
                          return <Icon size={18} />;
                        })()}
                      </span>
                      {sectionName} ({sectionOrders.length})
                    </h3>

                    <div className='orders-cards-grid'>
                      {sectionOrders.map((order) => (
                        <OrderCard key={order.id} order={order} onViewDetail={handleViewDetail} />
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
                    <OrderCard key={order.id} order={order} onViewDetail={handleViewDetail} />
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
  );
}

export default OrdersManagement;
