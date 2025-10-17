import { useState, useEffect } from 'react';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import ClientSelector, { type Client } from './ClientSelector';
import ProductSelector, { type Product } from './ProductSelector';
import SalesService from '../services/salesService';
import './NewQuoteModal.css';

interface QuoteProduct {
  producto_id: number;
  name: string;
  code: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  descuento: number;
}

interface NewQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function NewQuoteModal({ isOpen, onClose, onSuccess }: NewQuoteModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<QuoteProduct[]>([]);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [observations, setObservations] = useState('');
  const [globalDiscount, setGlobalDiscount] = useState(0);

  // Estados para modales
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const empresaId = localStorage.getItem('empresaId') || '5dc644b0-3ce9-4c41-a83d-c7da2962214d';

  useEffect(() => {
    if (isOpen) {
      setDefaultValidUntil();
    }
  }, [isOpen]);

  // Autocompletar datos cuando se selecciona un cliente
  useEffect(() => {
    if (selectedClient) {
      setClientName(selectedClient.name);
      setClientEmail(selectedClient.email || '');
      setClientPhone(selectedClient.phone || '');
    } else {
      setClientName('');
      setClientEmail('');
      setClientPhone('');
    }
  }, [selectedClient]);

  const setDefaultValidUntil = () => {
    const date = new Date();
    date.setDate(date.getDate() + 15);
    setValidUntil(date.toISOString().split('T')[0]);
  };

  const handleSelectProduct = (product: Product) => {
    const exists = selectedProducts.find((p) => p.producto_id === product.id);
    if (!exists) {
      setSelectedProducts([
        ...selectedProducts,
        {
          producto_id: product.id,
          name: product.name,
          code: product.code,
          cantidad: 1,
          precio_unitario: product.price,
          subtotal: product.price,
          descuento: 0,
        },
      ]);
    }
  };

  const handleUpdateQuantity = (index: number, cantidad: number) => {
    const updated = [...selectedProducts];
    updated[index].cantidad = cantidad;
    updated[index].subtotal = cantidad * updated[index].precio_unitario - updated[index].descuento;
    setSelectedProducts(updated);
  };

  const handleUpdateDiscount = (index: number, descuento: number) => {
    const updated = [...selectedProducts];
    updated[index].descuento = descuento;
    updated[index].subtotal = updated[index].cantidad * updated[index].precio_unitario - descuento;
    setSelectedProducts(updated);
  };

  const handleRemoveProduct = (index: number) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => {
    return selectedProducts.reduce((sum, p) => sum + p.subtotal, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() - globalDiscount;
  };

  const handleSubmit = async () => {
    // Validaciones con modales
    if (!clientName.trim()) {
      setModalMessage('Ingrese el nombre del cliente');
      setShowWarningModal(true);
      return;
    }
    if (!clientEmail.trim()) {
      setModalMessage('Ingrese el email del cliente');
      setShowWarningModal(true);
      return;
    }
    if (!validUntil) {
      setModalMessage('Ingrese la fecha de validez');
      setShowWarningModal(true);
      return;
    }
    if (selectedProducts.length === 0) {
      setModalMessage('Agregue al menos un producto');
      setShowWarningModal(true);
      return;
    }

    setLoading(true);
    try {
      const quoteNumber = await SalesService.generateQuoteNumber(empresaId);

      const quoteData = {
        numero_cotizacion: quoteNumber,
        fecha_validez: validUntil,
        subtotal: calculateSubtotal(),
        impuesto: 0,
        descuento: globalDiscount,
        total: calculateTotal(),
        observaciones: observations,
        nombre_cliente_directo: clientName,
        email_cliente_directo: clientEmail,
        telefono_cliente_directo: clientPhone,
        productos: selectedProducts,
      };

      await SalesService.createQuote(quoteData, empresaId);

      setModalMessage(`Cotización ${quoteNumber} creada exitosamente`);
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error('Error al crear cotización:', err);
      setModalMessage(err.message || 'Error desconocido al crear la cotización');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    onSuccess();
    handleClose();
  };

  const handleClose = () => {
    setSelectedClient(null);
    setClientName('');
    setClientEmail('');
    setClientPhone('');
    setValidUntil('');
    setObservations('');
    setGlobalDiscount(0);
    setSelectedProducts([]);
    onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title='Nueva Cotización'
        message=''
        size='large'
        closeOnOverlayClick={false}
        showConfirmButton={false}
      >
        <div className='new-quote-modal__wrapper'>
          {/* Información del Cliente */}
          <section className='new-quote-modal__section'>
            <h3>Información del Cliente</h3>

            {/* Selector de Cliente */}
            <ClientSelector onSelectClient={setSelectedClient} selectedClient={selectedClient} />

            {/* Campos autocompletados o editables */}
            <div className='new-quote-modal__grid'>
              <Input
                label='Nombre del Cliente'
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder='Ingrese el nombre'
                required
                disabled={!!selectedClient}
              />
              <Input
                label='Email'
                type='email'
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder='cliente@email.com'
                required
              />
            </div>
            <div className='new-quote-modal__grid'>
              <Input
                label='Teléfono'
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder='Ingrese el teléfono'
              />
              <Input
                label='Válida hasta'
                type='date'
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                required
              />
            </div>
          </section>

          {/* Productos */}
          <section className='new-quote-modal__section'>
            <h3>Productos</h3>

            {/* Selector de Productos */}
            <ProductSelector onSelectProduct={handleSelectProduct} />

            {selectedProducts.length > 0 && (
              <div className='new-quote-modal__products-table'>
                <table>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Precio Unit.</th>
                      <th>Descuento</th>
                      <th>Subtotal</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProducts.map((product, index) => (
                      <tr key={index}>
                        <td>
                          <strong>{product.name}</strong>
                          <br />
                          <small>{product.code}</small>
                        </td>
                        <td>
                          <input
                            type='number'
                            min='1'
                            value={product.cantidad}
                            onChange={(e) =>
                              handleUpdateQuantity(index, parseInt(e.target.value) || 1)
                            }
                            className='new-quote-modal__quantity-input'
                          />
                        </td>
                        <td>Bs. {product.precio_unitario.toFixed(2)}</td>
                        <td>
                          <input
                            type='number'
                            min='0'
                            step='0.01'
                            value={product.descuento}
                            onChange={(e) =>
                              handleUpdateDiscount(index, parseFloat(e.target.value) || 0)
                            }
                            className='new-quote-modal__discount-input'
                          />
                        </td>
                        <td>
                          <strong>Bs. {product.subtotal.toFixed(2)}</strong>
                        </td>
                        <td>
                          <button
                            type='button'
                            className='new-quote-modal__remove-btn'
                            onClick={() => handleRemoveProduct(index)}
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Resumen */}
          <section className='new-quote-modal__summary-section'>
            <div className='new-quote-modal__observations-wrapper'>
              <label htmlFor='observations'>Observaciones</label>
              <textarea
                id='observations'
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder='Observaciones adicionales...'
                rows={4}
              />
            </div>
            <div className='new-quote-modal__totals-wrapper'>
              <div className='new-quote-modal__total-line'>
                <span>Subtotal:</span>
                <strong>Bs. {calculateSubtotal().toFixed(2)}</strong>
              </div>
              <div className='new-quote-modal__total-line'>
                <span>Descuento global:</span>
                <input
                  type='number'
                  min='0'
                  step='0.01'
                  value={globalDiscount}
                  onChange={(e) => setGlobalDiscount(parseFloat(e.target.value) || 0)}
                  className='new-quote-modal__discount-input'
                />
              </div>
              <div className='new-quote-modal__total-line new-quote-modal__total-final'>
                <span>Total:</span>
                <strong>Bs. {calculateTotal().toFixed(2)}</strong>
              </div>
            </div>
          </section>

          {/* Footer con botones */}
          <footer className='new-quote-modal__footer'>
            <Button variant='outline' size='medium' onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button variant='primary' size='medium' onClick={handleSubmit} disabled={loading}>
              {loading ? 'Guardando...' : 'Crear Cotización'}
            </Button>
          </footer>
        </div>
      </Modal>

      {/* Modal de Advertencia */}
      <Modal
        isOpen={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        title='Atención'
        message={modalMessage}
        modalType='warning'
        confirmButtonText='Entendido'
      />

      {/* Modal de Error */}
      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title='Error al Crear Cotización'
        message={modalMessage}
        modalType='error'
        confirmButtonText='Entendido'
      />

      {/* Modal de Éxito */}
      <Modal
        isOpen={showSuccessModal}
        onClose={handleSuccessConfirm}
        title='¡Cotización Creada!'
        message={modalMessage}
        modalType='success'
        confirmButtonText='Aceptar'
        onConfirm={handleSuccessConfirm}
      />
    </>
  );
}

export default NewQuoteModal;
