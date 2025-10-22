import React, { useState, useMemo } from 'react';
import { useQuotes } from '../hooks/hooks';
import { IoSearch, IoAdd, IoClose, IoDocumentText, IoCheckmark, IoWarning } from 'react-icons/io5';

// Imports locales
import './QuotesPage.css';
import { exportXlsx } from '../../reports/utils/exportXlsx';

// Imports de componentes
import TitleDescription from '../../../components/common/TitleDescription';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';

// Helper para formatear fechas
const formatDate = (dateString: string): string => {
  if (!dateString) return 'Sin fecha';

  const date = new Date(dateString);

  // Verificar si la fecha es válida
  if (isNaN(date.getTime())) {
    return 'Sin fecha';
  }

  return date.toLocaleDateString('es-BO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

const PAGE_INFO = {
  title: 'Análisis de Precios y Cotizaciones',
  description: 'Compara precios entre proveedores para mejores decisiones',
};

// Tipos para TypeScript

interface NewQuoteForm {
  product: string;
  provider: string;
  price: string;
  date: string;
  description: string;
}

// Datos de ejemplo mejorados

const QuotesPage: React.FC = () => {
  // Estados principales
  // Hook para manejar cotizaciones desde BD
  const {
    quotesData,
    historicalData,

    // loading: quotesLoading,
  } = useQuotes();
  // quotesData viene directamente del hook
  // historicalData viene directamente del hook
  const [searchTerm, setSearchTerm] = useState('');

  // Estados de modales
  const [showNewQuoteModal, setShowNewQuoteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Estados de formularios
  const [newQuoteForm, setNewQuoteForm] = useState<NewQuoteForm>({
    product: '',
    provider: '',
    price: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Estados de UI
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Handlers para búsqueda
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(event.target.value);
  };

  // Handlers para modales
  const openNewQuoteModal = (): void => {
    setNewQuoteForm({
      product: '',
      provider: '',
      price: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
    });
    setShowNewQuoteModal(true);
  };

  const closeNewQuoteModal = (): void => {
    setShowNewQuoteModal(false);
    setNewQuoteForm({
      product: '',
      provider: '',
      price: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
    });
  };

  const openImportModal = (): void => {
    setSelectedFile(null);
    setShowImportModal(true);
  };

  const closeImportModal = (): void => {
    setShowImportModal(false);
    setSelectedFile(null);
  };

  // Handlers para formulario de nueva cotización
  const handleFormChange =
    (field: keyof NewQuoteForm) =>
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      setNewQuoteForm((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  // Handler para archivo de importación
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
  };

  // Validación de formulario
  const validateForm = (): string | null => {
    if (!newQuoteForm.product.trim()) return 'El nombre del producto es requerido';
    if (!newQuoteForm.provider.trim()) return 'El proveedor es requerido';
    if (!newQuoteForm.price || parseFloat(newQuoteForm.price) <= 0)
      return 'El precio debe ser mayor a 0';
    if (!newQuoteForm.date) return 'La fecha es requerida';
    return null;
  };

  // Handler para agregar nueva cotización
  const handleAddQuote = (): void => {
    const error = validateForm();
    if (error) {
      showNotification('error', error);
      return;
    }

    setIsLoading(true);

    // Simular llamada a API
    setTimeout(() => {
      // TODO: Implementar createQuote con los datos de newQuote
      // await createQuote(newQuoteData);
      closeNewQuoteModal();
      showNotification('success', 'Cotización agregada exitosamente');
      setIsLoading(false);
    }, 1000);
  };

  // Handler para importar Excel
  const handleImportExcel = (): void => {
    if (!selectedFile) {
      showNotification('error', 'Por favor selecciona un archivo');
      return;
    }

    if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
      showNotification('error', 'El archivo debe ser formato Excel (.xlsx o .xls)');
      return;
    }

    setIsLoading(true);

    // Simular importación
    setTimeout(() => {
      showNotification('success', `Archivo "${selectedFile.name}" importado exitosamente`);
      closeImportModal();
      setIsLoading(false);
    }, 2000);
  };

  // Handler para exportar Excel
  const handleExportExcel = (): void => {
    setIsLoading(true);

    try {
      const excelData = historicalData.map((item) => ({
        Producto: item.product,
        Proveedor: item.provider,
        'Precio Anterior': `Bs. ${item.previousPrice.toFixed(2)}`,
        'Precio Actual': `Bs. ${item.currentPrice.toFixed(2)}`,
        Variación: item.variation,
        Fecha: formatDate(item.date),
      }));

      exportXlsx('historico-precios', {
        'Histórico de Precios': excelData,
      });

      showNotification('success', 'Archivo exportado exitosamente');
    } catch (error) {
      showNotification('error', 'Error al exportar el archivo');
    }

    setIsLoading(false);
  };

  // Sistema de notificaciones
  const showNotification = (type: 'success' | 'error', message: string): void => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Filtrar datos basado en la búsqueda
  const filteredQuotes = useMemo(() => {
    if (!searchTerm) return quotesData;

    return quotesData.filter(
      (quote) =>
        quote.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.quotes.some((q: any) => q.provider.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [quotesData, searchTerm]);

  return (
    <div className='quotes-page'>
      {/* Notificación */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <div className='notification-content'>
            {notification.type === 'success' ? <IoCheckmark /> : <IoWarning />}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      <div className='quotes-header'>
        <div className='quotes-title-section'>
          <TitleDescription
            title={PAGE_INFO.title}
            description={PAGE_INFO.description}
            titleSize={32}
            descriptionSize={16}
          />
          <div className='quotes-buttons'>
            <Button
              variant='primary'
              onClick={openNewQuoteModal}
              icon={<IoAdd />}
              disabled={isLoading}
            >
              Nueva cotización
            </Button>
            <Button
              variant='secondary'
              onClick={openImportModal}
              icon={<IoDocumentText />}
              disabled={isLoading}
            >
              Importar Excel
            </Button>
          </div>
        </div>

        <div className='quotes-search'>
          <Input
            placeholder='Buscar cotizaciones o proveedores...'
            value={searchTerm}
            onChange={handleSearchChange}
            leftIcon={<IoSearch color='var(--pri-500)' />}
            className='search-input'
          />
        </div>
      </div>

      <div className='quotes-content'>
        {/* Sección de comparación de cotizaciones */}
        <div className='quotes-comparison'>
          <h2>Comparación de Cotizaciones</h2>
          {filteredQuotes.length > 0 ? (
            <div className='comparison-items'>
              {filteredQuotes.map((quote) => (
                <div key={quote.id} className='comparison-item'>
                  <div className='comparison-header'>
                    <h3 className='product-name'>{quote.productName}</h3>
                    <div className='comparison-date'>Fecha: {formatDate(quote.date)}</div>
                  </div>

                  <div className='providers-comparison'>
                    {quote.quotes.map((providerQuote: any, index: number) => (
                      <div
                        key={index}
                        className={`provider-quote ${providerQuote.isBest ? 'best-price' : ''}`}
                      >
                        {providerQuote.isBest && (
                          <div className='best-price-badge'>Mejor Precio</div>
                        )}
                        <div className='provider-name'>{providerQuote.provider}</div>
                        <div className='quote-price'>Bs. {providerQuote.price.toFixed(1)}</div>
                        <div className='price-unit'>por unidad</div>
                        {providerQuote.notes && (
                          <div className='quote-notes'>{providerQuote.notes}</div>
                        )}
                      </div>
                    ))}
                  </div>

                  {quote.savings > 0 && (
                    <div className='savings-info'>
                      Ahorro potencial: Bs. {quote.savings.toFixed(2)} por unidad
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className='no-results'>
              {searchTerm
                ? `No se encontraron cotizaciones que coincidan con "${searchTerm}"`
                : 'No hay cotizaciones disponibles'}
            </div>
          )}
        </div>

        {/* Tabla de histórico de precios */}
        <div className='historical-prices'>
          <div className='historical-header'>
            <h2>Histórico de Precios</h2>
            <button
              className={`export-btn ${isLoading ? 'loading' : ''}`}
              onClick={handleExportExcel}
              disabled={isLoading}
            >
              {isLoading ? 'Exportando...' : 'Exportar'}
            </button>
          </div>

          <table className='historical-table'>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Proveedor</th>
                <th>Precio Anterior</th>
                <th>Precio Actual</th>
                <th>Variación</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {historicalData.map((item) => (
                <tr key={item.id}>
                  <td>{item.product}</td>
                  <td>{item.provider}</td>
                  <td>Bs. {item.previousPrice.toFixed(2)}</td>
                  <td>Bs. {item.currentPrice.toFixed(2)}</td>
                  <td>
                    <span className={`price-variation ${item.variationType}`}>
                      {item.variation}
                    </span>
                  </td>
                  <td>{formatDate(item.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para nueva cotización */}
      {showNewQuoteModal && (
        <div
          className='modal-overlay'
          onClick={(e) => e.target === e.currentTarget && closeNewQuoteModal()}
        >
          <div className='quote-modal'>
            <div className='modal-header'>
              <h3>Nueva Cotización</h3>
              <button className='modal-close' onClick={closeNewQuoteModal} type='button'>
                <IoClose size={20} />
              </button>
            </div>

            <div className='modal-body'>
              <div className='modal-field'>
                <label>Producto: *</label>
                <Input
                  type='text'
                  placeholder='Ej: Coca Cola 2L'
                  value={newQuoteForm.product}
                  onChange={handleFormChange('product')}
                  className='modal-input'
                />
              </div>

              <div className='modal-field'>
                <label>Proveedor: *</label>
                <Input
                  type='text'
                  placeholder='Ej: Embotelladora Boliviana'
                  value={newQuoteForm.provider}
                  onChange={handleFormChange('provider')}
                  className='modal-input'
                />
              </div>

              <div className='modal-field'>
                <label>Precio (Bs.): *</label>
                <Input
                  type='number'
                  placeholder='0.00'
                  value={newQuoteForm.price}
                  onChange={handleFormChange('price')}
                  className='modal-input'
                  step='0.01'
                  min='0'
                />
              </div>

              <div className='modal-field'>
                <label>Fecha: *</label>
                <Input
                  type='date'
                  value={newQuoteForm.date}
                  onChange={handleFormChange('date')}
                  className='modal-input'
                />
              </div>

              <div className='modal-field'>
                <label>Descripción (opcional):</label>
                <Input
                  type='text'
                  placeholder='Ej: Incluye descuento por volumen'
                  value={newQuoteForm.description}
                  onChange={handleFormChange('description')}
                  className='modal-input'
                />
              </div>
            </div>

            <div className='modal-footer'>
              <div className='modal-buttons'>
                <Button
                  variant='secondary'
                  onClick={closeNewQuoteModal}
                  className='modal-button'
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  variant='primary'
                  onClick={handleAddQuote}
                  className='modal-button'
                  disabled={isLoading}
                >
                  {isLoading ? 'Agregando...' : 'Agregar Cotización'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para importar Excel */}
      {showImportModal && (
        <div
          className='modal-overlay'
          onClick={(e) => e.target === e.currentTarget && closeImportModal()}
        >
          <div className='quote-modal'>
            <div className='modal-header'>
              <h3>Importar desde Excel</h3>
              <button className='modal-close' onClick={closeImportModal} type='button'>
                <IoClose size={20} />
              </button>
            </div>

            <div className='modal-body'>
              <div className='modal-field'>
                <label>Archivo Excel: *</label>
                <Input
                  type='file'
                  accept='.xlsx,.xls'
                  onChange={handleFileChange}
                  className='modal-input'
                />
                {selectedFile && (
                  <div className='file-info'>Archivo seleccionado: {selectedFile.name}</div>
                )}
              </div>

              <div className='import-instructions'>
                <h4>Instrucciones de importación:</h4>
                <p>El archivo Excel debe contener las siguientes columnas:</p>
                <ul>
                  <li>
                    <strong>Producto</strong>: Nombre del producto
                  </li>
                  <li>
                    <strong>Proveedor</strong>: Nombre del proveedor
                  </li>
                  <li>
                    <strong>Precio</strong>: Precio unitario (número)
                  </li>
                  <li>
                    <strong>Fecha</strong>: Fecha de la cotización (DD/MM/YYYY)
                  </li>
                  <li>
                    <strong>Descripción</strong>: Notas adicionales (opcional)
                  </li>
                </ul>
              </div>
            </div>

            <div className='modal-footer'>
              <div className='modal-buttons'>
                <Button
                  variant='secondary'
                  onClick={closeImportModal}
                  className='modal-button'
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  variant='primary'
                  onClick={handleImportExcel}
                  className='modal-button'
                  disabled={isLoading || !selectedFile}
                >
                  {isLoading ? 'Importando...' : 'Importar'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotesPage;
