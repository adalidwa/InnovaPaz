import Button from '../../../components/common/Button';
import StatusTagBase from '../../../components/common/StatusTag';
import { FiPackage } from 'react-icons/fi';
import './OrderCard.css';

export interface OrderCardProps {
  order: {
    id: string;
    clientName: string;
    date: string;
    quotationNumber: string;
    items: number;
    total: number;
    status: 'Pendiente' | 'En Proceso' | 'Completada';
  };
  onViewDetail?: (id: string) => void;
}

function OrderCard({ order, onViewDetail }: OrderCardProps) {
  const { id, clientName, date, quotationNumber, items, total, status } = order;

  const statusColors = {
    Pendiente: { bg: 'var(--var-100)', fg: 'var(--var-800)' },
    'En Proceso': { bg: 'var(--sec-100)', fg: 'var(--sec-800)' },
    Completada: { bg: 'var(--acc-100)', fg: 'var(--acc-800)' },
  } as const;

  const colors = statusColors[status];

  return (
    <article className='order-card' data-status={status}>
      <header className='order-card__header'>
        <div
          className='order-card__avatar'
          style={{ backgroundColor: colors.bg, color: colors.fg }}
        >
          <FiPackage size={18} />
        </div>
        <div className='order-card__id'>{id}</div>
        <div className='order-card__status'>
          <StatusTagBase
            text={status}
            backgroundColor={colors.bg}
            textColor={colors.fg}
            width='auto'
            height={24}
            radius={12}
          />
        </div>
      </header>

      <div className='order-card__body'>
        <div className='order-card__row'>
          <span className='order-card__label'>Cliente:</span>
          <span className='order-card__value order-card__value--strong'>{clientName}</span>
        </div>
        <div className='order-card__row'>
          <span className='order-card__label'>Fecha:</span>
          <span className='order-card__value'>{new Date(date).toLocaleDateString('es-ES')}</span>
        </div>
        <div className='order-card__row'>
          <span className='order-card__label'>Cotización:</span>
          <span className='order-card__value'>{quotationNumber}</span>
        </div>
        <div className='order-card__row'>
          <span className='order-card__label'>Items:</span>
          <span className='order-card__value'>{items}</span>
        </div>
      </div>

      <footer className='order-card__footer'>
        <div className='order-card__total'>
          <span className='order-card__total-label'>Total:</span>
          <span className='order-card__total-value'>Bs. {total.toFixed(2)}</span>
        </div>
        <div className='order-card__cta'>
          <Button size='small' variant='primary' onClick={() => onViewDetail?.(id)}>
            Ver Detalle
          </Button>
        </div>
      </footer>
    </article>
  );
}

export default OrderCard;
