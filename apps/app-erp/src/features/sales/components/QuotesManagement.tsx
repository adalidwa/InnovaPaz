import React, { useState } from 'react';
import Button from '../../../components/common/Button';
import TitleDescription from '../../../components/common/TitleDescription';
import QuoteCard from './QuoteCard';
import './QuotesManagement.css';

export interface Quote {
  id: string;
  quoteNumber: string;
  client: string;
  date: string;
  items: number;
  validUntil: string;
  total: number;
  status: 'Pendiente' | 'Aprobada' | 'Rechazada' | 'Convertida';
}

interface QuotesManagementProps {
  onNewQuote?: () => void;
}

// Datos de ejemplo basados en la imagen
const mockQuotes: Quote[] = [
  {
    id: '1',
    quoteNumber: 'COT-2024-001',
    client: 'Juan Pérez',
    date: '2024-03-20',
    items: 3,
    validUntil: '2024-04-20',
    total: 450.0,
    status: 'Pendiente',
  },
  {
    id: '2',
    quoteNumber: 'COT-2024-002',
    client: 'María García',
    date: '2024-03-19',
    items: 5,
    validUntil: '2024-04-19',
    total: 780.0,
    status: 'Aprobada',
  },
  {
    id: '3',
    quoteNumber: 'COT-2024-003',
    client: 'Pedro López',
    date: '2024-03-18',
    items: 2,
    validUntil: '2024-04-18',
    total: 230.0,
    status: 'Rechazada',
  },
  {
    id: '4',
    quoteNumber: 'COT-2024-004',
    client: 'Ana Martínez',
    date: '2024-03-17',
    items: 4,
    validUntil: '2024-04-17',
    total: 560.0,
    status: 'Convertida',
  },
];

const filterOptions = [
  { id: 'todas', label: 'Todas' },
  { id: 'pendientes', label: 'Pendientes' },
  { id: 'aprobadas', label: 'Aprobadas' },
  { id: 'rechazadas', label: 'Rechazadas' },
];

function QuotesManagement({ onNewQuote }: QuotesManagementProps) {
  const [quotes] = useState<Quote[]>(mockQuotes);
  const [activeFilter, setActiveFilter] = useState('todas');

  const handleNewQuote = () => {
    if (onNewQuote) {
      onNewQuote();
    } else {
      console.log('Creando nueva cotización...');
    }
  };

  const handleApproveQuote = (quote: Quote) => {
    console.log('Aprobando cotización:', quote.quoteNumber);
  };

  const handleRejectQuote = (quote: Quote) => {
    console.log('Rechazando cotización:', quote.quoteNumber);
  };

  const handleConvertToOrder = (quote: Quote) => {
    console.log('Convirtiendo a pedido:', quote.quoteNumber);
  };

  const handleViewDetails = (quote: Quote) => {
    console.log('Viendo detalles:', quote.quoteNumber);
  };

  const filteredQuotes = quotes.filter((quote) => {
    switch (activeFilter) {
      case 'pendientes':
        return quote.status === 'Pendiente';
      case 'aprobadas':
        return quote.status === 'Aprobada';
      case 'rechazadas':
        return quote.status === 'Rechazada';
      default:
        return true;
    }
  });

  return (
    <div className='quotes-management'>
      <div className='quotes-management__container'>
        {/* Header Section */}
        <div className='quotes-management__header'>
          <div className='quotes-management__title-section'>
            <div className='quotes-management__icon'>
              <svg width='24' height='24' viewBox='0 0 24 24' fill='currentColor'>
                <path d='M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2M18 20H6V4H13V9H18V20Z' />
              </svg>
            </div>
            <TitleDescription
              title='Gestión de Cotizaciones'
              description='Crea y gestiona cotizaciones para tus clientes'
              titleSize={24}
              descriptionSize={14}
              titleWeight='semibold'
              descriptionWeight='normal'
              titleColor='var(--pri-900)'
              descriptionColor='var(--pri-600)'
              className='quotes-management__title-desc'
            />
          </div>

          <div className='quotes-management__actions'>
            <Button
              variant='primary'
              size='medium'
              onClick={handleNewQuote}
              icon={
                <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'>
                  <path d='M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z' />
                </svg>
              }
              iconPosition='left'
              className='quotes-management__new-quote-btn'
            >
              Nueva Cotización
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className='quotes-management__filters'>
          <div className='quotes-management__filter-tabs'>
            {filterOptions.map((option) => (
              <button
                key={option.id}
                className={`quotes-management__filter-tab ${
                  activeFilter === option.id ? 'quotes-management__filter-tab--active' : ''
                }`}
                onClick={() => setActiveFilter(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quotes Grid */}
        <div className='quotes-management__content'>
          {filteredQuotes.length === 0 ? (
            <div className='quotes-management__empty'>
              <div className='quotes-management__empty-icon'>
                <svg width='48' height='48' viewBox='0 0 24 24' fill='currentColor'>
                  <path d='M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2M18 20H6V4H13V9H18V20Z' />
                </svg>
              </div>
              <h3 className='quotes-management__empty-title'>No hay cotizaciones</h3>
              <p className='quotes-management__empty-message'>
                No se encontraron cotizaciones para el filtro seleccionado.
              </p>
            </div>
          ) : (
            <div className='quotes-management__grid'>
              {filteredQuotes.map((quote) => (
                <QuoteCard
                  key={quote.id}
                  quote={quote}
                  onApprove={handleApproveQuote}
                  onReject={handleRejectQuote}
                  onConvertToOrder={handleConvertToOrder}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuotesManagement;
