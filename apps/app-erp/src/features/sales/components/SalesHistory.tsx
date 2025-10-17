import { useState, useMemo } from 'react';
import Table, { type TableColumn, type TableAction } from '../../../components/common/Table';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import TitleDescription from '../../../components/common/TitleDescription';
import { useSales } from '../hooks/hooks';
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
      tax: sale.total - sale.subtotal, // Calculamos el impuesto como la diferencia
      total: sale.total,
      paymentMethod: mapPaymentMethod(sale.paymentMethod),
      vendor: 'Sistema', // TODO: Obtener del backend cuando esté disponible
    }));
  }, [sales]);

  // Filtramos las transacciones según los criterios
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      // Filtro por búsqueda
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        transaction.saleNumber.toLowerCase().includes(searchLower) ||
        transaction.client.toLowerCase().includes(searchLower) ||
        transaction.items.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      // Filtro por fecha desde
      if (dateFrom && transaction.date < dateFrom) {
        return false;
      }

      // Filtro por fecha hasta
      if (dateTo && transaction.date > dateTo) {
        return false;
      }

      // Filtro por método de pago
      if (paymentMethod !== 'Todos' && transaction.paymentMethod !== paymentMethod) {
        return false;
      }

      return true;
    });
  }, [transactions, searchTerm, dateFrom, dateTo, paymentMethod]);

  const handleExportExcel = () => {
    if (onExportExcel) {
      onExportExcel();
    } else {
      console.log('Exportando a Excel...', filteredTransactions);
      alert('Funcionalidad de exportación a Excel en desarrollo');
    }
  };

  const handleExportPDF = () => {
    if (onExportPDF) {
      onExportPDF();
    } else {
      console.log('Exportando a PDF...', filteredTransactions);
      alert('Funcionalidad de exportación a PDF en desarrollo');
    }
  };

  const handleViewTransaction = (transaction: SaleTransaction) => {
    console.log('Viendo transacción:', transaction);
    // TODO: Abrir modal con detalle de la transacción
    alert(`Ver detalles de ${transaction.saleNumber}`);
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
                  <span className='sales-history__total-value'>{formatCurrency(totals.total)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SalesHistory;
