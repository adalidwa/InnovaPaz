import { useState, useEffect } from 'react';
import { useUser } from '../../users/hooks/useContextBase';
import Modal from '../../../components/common/Modal';
import SalesService from '../services/salesService';
import './QuoteDetailsModal.css';

interface QuoteDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  quoteId: string;
}

function QuoteDetailsModal({ isOpen, onClose, quoteId }: QuoteDetailsModalProps) {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const empresaId = user?.empresa_id || '';

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
      console.error('Error al cargar detalles de cotización:', err);
      setError('Error al cargar los detalles de la cotización');
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (estado: string) => {
    const statusMap: Record<string, string> = {
      Pendiente: 'pending',
      Aprobada: 'approved',
      Rechazada: 'rejected',
      Convertida: 'converted',
    };
    return statusMap[estado] || 'pending';
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Detalle de Cotización'
      size='large'
      message={''}
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
            {/* Header */}
            <div className='quote-details__header'>
              <div className='quote-details__header-left'>
                <h3>{quote.numero_cotizacion}</h3>
                <span
                  className={`quote-details__status quote-details__status--${getStatusClass(
                    quote.estado
                  )}`}
                >
                  {quote.estado || 'Pendiente'}
                </span>
              </div>
              <div className='quote-details__header-right'>
                <div className='quote-details__total'>
                  <span className='quote-details__total-label'>Total</span>
                  <span className='quote-details__total-amount'>
                    Bs. {parseFloat(quote.total || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Información del Cliente */}
            <div className='quote-details__section'>
              <h4>Información del Cliente</h4>
              <div className='quote-details__info-grid'>
                <div className='quote-details__info-item'>
                  <span className='quote-details__info-label'>Cliente</span>
                  <span className='quote-details__info-value'>{quote.cliente_nombre || 'N/A'}</span>
                </div>
                <div className='quote-details__info-item'>
                  <span className='quote-details__info-label'>Email</span>
                  <span className='quote-details__info-value'>{quote.cliente_email || 'N/A'}</span>
                </div>
                <div className='quote-details__info-item'>
                  <span className='quote-details__info-label'>Teléfono</span>
                  <span className='quote-details__info-value'>
                    {quote.cliente_telefono || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Fechas */}
            <div className='quote-details__section'>
              <h4>Fechas</h4>
              <div className='quote-details__info-grid'>
                <div className='quote-details__info-item'>
                  <span className='quote-details__info-label'>Fecha de Cotización</span>
                  <span className='quote-details__info-value'>
                    {new Date(quote.fecha_cotizacion).toLocaleDateString('es-BO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className='quote-details__info-item'>
                  <span className='quote-details__info-label'>Válida hasta</span>
                  <span className='quote-details__info-value'>
                    {new Date(quote.fecha_validez).toLocaleDateString('es-BO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Productos */}
            <div className='quote-details__section'>
              <h4>Productos</h4>
              <div className='quote-details__products'>
                <table>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th style={{ textAlign: 'center' }}>Cantidad</th>
                      <th style={{ textAlign: 'right' }}>Precio Unit.</th>
                      <th style={{ textAlign: 'right' }}>Descuento</th>
                      <th style={{ textAlign: 'right' }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quote.productos?.map((product: any, index: number) => (
                      <tr key={index}>
                        <td>
                          <div>
                            <strong>{product.producto_nombre || product.name}</strong>
                            {product.producto_codigo && (
                              <div>
                                <small>Código: {product.producto_codigo}</small>
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>{product.cantidad}</td>
                        <td style={{ textAlign: 'right' }}>
                          Bs. {parseFloat(product.precio_unitario || 0).toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {parseFloat(product.descuento || 0) > 0
                            ? `- Bs. ${parseFloat(product.descuento).toFixed(2)}`
                            : '-'}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <strong>Bs. {parseFloat(product.subtotal || 0).toFixed(2)}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totales */}
            <div className='quote-details__section'>
              <div className='quote-details__totals'>
                <div className='quote-details__total-row'>
                  <span>Subtotal:</span>
                  <span>Bs. {parseFloat(quote.subtotal || 0).toFixed(2)}</span>
                </div>
                {parseFloat(quote.descuento || 0) > 0 && (
                  <div className='quote-details__total-row'>
                    <span>Descuento:</span>
                    <span style={{ color: 'var(--danger)' }}>
                      - Bs. {parseFloat(quote.descuento).toFixed(2)}
                    </span>
                  </div>
                )}
                {parseFloat(quote.impuesto || 0) > 0 && (
                  <div className='quote-details__total-row'>
                    <span>Impuesto:</span>
                    <span>Bs. {parseFloat(quote.impuesto).toFixed(2)}</span>
                  </div>
                )}
                <div className='quote-details__total-row quote-details__total-final'>
                  <span>Total:</span>
                  <span>Bs. {parseFloat(quote.total || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Observaciones */}
            {quote.observaciones && (
              <div className='quote-details__section'>
                <h4>Observaciones</h4>
                <div className='quote-details__observations'>{quote.observaciones}</div>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}

export default QuoteDetailsModal;
