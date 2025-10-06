import TitleDescription from '../../../components/common/TitleDescription';
import Button from '../../../components/common/Button';
import Table, { type TableColumn } from '../../../components/common/Table';
import { FiExternalLink, FiDownload, FiCreditCard } from 'react-icons/fi';
import './CompanyBillingSection.css';

interface Invoice {
  id: string;
  numero: string;
  fecha: string;
  monto: number;
  estado: 'pagada' | 'pendiente';
}

const invoices: Invoice[] = [
  { id: '1', numero: 'INV-001', fecha: '01 Dic 2024', monto: 49, estado: 'pagada' },
  { id: '2', numero: 'INV-002', fecha: '01 Nov 2024', monto: 49, estado: 'pagada' },
  { id: '3', numero: 'INV-003', fecha: '01 Oct 2024', monto: 49, estado: 'pagada' },
];

const invoiceCols: TableColumn<Invoice>[] = [
  { key: 'numero', header: 'Factura' },
  { key: 'fecha', header: 'Fecha' },
  {
    key: 'monto',
    header: 'Monto',
    render: (v) => `$${Number(v).toFixed(2)}`,
  },
  {
    key: 'estado',
    header: 'Estado',
    render: (_, row) => (
      <span
        className={`invoice-status ${row.estado === 'pagada' ? 'invoice-status--paid' : 'invoice-status--pending'}`}
      >
        {row.estado === 'pagada' ? 'Pagada' : 'Pendiente'}
      </span>
    ),
    width: '120px',
  },
  {
    key: 'accion',
    header: 'Acción',
    render: (_, row) => (
      <button
        type='button'
        className='invoice-download-btn'
        aria-label={`Descargar ${row.numero}`}
        onClick={() => handleDownload(row)}
      >
        <FiDownload size={15} />
      </button>
    ),
    width: '70px',
  },
];

const handleManage = () => {};

const handleDownload = (invoice: Invoice) => {
  console.log('Descargar', invoice.numero);
};

function UsageBar({
  label,
  used,
  total,
  color = 'var(--pri-600,#4f46e5)',
}: {
  label: string;
  used: number;
  total: number;
  color?: string;
}) {
  const pct = Math.min(100, (used / total) * 100);
  return (
    <div className='usage-row'>
      <div className='usage-head'>
        <span className='usage-label'>{label}</span>
        <span className='usage-value'>
          {used} de {total}
        </span>
      </div>
      <div className='usage-bar'>
        <div className='usage-bar-fill' style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function CompanyBillingSection() {
  const miembros = { used: 5, total: 10 };
  const productos = { used: 250, total: 1000 };
  const proximoCobro = '01 Ene 2025';

  return (
    <div className='billing-section-wrapper'>
      {/* Tarjeta Plan Actual */}
      <div className='billing-card'>
        <TitleDescription
          title='Plan Actual'
          description='Información sobre tu suscripción y uso'
          titleSize={16}
          descriptionSize={12}
          titleWeight='semibold'
          descriptionWeight='light'
          spacing='.35rem'
          maxWidth='100%'
        />

        <div className='plan-header'>
          <div className='plan-main'>
            <div className='plan-title-row'>
              <h3 className='plan-name'>Plan Profesional</h3>
              <span className='plan-status-badge'>Activo</span>
            </div>
            <div className='plan-price-row'>
              <span className='plan-price'>$49</span>
              <span className='plan-period'>/mensual</span>
            </div>
          </div>
          <div className='plan-actions'>
            <Button
              variant='secondary'
              size='small'
              icon={<FiExternalLink size={14} />}
              onClick={handleManage}
              iconPosition='left'
            >
              Administrar Suscripción
            </Button>
          </div>
        </div>

        <div className='plan-usage-block'>
          <UsageBar label='Miembros' used={miembros.used} total={miembros.total} />
          <UsageBar
            label='Productos'
            used={productos.used}
            total={productos.total}
            color='var(--pri-500,#6366f1)'
          />
        </div>

        <div className='plan-next-charge'>
          <span className='plan-next-label'>Próximo cobro</span>
          <span className='plan-next-date'>{proximoCobro}</span>
        </div>
      </div>

      {/* Tarjeta Historial Facturas */}
      <div className='billing-card'>
        <TitleDescription
          title='Historial de Facturas'
          description='Descarga tus facturas anteriores'
          titleSize={16}
          descriptionSize={12}
          titleWeight='semibold'
          descriptionWeight='light'
          spacing='.35rem'
          maxWidth='100%'
        />

        <Table<Invoice>
          data={invoices}
          columns={invoiceCols}
          emptyMessage='Sin facturas'
          className='invoices-table'
        />

        <div className='billing-foot-note'>
          <FiCreditCard size={14} />
          <span>Para cambiar plan o método de pago usa "Administrar Suscripción".</span>
        </div>
      </div>
    </div>
  );
}

export default CompanyBillingSection;
