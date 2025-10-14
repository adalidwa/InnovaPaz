import TitleDescription from '../../../components/common/TitleDescription';
import Button from '../../../components/common/Button';
import Table, { type TableColumn } from '../../../components/common/Table';
import { FiExternalLink, FiDownload, FiCreditCard } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import './CompanyBillingSection.css';

interface Invoice {
  id: string;
  numero: string;
  fecha: string;
  monto: number;
  estado: 'pagada' | 'pendiente';
  url?: string;
}

interface PlanInfo {
  nombre: string;
  estado: string;
  precio: number;
  periodo: string;
  miembros: { used: number; total: number };
  productos: { used: number; total: number };
  proximoCobro: string;
}

const invoiceCols: TableColumn<Invoice>[] = [
  { key: 'numero', header: 'Factura' },
  { key: 'fecha', header: 'Fecha' },
  {
    key: 'monto',
    header: 'Monto',
    render: (v) => `Bs${Number(v).toFixed(2)}`,
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
      <a
        href={row.url || '#'}
        target='_blank'
        rel='noopener noreferrer'
        className='invoice-download-btn'
        aria-label={`Descargar ${row.numero}`}
        download
      >
        <FiDownload size={15} />
      </a>
    ),
    width: '70px',
  },
];

const handleManage = () => {
  window.open('/facturacion/gestionar', '_blank');
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
  const [plan, setPlan] = useState<PlanInfo | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [empresaId, setEmpresaId] = useState('');

  useEffect(() => {
    const fetchEmpresaId = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const resUser = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (resUser.ok) {
          const dataUser = await resUser.json();
          setEmpresaId(dataUser.usuario.empresa_id);
        }
      } catch (error) {
        console.error('Error obteniendo empresaId:', error);
      }
    };
    fetchEmpresaId();
  }, []);

  useEffect(() => {
    const fetchBilling = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token || !empresaId) return;
        const resFact = await fetch(`/api/companies/${empresaId}/invoices`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (resFact.ok) {
          const dataFact = await resFact.json();
          setInvoices(dataFact.facturas || []);
        }
        const resPlan = await fetch(`/api/companies/${empresaId}/plan`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (resPlan.ok) {
          const dataPlan = await resPlan.json();
          setPlan({
            nombre: dataPlan.nombre || 'Plan Básico',
            estado: dataPlan.estado || 'Activo',
            precio: dataPlan.precio || 0,
            periodo: dataPlan.periodo || '/mensual',
            miembros: dataPlan.miembros || { used: 0, total: 0 },
            productos: dataPlan.productos || { used: 0, total: 0 },
            proximoCobro: dataPlan.proximoCobro || '',
          });
        }
      } finally {
        setLoading(false);
      }
    };
    if (empresaId) fetchBilling();
  }, [empresaId]);

  return (
    <div className='billing-section-wrapper'>
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
              <h3 className='plan-name'>{plan?.nombre || 'Plan Básico'}</h3>
              <span className='plan-status-badge'>{plan?.estado || 'Activo'}</span>
            </div>
            <div className='plan-price-row'>
              <span className='plan-price'>Bs{plan?.precio?.toFixed(2) || '0.00'}</span>
              <span className='plan-period'>{plan?.periodo || '/mensual'}</span>
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
          <UsageBar
            label='Miembros'
            used={plan?.miembros?.used || 0}
            total={plan?.miembros?.total || 0}
          />
          <UsageBar
            label='Productos'
            used={plan?.productos?.used || 0}
            total={plan?.productos?.total || 0}
            color='var(--pri-500,#6366f1)'
          />
        </div>

        <div className='plan-next-charge'>
          <span className='plan-next-label'>Próximo cobro</span>
          <span className='plan-next-date'>{plan?.proximoCobro || '-'}</span>
        </div>
      </div>
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
          emptyMessage={loading ? 'Cargando...' : 'Sin facturas'}
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
