import React from 'react';
import Button from '../../../components/common/Button';
import { FiEye, FiCheck, FiX, FiArrowRight, FiFileText } from 'react-icons/fi';
import { type Quote } from './QuotesManagement';
import './QuoteCard.css';

interface QuoteCardProps {
  quote: Quote;
  onApprove: (quote: Quote) => void;
  onReject: (quote: Quote) => void;
  onConvertToOrder: (quote: Quote) => void;
  onViewDetails: (quote: Quote) => void;
}

function QuoteCard({
  quote,
  onApprove,
  onReject,
  onConvertToOrder,
  onViewDetails,
}: QuoteCardProps) {
  const formatCurrency = (amount: number) => {
    return `Bs. ${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getStatusTag = (status: Quote['status']) => {
    const statusConfig = {
      Pendiente: { className: 'quote-card__status--pending', label: 'PENDIENTE' },
      Aprobada: { className: 'quote-card__status--approved', label: 'APROBADA' },
      Rechazada: { className: 'quote-card__status--rejected', label: 'RECHAZADA' },
      Convertida: { className: 'quote-card__status--converted', label: 'CONVERTIDA' },
    };

    const config = statusConfig[status];
    return <span className={`quote-card__status ${config.className}`}>{config.label}</span>;
  };

  const renderActionButtons = () => {
    switch (quote.status) {
      case 'Pendiente':
        return (
          <div className='quote-card__actions quote-card__actions--pending'>
            <div className='quote-card__action-row'>
              <Button
                variant='outline'
                size='small'
                onClick={() => onViewDetails(quote)}
                icon={<FiEye size={16} />}
                iconPosition='left'
                className='quote-card__view-detail-btn'
              >
                Ver Detalle
              </Button>
            </div>
            <div className='quote-card__action-row quote-card__primary-actions'>
              <Button
                variant='success'
                size='small'
                onClick={() => onApprove(quote)}
                icon={<FiCheck size={16} />}
                iconPosition='left'
                className='quote-card__approve-btn'
              >
                Aprobar
              </Button>
              <Button
                variant='accent'
                size='small'
                onClick={() => onReject(quote)}
                icon={<FiX size={16} />}
                iconPosition='left'
                className='quote-card__reject-btn'
              >
                Rechazar
              </Button>
            </div>
          </div>
        );

      case 'Aprobada':
        return (
          <div className='quote-card__actions quote-card__actions--approved'>
            <Button
              variant='outline'
              size='small'
              onClick={() => onViewDetails(quote)}
              icon={<FiEye size={16} />}
              iconPosition='left'
              className='quote-card__view-detail-btn'
            >
              Ver Detalle
            </Button>
            <Button
              variant='primary'
              size='small'
              onClick={() => onConvertToOrder(quote)}
              icon={<FiArrowRight size={16} />}
              iconPosition='left'
              className='quote-card__convert-btn'
            >
              Convertir a Pedido
            </Button>
          </div>
        );

      case 'Rechazada':
        return (
          <div className='quote-card__actions quote-card__actions--rejected'>
            <Button
              variant='outline'
              size='small'
              onClick={() => onViewDetails(quote)}
              icon={<FiEye size={16} />}
              iconPosition='left'
              className='quote-card__view-detail-btn'
            >
              Ver Detalle
            </Button>
          </div>
        );

      case 'Convertida':
        return (
          <div className='quote-card__actions quote-card__actions--converted'>
            <Button
              variant='outline'
              size='small'
              onClick={() => onViewDetails(quote)}
              icon={<FiEye size={16} />}
              iconPosition='left'
              className='quote-card__view-detail-btn'
            >
              Ver Detalle
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <article className={`quote-card quote-card--${quote.status.toLowerCase()}`}>
      <header className='quote-card__header'>
        <div className='quote-card__document-icon'>
          <FiFileText size={20} />
        </div>
        {getStatusTag(quote.status)}
      </header>

      <div className='quote-card__content'>
        <h3 className='quote-card__number'>{quote.quoteNumber}</h3>
        <p className='quote-card__client'>{quote.client}</p>

        <div className='quote-card__details'>
          <div className='quote-card__detail-item'>
            <span className='quote-card__detail-label'>Fecha:</span>
            <span className='quote-card__detail-value'>{formatDate(quote.date)}</span>
          </div>
          <div className='quote-card__detail-item'>
            <span className='quote-card__detail-label'>Items:</span>
            <span className='quote-card__detail-value'>{quote.items}</span>
          </div>
          <div className='quote-card__detail-item'>
            <span className='quote-card__detail-label'>Válido hasta:</span>
            <span className='quote-card__detail-value'>{formatDate(quote.validUntil)}</span>
          </div>
        </div>

        <div className='quote-card__total'>
          <span className='quote-card__total-label'>Total:</span>
          <span className='quote-card__total-value'>{formatCurrency(quote.total)}</span>
        </div>
      </div>

      <footer className='quote-card__footer'>{renderActionButtons()}</footer>
    </article>
  );
}

export default QuoteCard;
