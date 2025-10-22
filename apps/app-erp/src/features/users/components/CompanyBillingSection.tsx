import React from 'react';
import TitleDescription from '../../../components/common/TitleDescription';
import Button from '../../../components/common/Button';
import Table, { type TableColumn } from '../../../components/common/Table';
import {
  FiExternalLink,
  FiDownload,
  FiCreditCard,
  FiAlertCircle,
  FiClock,
  FiUsers,
  FiPackage,
  FiFileText,
} from 'react-icons/fi';
import './CompanyBillingSection.css';
import { useSubscription } from '../hooks/useSubscription';
import { useInvoices } from '../hooks/useInvoices';
import { useCompanyStats } from '../hooks/useCompanyStats';
import type { Invoice } from '../services/invoiceService';

const invoiceCols: TableColumn<Invoice>[] = [
  {
    key: 'numero',
    header: 'Factura',
    render: (value) => value as string,
  },
  {
    key: 'fecha',
    header: 'Fecha',
    render: (value) => {
      const date = new Date(value as string);
      return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
    },
  },
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
      <button
        onClick={(e) => {
          e.preventDefault();
          const event = new CustomEvent('downloadInvoice', {
            detail: { id: row.id, numero: row.numero },
          });
          window.dispatchEvent(event);
        }}
        className='invoice-download-btn'
        aria-label={`Descargar ${row.numero}`}
        title={`Descargar ${row.numero}`}
      >
        <FiDownload size={15} />
      </button>
    ),
    width: '70px',
  },
];

const handleManage = () => {
  const marketingUrl = `${import.meta.env.VITE_MARKETING_URL || 'http://localhost:5174'}/#pricing`;

  window.open(marketingUrl, '_blank', 'noopener,noreferrer');

  console.log('Redirigiendo a:', marketingUrl);
};

function UsageBar({
  label,
  used,
  total,
  color = 'var(--pri-600,#4f46e5)',
  icon,
  unlimited = false,
}: {
  label: string;
  used: number;
  total: number;
  color?: string;
  icon?: React.ReactNode;
  unlimited?: boolean;
}) {
  const pct = unlimited ? 0 : Math.min(100, (used / total) * 100);

  return (
    <div className='usage-row'>
      <div className='usage-head'>
        <div className='usage-label-section'>
          {icon && <span className='usage-icon'>{icon}</span>}
          <span className='usage-label'>{label}</span>
        </div>
        <span className='usage-value'>
          {unlimited ? `${used} (Ilimitado)` : `${used} de ${total}`}
        </span>
      </div>
      <div className='usage-bar'>
        <div
          className='usage-bar-fill'
          style={{
            width: unlimited ? '100%' : `${pct}%`,
            background: unlimited ? '#10b981' : color,
            opacity: unlimited ? 0.3 : 1,
          }}
        />
        {!unlimited && pct >= 80 && <div className='usage-warning-indicator' />}
      </div>
    </div>
  );
}

function FeatureItem({ label, enabled }: { label: string; enabled: boolean }) {
  // Solo mostrar características habilitadas
  if (!enabled) return null;

  return (
    <div className='feature-item'>
      <div className='feature-icon feature-icon--enabled'>
        <FiFileText size={14} />
      </div>
      <span className='feature-label feature-label--enabled'>{label}</span>
    </div>
  );
}

function CompanyBillingSection() {
  // Usar hooks personalizados
  const {
    subscription,
    loading: subscriptionLoading,
    error: subscriptionError,
    helpers: subHelpers,
  } = useSubscription();

  const { invoices, loading: invoicesLoading, handleDownload } = useInvoices();

  const { stats, helpers: statsHelpers } = useCompanyStats(subscription);

  // Manejar descarga de facturas desde eventos personalizados
  React.useEffect(() => {
    const handleDownloadEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ id: string; numero: string }>;
      const { id, numero } = customEvent.detail;
      handleDownload(id, numero);
    };

    window.addEventListener('downloadInvoice', handleDownloadEvent as EventListener);
    return () => {
      window.removeEventListener('downloadInvoice', handleDownloadEvent as EventListener);
    };
  }, [handleDownload]);

  // Mapear datos de suscripción y estadísticas a formato de UI
  const planInfo = React.useMemo(() => {
    if (!subscription || !subscription.plan || !subscription.suscripcion) return null;

    console.log('🔍 Frontend - Datos de subscription recibidos:', subscription);
    console.log('🏢 Frontend - Empresa info:', subscription.empresa);
    console.log('🏢 Frontend - Tipo empresa:', subscription.empresa?.tipo_empresa_nombre);

    const planLimites = subscription.plan?.limites || {};
    const estadoSuscripcion = subscription.suscripcion?.estado;
    const empresaInfo = subscription.empresa || {};

    return {
      // Información básica del plan
      nombre: subscription.plan?.nombre ?? 'Plan Básico',
      tipoEmpresa: empresaInfo.tipo_empresa_nombre || 'Sin tipo',
      estado: subHelpers.getEstadoLegible(estadoSuscripcion),
      precio: subscription.plan?.precio ?? 0,
      periodo: '/mensual',

      // Uso de recursos con datos reales
      miembros: {
        used: stats?.miembros?.used ?? 1,
        total: subHelpers.getLimiteDisplay(planLimites.miembros) ?? 2,
        percentage: stats?.miembros?.percentage ?? 0,
        color: statsHelpers.getUsageColor(stats?.miembros?.percentage ?? 0),
      },
      productos: {
        used: stats?.productos?.used ?? 0,
        total: subHelpers.getLimiteDisplay(planLimites.productos) ?? 150,
        percentage: stats?.productos?.percentage ?? 0,
        color: statsHelpers.getUsageColor(stats?.productos?.percentage ?? 0),
      },
      roles: {
        used: stats?.roles?.used ?? 0,
        total: subHelpers.getLimiteDisplay(planLimites.roles) ?? 2,
        percentage: stats?.roles?.percentage ?? 0,
        color: statsHelpers.getUsageColor(stats?.roles?.percentage ?? 0),
      },
      transacciones: {
        used: stats?.transacciones?.used ?? 0,
        total: subHelpers.getLimiteDisplay(planLimites.transacciones) ?? 250,
        percentage: stats?.transacciones?.percentage ?? 0,
        color: statsHelpers.getUsageColor(stats?.transacciones?.percentage ?? 0),
      },

      // Información temporal
      proximoCobro: subHelpers.formatProximoCobro(
        subscription.suscripcion?.fechaExpiracion,
        subscription.suscripcion?.diasRestantes
      ),
      diasRestantes: subscription.suscripcion?.diasRestantes ?? 0,
      enPrueba: subscription.suscripcion?.enPeriodoPrueba ?? false,

      // Estado visual
      estadoClass: subHelpers.getEstadoClass(estadoSuscripcion),

      // Features del plan
      features: {
        exportacion: planLimites.exportacion || false,
        reportes_estandar: planLimites.reportes_estandar || false,
        reportes_avanzados: planLimites.reportes_avanzados || false,
        soporte_prioritario: planLimites.soporte_prioritario || false,
        soporte_dedicado_chat: planLimites.soporte_dedicado_chat || false,
        dashboard_reportes_basicos: planLimites.dashboard_reportes_basicos || false,
        soporte_email: planLimites.soporte_email || false,
        ...planLimites.features,
      },
      diasPrueba: planLimites.dias_prueba || 0,
    };
  }, [subscription, subHelpers, stats, statsHelpers]);

  // Mostrar loading solo de subscription e invoices
  const loading = subscriptionLoading || invoicesLoading;

  return (
    <div className='billing-section-wrapper'>
      {/* Mostrar errores si existen */}
      {subscriptionError && (
        <div className='billing-error-banner'>
          <FiAlertCircle size={16} />
          <span>Suscripción: {subscriptionError}</span>
        </div>
      )}

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

        {loading ? (
          <div className='billing-loading'>
            <div className='billing-skeleton' />
          </div>
        ) : (
          <>
            <div className='plan-header'>
              <div className='plan-main'>
                <div className='plan-title-row'>
                  <div className='plan-name-section'>
                    <h3 className='plan-name'>{planInfo?.nombre || 'Plan Básico'}</h3>
                    {planInfo?.tipoEmpresa && planInfo.tipoEmpresa !== 'Sin tipo' && (
                      <span className='plan-type-badge'>{planInfo.tipoEmpresa}</span>
                    )}
                  </div>
                  <span className={`plan-status-badge ${planInfo?.estadoClass || ''}`}>
                    {planInfo?.estado || 'Activo'}
                  </span>
                </div>
                <div className='plan-price-row'>
                  <span className='plan-price'>Bs{planInfo?.precio?.toFixed(2) || '0.00'}</span>
                  <span className='plan-period'>{planInfo?.periodo || '/mensual'}</span>
                </div>
                {planInfo?.enPrueba && planInfo?.diasPrueba > 0 && (
                  <div className='plan-trial-info'>
                    <FiClock size={14} />
                    <span>
                      Período de prueba: {planInfo.diasRestantes} de {planInfo.diasPrueba} días
                      restantes
                    </span>
                  </div>
                )}
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
                used={planInfo?.miembros?.used || 0}
                total={planInfo?.miembros?.total || 0}
                color={planInfo?.miembros?.color || 'var(--pri-600,#4f46e5)'}
                icon={<FiUsers size={16} />}
                unlimited={planInfo?.miembros?.total === 999}
              />
              <UsageBar
                label='Productos'
                used={planInfo?.productos?.used || 0}
                total={planInfo?.productos?.total || 0}
                color={planInfo?.productos?.color || 'var(--pri-500,#6366f1)'}
                icon={<FiPackage size={16} />}
                unlimited={planInfo?.productos?.total === 999}
              />
              <UsageBar
                label='Roles'
                used={planInfo?.roles?.used || 0}
                total={planInfo?.roles?.total || 0}
                color={planInfo?.roles?.color || 'var(--pri-400,#7c3aed)'}
                icon={<FiCreditCard size={16} />}
                unlimited={planInfo?.roles?.total === 999}
              />
              <UsageBar
                label='Transacciones'
                used={planInfo?.transacciones?.used || 0}
                total={planInfo?.transacciones?.total || 0}
                color={planInfo?.transacciones?.color || 'var(--orange-500,#f97316)'}
                icon={<FiExternalLink size={16} />}
                unlimited={planInfo?.transacciones?.total === 999}
              />
            </div>

            <div className='plan-features-block'>
              <h4 className='plan-features-title'>Características incluidas</h4>
              <div className='plan-features-grid'>
                <FeatureItem
                  label='Exportación'
                  enabled={planInfo?.features?.exportacion || false}
                />
                <FeatureItem
                  label='Reportes estándar'
                  enabled={planInfo?.features?.reportes_estandar || false}
                />
                <FeatureItem
                  label='Reportes avanzados'
                  enabled={planInfo?.features?.reportes_avanzados || false}
                />
                <FeatureItem
                  label='Soporte prioritario'
                  enabled={!!planInfo?.features?.soporte_prioritario}
                />
                <FeatureItem
                  label='Chat dedicado'
                  enabled={planInfo?.features?.soporte_dedicado_chat || false}
                />
                <FeatureItem
                  label='Dashboard básico'
                  enabled={planInfo?.features?.dashboard_reportes_basicos || false}
                />
              </div>
            </div>

            <div className='plan-next-charge'>
              <div className='plan-next-info'>
                <FiClock size={16} className='plan-next-icon' />
                <div className='plan-next-content'>
                  <span className='plan-next-label'>
                    {planInfo?.enPrueba ? 'Periodo de prueba termina' : 'Próximo cobro'}
                  </span>
                  <span className='plan-next-date'>
                    {planInfo?.enPrueba
                      ? `En ${planInfo?.diasRestantes || 0} días`
                      : planInfo?.proximoCobro || '-'}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
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
          emptyMessage={loading ? 'Cargando facturas...' : 'No tienes facturas aún'}
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
