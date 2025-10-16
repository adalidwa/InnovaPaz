import { useState, useEffect } from 'react';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import SalesService from '../services/salesService';
import './NewQuoteModal.css';

interface Product {
  id: number;
  name: string;
  code: string;
  price: number;
  stock: number;
}

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
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<QuoteProduct[]>([]);
  const [searchProduct, setSearchProduct] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [observations, setObservations] = useState('');
  const [globalDiscount, setGlobalDiscount] = useState(0);

  const empresaId = localStorage.getItem('empresaId') || '5dc644b0-3ce9-4c41-a83d-c7da2962214d';

  useEffect(() => {
    if (isOpen) {
      loadProducts();
      setDefaultValidUntil();
    }
  }, [isOpen]);

  const setDefaultValidUntil = () => {
    const date = new Date();
    date.setDate(date.getDate() + 15);
    setValidUntil(date.toISOString().split('T')[0]);
  };

  const loadProducts = async () => {
    try {
      const data = await SalesService.getAllProducts();
      setProducts(data);
    } catch (err) {
      console.error('Error al cargar productos:', err);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
      p.code.toLowerCase().includes(searchProduct.toLowerCase())
  );

  const handleAddProduct = (product: Product) => {
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
      setSearchProduct('');
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
    if (!clientName.trim()) {
      alert('Ingrese el nombre del cliente');
      return;
    }
    if (!clientEmail.trim()) {
      alert('Ingrese el email del cliente');
      return;
    }
    if (!validUntil) {
      alert('Ingrese la fecha de validez');
      return;
    }
    if (selectedProducts.length === 0) {
      alert('Agregue al menos un producto');
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
      alert('Cotización creada exitosamente');
      onSuccess();
      handleClose();
    } catch (err: any) {
      console.error('Error al crear cotización:', err);
      alert('Error al crear la cotización: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setClientName('');
    setClientEmail('');
    setClientPhone('');
    setValidUntil('');
    setObservations('');
    setGlobalDiscount(0);
    setSelectedProducts([]);
    setSearchProduct('');
    onClose();
  };

  return (
    <Modal
      message=''
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
          <div className='new-quote-modal__grid'>
            <Input
              label='Nombre del Cliente'
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder='Ingrese el nombre'
              required
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
          <div className='new-quote-modal__search-wrapper'>
            <Input
              label='Buscar Producto'
              value={searchProduct}
              onChange={(e) => setSearchProduct(e.target.value)}
              placeholder='Buscar por nombre o código...'
            />
            {searchProduct && filteredProducts.length > 0 && (
              <div className='new-quote-modal__search-results'>
                {filteredProducts.slice(0, 5).map((product) => (
                  <div
                    key={product.id}
                    className='new-quote-modal__search-item'
                    onClick={() => handleAddProduct(product)}
                  >
                    <span className='new-quote-modal__product-code'>{product.code}</span>
                    <span className='new-quote-modal__product-name'>{product.name}</span>
                    <span className='new-quote-modal__product-price'>
                      Bs. {product.price.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

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
  );
}

export default NewQuoteModal;
