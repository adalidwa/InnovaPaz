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
  // Redirigir al sitio web de marketing para cambiar plan
  const marketingUrl = 'http://localhost:5174/#pricing';

  // Abrir en nueva pestaña
  window.open(marketingUrl, '_blank', 'noopener,noreferrer');

  // También mostrar un mensaje de información
  console.log('Redirigiendo a:', marketingUrl);
};

// Función para formatear la fecha del próximo cobro
function formatearFechaProximoCobro(suscripcion: any): string {
  if (!suscripcion) return '-';

  const now = new Date();
  let fechaExpiracion: Date | null = null;

  if (suscripcion.estado === 'en_prueba' && suscripcion.fechaExpiracion) {
    fechaExpiracion = new Date(suscripcion.fechaExpiracion);
  } else if (suscripcion.estado === 'activa' && suscripcion.fechaExpiracion) {
    fechaExpiracion = new Date(suscripcion.fechaExpiracion);
  }

  if (!fechaExpiracion) {
    // Si no hay fecha de expiración, calcular basado en el estado
    if (suscripcion.estado === 'activa') {
      const futureDate = new Date(now);
      futureDate.setDate(futureDate.getDate() + 30);
      return `${futureDate.getDate()}/${futureDate.getMonth() + 1}/${futureDate.getFullYear()}`;
    } else if (suscripcion.estado === 'en_prueba') {
      const futureDate = new Date(now);
      futureDate.setDate(futureDate.getDate() + 14);
      return `Prueba hasta ${futureDate.getDate()}/${futureDate.getMonth() + 1}`;
    }
    return '-';
  }

  const diasRestantes = Math.ceil(
    (fechaExpiracion.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diasRestantes <= 0) {
    return 'Expirado';
  } else if (diasRestantes === 1) {
    return 'Mañana';
  } else if (diasRestantes <= 7) {
    return `En ${diasRestantes} días`;
  } else if (diasRestantes <= 30) {
    return `En ${diasRestantes} días (${fechaExpiracion.getDate()}/${fechaExpiracion.getMonth() + 1})`;
  } else {
    return `${fechaExpiracion.getDate()}/${fechaExpiracion.getMonth() + 1}/${fechaExpiracion.getFullYear()}`;
  }
}

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
        if (!token || !empresaId) {
          console.log('No hay token o empresa_id:', { token: !!token, empresaId });
          return;
        }

        console.log('🔄 Obteniendo datos de facturación para empresa:', empresaId);

        // Obtener información de suscripción del nuevo endpoint
        const [subscriptionRes, invoicesRes] = await Promise.all([
          fetch('/api/subscriptions/info', {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }).catch((err) => {
            console.error('❌ Error en subscription endpoint:', err);
            return { ok: false, error: err };
          }),
          fetch('/api/subscriptions/invoices', {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }).catch((err) => {
            console.error('❌ Error en invoices endpoint:', err);
            return { ok: false, error: err };
          }),
        ]);

        if (invoicesRes.ok && 'json' in invoicesRes) {
          const dataFact = await invoicesRes.json();
          setInvoices(dataFact.facturas || []);
        }

        if (subscriptionRes.ok && 'json' in subscriptionRes) {
          const subscriptionData = await subscriptionRes.json();
          console.log('✅ Datos de suscripción recibidos:', subscriptionData);

          // Mapear datos de suscripción al formato esperado
          const planInfo: PlanInfo = {
            nombre: subscriptionData.subscription?.plan?.nombre || 'Plan Básico',
            estado:
              subscriptionData.subscription?.suscripcion?.estado === 'activa'
                ? 'Activo'
                : subscriptionData.subscription?.suscripcion?.estado === 'en_prueba'
                  ? 'En Prueba'
                  : subscriptionData.subscription?.suscripcion?.estado === 'pendiente_pago'
                    ? 'Pendiente Pago'
                    : 'Inactivo',
            precio: subscriptionData.subscription?.plan?.precio || 10,
            periodo: '/mensual',
            miembros: {
              used: subscriptionData.usage?.usuarios?.current || 1, // Al menos 1 (el admin)
              total:
                subscriptionData.subscription?.plan?.limites?.miembros === null
                  ? 999
                  : subscriptionData.subscription?.plan?.limites?.miembros || 2,
            },
            productos: {
              used: 0, // TODO: Implementar cuando tengamos módulo de productos
              total:
                subscriptionData.subscription?.plan?.limites?.productos === null
                  ? 999
                  : subscriptionData.subscription?.plan?.limites?.productos || 100,
            },
            proximoCobro: formatearFechaProximoCobro(subscriptionData.subscription?.suscripcion),
          };

          console.log('📊 Plan info mapeado:', planInfo);
          setPlan(planInfo);
        } else {
          // Si falla el endpoint nuevo, intentar obtener datos directamente de la empresa
          console.warn(
            '⚠️ Error al obtener datos de suscripción, intentando endpoint alternativo...'
          );

          try {
            const empresaRes = await fetch(`/api/companies/${empresaId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });

            if (empresaRes.ok) {
              const empresaData = await empresaRes.json();
              console.log('🏢 Datos de empresa obtenidos:', empresaData);

              // Crear datos basados en la empresa
              const empresa = empresaData.empresa;
              if (empresa && empresa.plan_id) {
                // Mapear plan_id a datos de plan
                const planMapping = {
                  1: { nombre: 'Plan Básico', precio: 10 },
                  2: { nombre: 'Plan Estándar', precio: 50 },
                  3: { nombre: 'Plan Premium', precio: 90 },
                };

                const planData =
                  planMapping[empresa.plan_id as keyof typeof planMapping] || planMapping[1];

                setPlan({
                  nombre: planData.nombre,
                  estado: 'En Prueba',
                  precio: planData.precio,
                  periodo: '/mensual',
                  miembros: {
                    used: 1,
                    total: empresa.plan_id === 3 ? 999 : empresa.plan_id === 2 ? 10 : 2,
                  },
                  productos: {
                    used: 0,
                    total: empresa.plan_id === 3 ? 999 : empresa.plan_id === 2 ? 5000 : 150,
                  },
                  proximoCobro: 'En 13 días',
                });
                console.log('✅ Datos de plan configurados desde empresa');
                return;
              }
            }
          } catch (fallbackError) {
            console.error('❌ Error en endpoint de fallback:', fallbackError);
          }

          // Si todo falla, usar datos por defecto
          console.warn('🔧 Usando datos por defecto');
          const fechaFutura = new Date();
          fechaFutura.setDate(fechaFutura.getDate() + 30);

          setPlan({
            nombre: 'Plan Básico',
            estado: 'Activo',
            precio: 10,
            periodo: '/mensual',
            miembros: { used: 1, total: 2 },
            productos: { used: 0, total: 100 },
            proximoCobro: `En 30 días (${fechaFutura.getDate()}/${fechaFutura.getMonth() + 1})`,
          });
        }
      } catch (error) {
        console.error('❌ Error general en fetchBilling:', error);

        // En caso de error total, usar datos por defecto
        setPlan({
          nombre: 'Plan Básico',
          estado: 'Error',
          precio: 10,
          periodo: '/mensual',
          miembros: { used: 1, total: 2 },
          productos: { used: 0, total: 100 },
          proximoCobro: 'No disponible',
        });
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
