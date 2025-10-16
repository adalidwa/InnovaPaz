import { useState, useEffect } from 'react';
import Modal from '../../../components/common/Modal';
import SalesService from '../services/salesService';
import './QuoteDetailsModal.css';

interface QuoteDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  quoteId: string;
}

function QuoteDetailsModal({ isOpen, onClose, quoteId }: QuoteDetailsModalProps) {
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const empresaId = localStorage.getItem('empresaId') || '5dc644b0-3ce9-4c41-a83d-c7da2962214d';

  useEffect(() => {
    if (isOpen && quoteId) {
      loadQuoteDetails();
    }
  }, [isOpen, quoteId]);

  const loadQuoteDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await SalesService.getQuoteById(parseInt(quoteId), empresaId);
      setQuote(data);
    } catch (err: any) {
      console.error('Error al cargar detalles:', err);
      setError('Error al cargar los detalles de la cotización');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-BO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadgeClass = (status: string) => {
    const statusMap: Record<string, string> = {
      Pendiente: 'quote-details__status--pending',
      Aprobada: 'quote-details__status--approved',
      Rechazada: 'quote-details__status--rejected',
      Convertida: 'quote-details__status--converted',
    };
    return statusMap[status] || 'quote-details__status--pending';
  };

  if (!isOpen) return null;

  return (
    <Modal
      message=''
      isOpen={isOpen}
      onClose={onClose}
      title='Detalles de Cotización'
      size='large'
      showConfirmButton={false}
    >
      <div className='quote-details'>
        {loading && (
          <div className='quote-details__loading'>
            <p>Cargando detalles...</p>
          </div>
        )}

        {error && (
          <div className='quote-details__error'>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && quote && (
          <>
            {/* Header con información principal */}
            <div className='quote-details__header'>
              <div className='quote-details__header-left'>
                <h3>{quote.numero_cotizacion}</h3>
                <span className={`quote-details__status ${getStatusBadgeClass(quote.estado)}`}>
                  {quote.estado}
                </span>
              </div>
              <div className='quote-details__header-right'>
                <div className='quote-details__total'>
                  <span className='quote-details__total-label'>Total</span>
                  <span className='quote-details__total-amount'>
                    Bs. {parseFloat(quote.total).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Información del cliente */}
            <div className='quote-details__section'>
              <h4>Información del Cliente</h4>
              <div className='quote-details__info-grid'>
                <div className='quote-details__info-item'>
                  <span className='quote-details__info-label'>Cliente:</span>
                  <span className='quote-details__info-value'>{quote.cliente_nombre}</span>
                </div>
                {quote.cliente_email && (
                  <div className='quote-details__info-item'>
                    <span className='quote-details__info-label'>Email:</span>
                    <span className='quote-details__info-value'>{quote.cliente_email}</span>
                  </div>
                )}
                {quote.cliente_telefono && (
                  <div className='quote-details__info-item'>
                    <span className='quote-details__info-label'>Teléfono:</span>
                    <span className='quote-details__info-value'>{quote.cliente_telefono}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Fechas */}
            <div className='quote-details__section'>
              <h4>Fechas</h4>
              <div className='quote-details__info-grid'>
                <div className='quote-details__info-item'>
                  <span className='quote-details__info-label'>Fecha de emisión:</span>
                  <span className='quote-details__info-value'>
                    {formatDate(quote.fecha_cotizacion)}
                  </span>
                </div>
                <div className='quote-details__info-item'>
                  <span className='quote-details__info-label'>Válida hasta:</span>
                  <span className='quote-details__info-value'>
                    {formatDate(quote.fecha_validez)}
                  </span>
                </div>
              </div>
            </div>

            {/* Productos */}
            {quote.productos && quote.productos.length > 0 && (
              <div className='quote-details__section'>
                <h4>Productos</h4>
                <div className='quote-details__products'>
                  <table>
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio Unit.</th>
                        <th>Descuento</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quote.productos.map((producto: any, index: number) => (
                        <tr key={index}>
                          <td>
                            <strong>{producto.producto_nombre}</strong>
                            <br />
                            <small>{producto.producto_codigo}</small>
                          </td>
                          <td>{producto.cantidad}</td>
                          <td>Bs. {parseFloat(producto.precio_unitario).toFixed(2)}</td>
                          <td>Bs. {parseFloat(producto.descuento || 0).toFixed(2)}</td>
                          <td>
                            <strong>Bs. {parseFloat(producto.subtotal).toFixed(2)}</strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Totales */}
            <div className='quote-details__section'>
              <div className='quote-details__totals'>
                <div className='quote-details__total-row'>
                  <span>Subtotal:</span>
                  <span>Bs. {parseFloat(quote.subtotal).toFixed(2)}</span>
                </div>
                {parseFloat(quote.descuento) > 0 && (
                  <div className='quote-details__total-row'>
                    <span>Descuento:</span>
                    <span>- Bs. {parseFloat(quote.descuento).toFixed(2)}</span>
                  </div>
                )}
                {parseFloat(quote.impuesto) > 0 && (
                  <div className='quote-details__total-row'>
                    <span>Impuesto:</span>
                    <span>Bs. {parseFloat(quote.impuesto).toFixed(2)}</span>
                  </div>
                )}
                <div className='quote-details__total-row quote-details__total-final'>
                  <span>Total:</span>
                  <strong>Bs. {parseFloat(quote.total).toFixed(2)}</strong>
                </div>
              </div>
            </div>

            {/* Observaciones */}
            {quote.observaciones && (
              <div className='quote-details__section'>
                <h4>Observaciones</h4>
                <p className='quote-details__observations'>{quote.observaciones}</p>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}

export default QuoteDetailsModal;
