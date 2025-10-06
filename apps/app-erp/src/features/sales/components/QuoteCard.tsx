import React from 'react';
import Button from '../../../components/common/Button';
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
      Pendiente: { className: 'quote-card__status--pending', label: 'Pendiente' },
      Aprobada: { className: 'quote-card__status--approved', label: 'Aprobada' },
      Rechazada: { className: 'quote-card__status--rejected', label: 'Rechazada' },
      Convertida: { className: 'quote-card__status--converted', label: 'Convertida' },
    };

    const config = statusConfig[status];
    return <span className={`quote-card__status ${config.className}`}>{config.label}</span>;
  };

  const renderActionButtons = () => {
    switch (quote.status) {
      case 'Pendiente':
        return (
          <div className='quote-card__actions'>
            <Button
              variant='outline'
              size='small'
              onClick={() => onViewDetails(quote)}
              icon={
                <svg width='14' height='14' viewBox='0 0 24 24' fill='currentColor'>
                  <path d='M12 9C10.34 9 9 10.34 9 12S10.34 15 12 15 15 13.66 15 12 13.66 9 12 9M12 17C9.76 17 7.81 15.74 7.81 14.16C7.81 12.58 9.76 11.32 12 11.32S16.19 12.58 16.19 14.16C16.19 15.74 14.24 17 12 17M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5S21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5Z' />
                </svg>
              }
              iconPosition='left'
              className='quote-card__action-btn'
            >
              Ver Detalle
            </Button>
            <div className='quote-card__primary-actions'>
              <Button
                variant='success'
                size='small'
                onClick={() => onApprove(quote)}
                icon={
                  <svg width='14' height='14' viewBox='0 0 24 24' fill='currentColor'>
                    <path d='M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z' />
                  </svg>
                }
                iconPosition='left'
                className='quote-card__action-btn'
              >
                Aprobar
              </Button>
              <Button
                variant='accent'
                size='small'
                onClick={() => onReject(quote)}
                icon={
                  <svg width='14' height='14' viewBox='0 0 24 24' fill='currentColor'>
                    <path d='M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z' />
                  </svg>
                }
                iconPosition='left'
                className='quote-card__action-btn'
              >
                Rechazar
              </Button>
            </div>
          </div>
        );

      case 'Aprobada':
        return (
          <div className='quote-card__actions'>
            <Button
              variant='outline'
              size='small'
              onClick={() => onViewDetails(quote)}
              icon={
                <svg width='14' height='14' viewBox='0 0 24 24' fill='currentColor'>
                  <path d='M12 9C10.34 9 9 10.34 9 12S10.34 15 12 15 15 13.66 15 12 13.66 9 12 9M12 17C9.76 17 7.81 15.74 7.81 14.16C7.81 12.58 9.76 11.32 12 11.32S16.19 12.58 16.19 14.16C16.19 15.74 14.24 17 12 17M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5S21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5Z' />
                </svg>
              }
              iconPosition='left'
              className='quote-card__action-btn'
            >
              Ver Detalle
            </Button>
            <Button
              variant='primary'
              size='small'
              onClick={() => onConvertToOrder(quote)}
              icon={
                <svg width='14' height='14' viewBox='0 0 24 24' fill='currentColor'>
                  <path d='M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z' />
                </svg>
              }
              iconPosition='left'
              className='quote-card__action-btn quote-card__convert-btn'
            >
              Convertir a Pedido
            </Button>
          </div>
        );

      case 'Rechazada':
        return (
          <div className='quote-card__actions'>
            <Button
              variant='outline'
              size='small'
              onClick={() => onViewDetails(quote)}
              icon={
                <svg width='14' height='14' viewBox='0 0 24 24' fill='currentColor'>
                  <path d='M12 9C10.34 9 9 10.34 9 12S10.34 15 12 15 15 13.66 15 12 13.66 9 12 9M12 17C9.76 17 7.81 15.74 7.81 14.16C7.81 12.58 9.76 11.32 12 11.32S16.19 12.58 16.19 14.16C16.19 15.74 14.24 17 12 17M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5S21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5Z' />
                </svg>
              }
              iconPosition='left'
              className='quote-card__action-btn'
            >
              Ver Detalle
            </Button>
          </div>
        );

      case 'Convertida':
        return (
          <div className='quote-card__actions'>
            <Button
              variant='outline'
              size='small'
              onClick={() => onViewDetails(quote)}
              icon={
                <svg width='14' height='14' viewBox='0 0 24 24' fill='currentColor'>
                  <path d='M12 9C10.34 9 9 10.34 9 12S10.34 15 12 15 15 13.66 15 12 13.66 9 12 9M12 17C9.76 17 7.81 15.74 7.81 14.16C7.81 12.58 9.76 11.32 12 11.32S16.19 12.58 16.19 14.16C16.19 15.74 14.24 17 12 17M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5S21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5Z' />
                </svg>
              }
              iconPosition='left'
              className='quote-card__action-btn'
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
    <div className='quote-card'>
      <div className='quote-card__header'>
        <div className='quote-card__document-icon'>
          <svg width='20' height='20' viewBox='0 0 24 24' fill='currentColor'>
            <path d='M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2M18 20H6V4H13V9H18V20Z' />
          </svg>
        </div>
        {getStatusTag(quote.status)}
      </div>

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

      <div className='quote-card__footer'>{renderActionButtons()}</div>
    </div>
  );
}

export default QuoteCard;
