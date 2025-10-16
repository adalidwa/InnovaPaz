import { useState, useEffect } from 'react';
import Button from '../../../components/common/Button';
import TitleDescription from '../../../components/common/TitleDescription';
import QuoteCard from './QuoteCard';
import SalesService from '../services/salesService';
import NewQuoteModal from './NewQuoteModal';
import QuoteDetailsModal from './QuoteDetailsModal';
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

const filterOptions = [
  { id: 'todas', label: 'Todas' },
  { id: 'pendientes', label: 'Pendientes' },
  { id: 'aprobadas', label: 'Aprobadas' },
  { id: 'rechazadas', label: 'Rechazadas' },
];

// Mapeo de estados de la BD al frontend
const statusMap: Record<string, 'Pendiente' | 'Aprobada' | 'Rechazada' | 'Convertida'> = {
  Pendiente: 'Pendiente',
  Aprobada: 'Aprobada',
  Rechazada: 'Rechazada',
  Convertida: 'Convertida',
};

// Mapeo inverso para actualizar estados
const statusToIdMap: Record<string, number> = {
  Pendiente: 1,
  Aprobada: 2,
  Rechazada: 3,
  Convertida: 4,
};

function QuotesManagement({ onNewQuote }: QuotesManagementProps) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [activeFilter, setActiveFilter] = useState('todas');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Obtener empresaId del localStorage
  const empresaId = localStorage.getItem('empresaId') || '5dc644b0-3ce9-4c41-a83d-c7da2962214d';

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await SalesService.getAllQuotes(empresaId);

      // Mapear datos del backend al formato del frontend
      const mappedQuotes: Quote[] = data.map((item: any) => ({
        id: item.cotizacion_id.toString(),
        quoteNumber: item.numero_cotizacion,
        client: item.cliente_nombre,
        date: item.fecha_cotizacion.split('T')[0],
        items: parseInt(item.total_items) || 0,
        validUntil: item.fecha_validez.split('T')[0],
        total: parseFloat(item.total),
        status: statusMap[item.estado] || 'Pendiente',
      }));

      setQuotes(mappedQuotes);
    } catch (err: any) {
      console.error('Error al cargar cotizaciones:', err);
      setError('Error al cargar las cotizaciones. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewQuote = () => {
    setIsModalOpen(true);
    if (onNewQuote) {
      onNewQuote();
    } else {
      console.log('Creando nueva cotización...');
    }
  };

  const handleApproveQuote = async (quote: Quote) => {
    try {
      await SalesService.updateQuoteStatus(
        parseInt(quote.id),
        statusToIdMap['Aprobada'],
        empresaId
      );
      await loadQuotes();
    } catch (err) {
      console.error('Error al aprobar cotización:', err);
      alert('Error al aprobar la cotización');
    }
  };

  const handleRejectQuote = async (quote: Quote) => {
    try {
      await SalesService.updateQuoteStatus(
        parseInt(quote.id),
        statusToIdMap['Rechazada'],
        empresaId
      );
      await loadQuotes();
    } catch (err) {
      console.error('Error al rechazar cotización:', err);
      alert('Error al rechazar la cotización');
    }
  };

  const handleConvertToOrder = async (quote: Quote) => {
    try {
      await SalesService.convertQuoteToOrder(parseInt(quote.id), empresaId);
      await loadQuotes();
    } catch (err) {
      console.error('Error al convertir cotización:', err);
      alert('Error al convertir la cotización a pedido');
    }
  };

  const handleViewDetails = (quote: Quote) => {
    setSelectedQuoteId(quote.id);
    setIsDetailsModalOpen(true);
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

  if (loading) {
    return (
      <div className='quotes-management'>
        <div className='quotes-management__container'>
          <div className='quotes-management__loading'>
            <p>Cargando cotizaciones...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='quotes-management'>
        <div className='quotes-management__container'>
          <div className='quotes-management__error'>
            <p>{error}</p>
            <Button variant='primary' size='medium' onClick={loadQuotes}>
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    );
  }

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

      <NewQuoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadQuotes}
      />

      {isDetailsModalOpen && selectedQuoteId && (
        <QuoteDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedQuoteId(null);
          }}
          quoteId={selectedQuoteId}
        />
      )}
    </div>
  );
}

export default QuotesManagement;
