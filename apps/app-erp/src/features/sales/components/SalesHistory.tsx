import { useState, useMemo } from 'react';
import Table, { type TableColumn, type TableAction } from '../../../components/common/Table';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import Modal from '../../../components/common/Modal';
import TitleDescription from '../../../components/common/TitleDescription';
import { useSales } from '../hooks/hooks';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import './SalesHistory.css';

export interface SaleTransaction {
  id: string;
  saleNumber: string;
  date: string;
  client: string;
  items: string;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: 'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Débito';
  vendor: string;
  products: Array<{
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
}

interface SalesHistoryProps {
  onExportExcel?: () => void;
  onExportPDF?: () => void;
}

function SalesHistory({ onExportExcel, onExportPDF }: SalesHistoryProps) {
  // Obtenemos las ventas del backend mediante el hook useSales
  const { sales, loading, searchTerm, handleSearchChange } = useSales();

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Todos');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<SaleTransaction | null>(null);

  // Mapeamos el formato del paymentMethod del backend al formato del componente
  const mapPaymentMethod = (method: string): SaleTransaction['paymentMethod'] => {
    const methodMap: Record<string, SaleTransaction['paymentMethod']> = {
      cash: 'Efectivo',
      credit: 'Tarjeta',
      debit: 'Débito',
      transfer: 'Transferencia',
    };
    return methodMap[method] || 'Efectivo';
  };

  // Convertimos las ventas del backend al formato del componente
  const transactions: SaleTransaction[] = useMemo(() => {
    return sales.map((sale) => ({
      id: sale.id.toString(),
      saleNumber: `VTA-${sale.date.split('-')[0]}-${String(sale.id).padStart(3, '0')}`,
      date: `${sale.date} ${sale.time || ''}`.trim(),
      client: sale.clientName,
      items: sale.products.map((p) => `${p.name} (${p.quantity})`).join(', '),
      subtotal: sale.subtotal,
      tax: sale.total - sale.subtotal,
      total: sale.total,
      paymentMethod: mapPaymentMethod(sale.paymentMethod),
      vendor: 'Sistema',
      products: sale.products.map((p) => ({
        name: p.name,
        quantity: p.quantity,
        price: p.price,
        subtotal: p.price * p.quantity,
      })),
    }));
  }, [sales]);

  // Filtramos las transacciones según los criterios
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        transaction.saleNumber.toLowerCase().includes(searchLower) ||
        transaction.client.toLowerCase().includes(searchLower) ||
        transaction.items.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      if (dateFrom && transaction.date < dateFrom) {
        return false;
      }

      if (dateTo && transaction.date > dateTo) {
        return false;
      }

      if (paymentMethod !== 'Todos' && transaction.paymentMethod !== paymentMethod) {
        return false;
      }

      return true;
    });
  }, [transactions, searchTerm, dateFrom, dateTo, paymentMethod]);

  const handleExportExcel = () => {
    if (onExportExcel) {
      onExportExcel();
      return;
    }

    if (filteredTransactions.length === 0) {
      setModalMessage('No hay transacciones para exportar');
      setShowInfoModal(true);
      return;
    }

    try {
      // Preparar datos para Excel
      const excelData = filteredTransactions.map((transaction) => ({
        'N° Venta': transaction.saleNumber,
        Fecha: transaction.date,
        Cliente: transaction.client,
        Items: transaction.items,
        Subtotal: transaction.subtotal,
        Impuesto: transaction.tax,
        Total: transaction.total,
        'Método de Pago': transaction.paymentMethod,
        Vendedor: transaction.vendor,
      }));

      // Crear hoja de cálculo
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Historial de Ventas');

      // Ajustar ancho de columnas
      const colWidths = [
        { wch: 15 }, // N° Venta
        { wch: 20 }, // Fecha
        { wch: 25 }, // Cliente
        { wch: 40 }, // Items
        { wch: 12 }, // Subtotal
        { wch: 12 }, // Impuesto
        { wch: 12 }, // Total
        { wch: 18 }, // Método de Pago
        { wch: 15 }, // Vendedor
      ];
      worksheet['!cols'] = colWidths;

      // Generar archivo
      const fileName = `historial_ventas_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      setModalMessage(`Archivo Excel exportado exitosamente: ${fileName}`);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      setModalMessage('Error al exportar el archivo Excel');
      setShowInfoModal(true);
    }
  };

  const handleExportPDF = () => {
    if (onExportPDF) {
      onExportPDF();
      return;
    }

    if (filteredTransactions.length === 0) {
      setModalMessage('No hay transacciones para exportar');
      setShowInfoModal(true);
      return;
    }

    try {
      const doc = new jsPDF();

      // Título
      doc.setFontSize(18);
      doc.text('Historial de Ventas', 14, 20);

      // Fecha de generación
      doc.setFontSize(10);
      doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, 14, 28);

      // Preparar datos para la tabla
      const tableData = filteredTransactions.map((transaction) => [
        transaction.saleNumber,
        transaction.date,
        transaction.client,
        `Bs. ${transaction.subtotal.toFixed(2)}`,
        `Bs. ${transaction.tax.toFixed(2)}`,
        `Bs. ${transaction.total.toFixed(2)}`,
        transaction.paymentMethod,
      ]);

      // Calcular totales
      const totals = filteredTransactions.reduce(
        (acc, t) => ({
          subtotal: acc.subtotal + t.subtotal,
          tax: acc.tax + t.tax,
          total: acc.total + t.total,
        }),
        { subtotal: 0, tax: 0, total: 0 }
      );

      // Crear tabla
      autoTable(doc, {
        head: [['N° Venta', 'Fecha', 'Cliente', 'Subtotal', 'Impuesto', 'Total', 'Pago']],
        body: tableData,
        foot: [
          [
            '',
            '',
            'TOTALES:',
            `Bs. ${totals.subtotal.toFixed(2)}`,
            `Bs. ${totals.tax.toFixed(2)}`,
            `Bs. ${totals.total.toFixed(2)}`,
            '',
          ],
        ],
        startY: 35,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
        footStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: 35 },
      });

      // Guardar PDF
      const fileName = `historial_ventas_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      setModalMessage(`Archivo PDF exportado exitosamente: ${fileName}`);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      setModalMessage('Error al exportar el archivo PDF');
      setShowInfoModal(true);
    }
  };

  const handleViewTransaction = (transaction: SaleTransaction) => {
    console.log('Viendo transacción:', transaction);
    setSelectedTransaction(transaction);
    setShowDetailsModal(true);
  };

  const formatCurrency = (amount: number) => {
    return `Bs. ${amount.toFixed(2)}`;
  };

  const renderPaymentMethodTag = (method: SaleTransaction['paymentMethod']) => {
    const getMethodClass = (method: string) => {
      switch (method) {
        case 'Efectivo':
          return 'sales-history__payment sales-history__payment--cash';
        case 'Tarjeta':
          return 'sales-history__payment sales-history__payment--card';
        case 'Débito':
          return 'sales-history__payment sales-history__payment--card';
        case 'Transferencia':
          return 'sales-history__payment sales-history__payment--transfer';
        default:
          return 'sales-history__payment';
      }
    };

    return <span className={getMethodClass(method)}>{method}</span>;
  };

  // Calcular totales
  const totals = useMemo(() => {
    return filteredTransactions.reduce(
      (acc, transaction) => ({
        subtotal: acc.subtotal + transaction.subtotal,
        tax: acc.tax + transaction.tax,
        total: acc.total + transaction.total,
      }),
      { subtotal: 0, tax: 0, total: 0 }
    );
  }, [filteredTransactions]);

  const columns: TableColumn<SaleTransaction>[] = [
    {
      key: 'saleNumber',
      header: 'N° Venta',
      className: 'sales-history__sale-number-cell',
    },
    {
      key: 'date',
      header: 'Fecha',
      className: 'sales-history__date-cell',
    },
    {
      key: 'client',
      header: 'Cliente',
      className: 'sales-history__client-cell',
    },
    {
      key: 'items',
      header: 'Items',
      className: 'sales-history__items-cell',
    },
    {
      key: 'subtotal',
      header: 'Subtotal',
      render: (value) => formatCurrency(value),
      className: 'sales-history__amount-cell',
    },
    {
      key: 'tax',
      header: 'Impuesto',
      render: (value) => formatCurrency(value),
      className: 'sales-history__amount-cell',
    },
    {
      key: 'total',
      header: 'Total',
      render: (value) => formatCurrency(value),
      className: 'sales-history__total-cell',
    },
    {
      key: 'paymentMethod',
      header: 'Pago',
      render: (value) => renderPaymentMethodTag(value),
      className: 'sales-history__payment-cell',
    },
    {
      key: 'vendor',
      header: 'Vendedor',
      className: 'sales-history__vendor-cell',
    },
  ];

  const actions: TableAction<SaleTransaction>[] = [
    {
      label: 'Ver',
      onClick: handleViewTransaction,
      variant: 'primary',
    },
  ];

  const paymentMethodOptions = [
    { value: 'Todos', label: 'Todos' },
    { value: 'Efectivo', label: 'Efectivo' },
    { value: 'Tarjeta', label: 'Tarjeta' },
    { value: 'Débito', label: 'Débito' },
    { value: 'Transferencia', label: 'Transferencia' },
  ];

  if (loading) {
    return (
      <div className='sales-history'>
        <div className='sales-history__container'>
          <div className='sales-history__loading'>
            <p>Cargando historial de ventas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className='sales-history'>
        <div className='sales-history__container'>
          {/* Header Section */}
          <div className='sales-history__header'>
            <div className='sales-history__title-section'>
              <div className='sales-history__icon'>
                <svg width='24' height='24' viewBox='0 0 24 24' fill='currentColor'>
                  <path d='M13.5 8H12V13L16.28 15.54L17 14.33L13.5 12.25V8M13 3C8.03 3 4 7.03 4 12H1L4.96 16.03L9 12H6C6 8.13 9.13 5 13 5S20 8.13 20 12 16.87 19 13 19C11.07 19 9.32 18.21 8.06 16.94L6.64 18.36C8.27 20 10.5 21 13 21C17.97 21 22 16.97 22 12S17.97 3 13 3' />
                </svg>
              </div>
              <TitleDescription
                title='Filtros de Búsqueda'
                description='Filtra y exporta el historial de transacciones'
                titleSize={24}
                descriptionSize={14}
                titleWeight='semibold'
                descriptionWeight='normal'
                titleColor='var(--pri-900)'
                descriptionColor='var(--pri-600)'
                className='sales-history__title-desc'
              />
            </div>
          </div>

          {/* Filters Section */}
          <div className='sales-history__filters'>
            <div className='sales-history__search-filters'>
              <div className='sales-history__search-input'>
                <Input
                  type='text'
                  placeholder='N° venta, cliente...'
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className='sales-history__search'
                  leftIcon={
                    <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'>
                      <path d='M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z' />
                    </svg>
                  }
                />
              </div>

              <div className='sales-history__date-filters'>
                <div className='sales-history__date-input'>
                  <Input
                    type='date'
                    placeholder='Seleccionar fecha'
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    label='Desde'
                    className='sales-history__date'
                  />
                </div>

                <div className='sales-history__date-input'>
                  <Input
                    type='date'
                    placeholder='Seleccionar fecha'
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    label='Hasta'
                    className='sales-history__date'
                  />
                </div>
              </div>

              <div className='sales-history__method-filter'>
                <Select
                  options={paymentMethodOptions}
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  label='Método de Pago'
                  className='sales-history__payment-select'
                />
              </div>
            </div>

            <div className='sales-history__export-buttons'>
              <Button
                variant='outline'
                size='medium'
                onClick={handleExportExcel}
                icon={
                  <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'>
                    <path d='M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z' />
                  </svg>
                }
                iconPosition='left'
                className='sales-history__export-btn'
              >
                Exportar a Excel
              </Button>

              <Button
                variant='secondary'
                size='medium'
                onClick={handleExportPDF}
                icon={
                  <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'>
                    <path d='M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z' />
                  </svg>
                }
                iconPosition='left'
                className='sales-history__export-btn'
              >
                Exportar a PDF
              </Button>
            </div>
          </div>

          {/* Table Section */}
          <div className='sales-history__content'>
            <div className='sales-history__table-header'>
              <h3 className='sales-history__table-title'>
                Historial de Transacciones ({filteredTransactions.length})
              </h3>
            </div>

            <Table
              data={filteredTransactions}
              columns={columns}
              actions={actions}
              className='sales-history__table'
              emptyMessage='No hay transacciones registradas'
            />

            {/* Totals Row */}
            {filteredTransactions.length > 0 && (
              <div className='sales-history__totals'>
                <div className='sales-history__totals-content'>
                  <div className='sales-history__total-item'>
                    <span className='sales-history__total-label'>Subtotal</span>
                    <span className='sales-history__total-value'>
                      {formatCurrency(totals.subtotal)}
                    </span>
                  </div>
                  <div className='sales-history__total-item'>
                    <span className='sales-history__total-label'>Impuestos</span>
                    <span className='sales-history__total-value'>{formatCurrency(totals.tax)}</span>
                  </div>
                  <div className='sales-history__total-item sales-history__total-item--grand'>
                    <span className='sales-history__total-label'>Total General</span>
                    <span className='sales-history__total-value'>
                      {formatCurrency(totals.total)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Detalles de Venta */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title='Detalle de Venta'
        message=''
        modalType='info'
        confirmButtonText='Cerrar'
        size='large'
      >
        {selectedTransaction && (
          <div style={{ padding: '1rem' }}>
            {/* Información General */}
            <div
              style={{
                marginBottom: '1.5rem',
                background: '#f8f9fa',
                padding: '1rem',
                borderRadius: '8px',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <p style={{ marginBottom: '0.5rem' }}>
                    <strong>N° Venta:</strong> {selectedTransaction.saleNumber}
                  </p>
                  <p style={{ marginBottom: '0.5rem' }}>
                    <strong>Fecha:</strong> {selectedTransaction.date}
                  </p>
                  <p style={{ marginBottom: '0.5rem' }}>
                    <strong>Cliente:</strong> {selectedTransaction.client}
                  </p>
                </div>
                <div>
                  <p style={{ marginBottom: '0.5rem' }}>
                    <strong>Método de Pago:</strong> {selectedTransaction.paymentMethod}
                  </p>
                  <p style={{ marginBottom: '0.5rem' }}>
                    <strong>Vendedor:</strong> {selectedTransaction.vendor}
                  </p>
                </div>
              </div>
            </div>

            {/* Lista de Productos */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>
                Productos
              </h4>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#e9ecef', borderBottom: '2px solid #dee2e6' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Producto</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Cantidad</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Precio Unit.</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTransaction.products.map((product, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #dee2e6' }}>
                      <td style={{ padding: '0.75rem' }}>{product.name}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        {product.quantity}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                        {formatCurrency(product.price)}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                        {formatCurrency(product.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totales */}
            <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}
              >
                <span>Subtotal:</span>
                <span style={{ fontWeight: '600' }}>
                  {formatCurrency(selectedTransaction.subtotal)}
                </span>
              </div>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}
              >
                <span>Impuesto:</span>
                <span style={{ fontWeight: '600' }}>{formatCurrency(selectedTransaction.tax)}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '0.5rem',
                  borderTop: '2px solid #dee2e6',
                }}
              >
                <span style={{ fontSize: '1.1rem', fontWeight: '700' }}>Total:</span>
                <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#28a745' }}>
                  {formatCurrency(selectedTransaction.total)}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Información */}
      <Modal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        title='Información'
        message={modalMessage}
        modalType='info'
        confirmButtonText='Entendido'
      />

      {/* Modal de Éxito */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title='Exportación Exitosa'
        message={modalMessage}
        modalType='success'
        confirmButtonText='Aceptar'
      />
    </>
  );
}

export default SalesHistory;
