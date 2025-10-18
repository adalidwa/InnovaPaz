import React, { useEffect, useState } from 'react';
import SectionCard from '../components/SectionCard.tsx';
import { Link } from 'react-router-dom';
import './ReportsDashboardPage.css';
import MetricCard from '../components/MetricCard';
import { StatsCard, type StatItem } from '../../../components/common';
import { useReports } from '../hooks/useReports';
import { useUser } from '../../users/hooks/useContextBase';
import reportsService from '../services/reportsService';
import {
  HiUsers,
  HiCheckCircle,
  HiXCircle,
  HiUserAdd,
  HiCube,
  HiExclamation,
  HiTrendingUp,
  HiMail,
  HiClock,
  HiShieldCheck,
  HiStar,
  HiSparkles,
} from 'react-icons/hi';
import { BsFilePdfFill, BsFileEarmarkExcelFill } from 'react-icons/bs';

const ReportsDashboardPage: React.FC = () => {
  const { user, loading: userLoading } = useUser();
  const empresaId = user?.empresa_id || '';
  const { dashboardMetrics, loadingDashboard, errorDashboard, stockBajo, refreshStockBajo } =
    useReports(empresaId);

  const [generatingReport, setGeneratingReport] = useState<string | null>(null);

  useEffect(() => {
    if (empresaId) {
      refreshStockBajo(10);
    }
  }, [empresaId, refreshStockBajo]);

  const handleExportPDF = async () => {
    try {
      await reportsService.exportDashboardPDF(empresaId);
    } catch (error) {
      console.error('Error exportando PDF:', error);
      alert('Error al exportar PDF');
    }
  };

  const handleExportExcel = async () => {
    try {
      await reportsService.exportDashboardExcel(empresaId);
    } catch (error) {
      console.error('Error exportando Excel:', error);
      alert('Error al exportar Excel');
    }
  };

  const handleGenerateReport = async (tipo: 'usuarios' | 'productos' | 'invitaciones') => {
    if (!empresaId) {
      alert('No se pudo obtener el ID de empresa');
      return;
    }

    setGeneratingReport(tipo);

    try {
      switch (tipo) {
        case 'usuarios':
          await reportsService.exportUsuariosExcel(empresaId);
          break;
        case 'productos':
          await reportsService.exportProductosExcel(empresaId);
          break;
        case 'invitaciones':
          window.location.href = '/reportes/invitaciones';
          break;
      }
    } catch (error) {
      console.error(`Error generando reporte de ${tipo}:`, error);
      alert(`Error al generar reporte de ${tipo}`);
    } finally {
      setGeneratingReport(null);
    }
  };

  if (userLoading || loadingDashboard) {
    return (
      <div className='reports-dashboard'>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Cargando métricas...</p>
        </div>
      </div>
    );
  }

  if (errorDashboard) {
    return (
      <div className='reports-dashboard'>
        <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>
          <p>Error: {errorDashboard}</p>
        </div>
      </div>
    );
  }

  if (!empresaId || !user) {
    return (
      <div className='reports-dashboard'>
        <div style={{ textAlign: 'center', padding: '40px', color: 'orange' }}>
          <p>⚠️ No se pudo obtener información de la empresa</p>
          <p style={{ fontSize: '14px', marginTop: '10px' }}>Por favor, inicia sesión nuevamente</p>
        </div>
      </div>
    );
  }

  // Convertir las métricas del backend a números
  const usuariosActivos = dashboardMetrics
    ? parseInt(dashboardMetrics.usuarios.usuarios_activos)
    : 0;
  const productosStockBajo = dashboardMetrics
    ? parseInt(dashboardMetrics.productos.productos_stock_bajo)
    : 0;
  const valorInventario = dashboardMetrics
    ? parseFloat(dashboardMetrics.productos.valor_inventario)
    : 0;
  const totalUsuarios = dashboardMetrics ? parseInt(dashboardMetrics.usuarios.total_usuarios) : 0;
  const totalProductos = dashboardMetrics
    ? parseInt(dashboardMetrics.productos.total_productos)
    : 0;
  const invitacionesPendientes = dashboardMetrics
    ? parseInt(dashboardMetrics.invitaciones.invitaciones_pendientes)
    : 0;
  const totalRoles = dashboardMetrics ? parseInt(dashboardMetrics.roles.total_roles) : 0;

  // Stats data configuration
  const usuariosStats: StatItem[] = [
    {
      icon: <HiCheckCircle />,
      label: 'Activos',
      value: dashboardMetrics?.usuarios.usuarios_activos || 0,
      iconColor: 'success',
    },
    {
      icon: <HiXCircle />,
      label: 'Inactivos',
      value: dashboardMetrics?.usuarios.usuarios_inactivos || 0,
      iconColor: 'danger',
    },
    {
      icon: <HiUserAdd />,
      label: 'Nuevos',
      value: dashboardMetrics?.usuarios.usuarios_nuevos_periodo || 0,
      iconColor: 'info',
    },
  ];

  const inventarioStats: StatItem[] = [
    {
      icon: <HiCube />,
      label: 'Total productos',
      value: dashboardMetrics?.productos.total_productos || 0,
      iconColor: 'primary',
    },
    {
      icon: <HiExclamation />,
      label: 'Stock bajo',
      value: dashboardMetrics?.productos.productos_stock_bajo || 0,
      iconColor: 'warning',
    },
    {
      icon: <HiTrendingUp />,
      label: 'Promedio stock',
      value: parseFloat(dashboardMetrics?.productos.promedio_stock || '0').toFixed(0),
      iconColor: 'info',
    },
  ];

  const invitacionesStats: StatItem[] = [
    {
      icon: <HiClock />,
      label: 'Pendientes',
      value: invitacionesPendientes,
      iconColor: 'warning',
    },
    {
      icon: <HiCheckCircle />,
      label: 'Aceptadas',
      value: dashboardMetrics?.invitaciones.invitaciones_aceptadas || 0,
      iconColor: 'success',
    },
    {
      icon: <HiXCircle />,
      label: 'Rechazadas',
      value: dashboardMetrics?.invitaciones.invitaciones_rechazadas || 0,
      iconColor: 'danger',
    },
  ];

  const rolesStats: StatItem[] = [
    {
      icon: <HiShieldCheck />,
      label: 'Total roles',
      value: totalRoles,
      iconColor: 'primary',
    },
    {
      icon: <HiStar />,
      label: 'Predeterminados',
      value: dashboardMetrics?.roles.roles_predeterminados || 0,
      iconColor: 'warning',
    },
    {
      icon: <HiSparkles />,
      label: 'Personalizados',
      value: dashboardMetrics?.roles.roles_personalizados || 0,
      iconColor: 'info',
    },
  ];

  return (
    <div className='reports-dashboard'>
      <header className='reports-dashboard__header'>
        <div className='reports-dashboard__header-top'>
          <div>
            <h1 className='reports-dashboard__title'>Panel de Reportes</h1>
            <p className='reports-dashboard__subtitle'>
              Vista general de métricas y reportes del sistema. Genera informes en PDF o Excel.
            </p>
          </div>
          <div className='reports-dashboard__export-buttons'>
            <button onClick={handleExportPDF} className='export-btn export-btn--pdf'>
              <BsFilePdfFill /> Exportar PDF
            </button>
            <button onClick={handleExportExcel} className='export-btn export-btn--excel'>
              <BsFileEarmarkExcelFill /> Exportar Excel
            </button>
          </div>
        </div>
      </header>

      <section className='reports-dashboard__kpis'>
        <MetricCard label='Total Usuarios' value={totalUsuarios} hint='Usuarios registrados' />
        <MetricCard label='Usuarios Activos' value={usuariosActivos} hint='Últimos 30 días' />
        <MetricCard label='Total Productos' value={totalProductos} hint='En inventario' />
        <MetricCard
          label='Valor Inventario'
          value={`$${valorInventario.toLocaleString()}`}
          hint='Valoración total'
        />
      </section>

      {/* Alerta de Stock Bajo */}
      {stockBajo && stockBajo.alerta && (
        <div className='stock-alert'>
          <HiExclamation className='stock-alert__icon' />
          <div>
            <h3 className='stock-alert__title'>
              Alerta: {stockBajo.cantidad_productos_criticos} productos con stock bajo
            </h3>
            <p className='stock-alert__message'>
              Revisa el reporte de inventario para más detalles
            </p>
          </div>
        </div>
      )}

      <section className='reports-dashboard__trends'>
        <StatsCard title='Métricas de Usuarios' titleIcon={<HiUsers />} items={usuariosStats} />
        <StatsCard title='Métricas de Inventario' titleIcon={<HiCube />} items={inventarioStats} />
        <StatsCard title='Invitaciones' titleIcon={<HiMail />} items={invitacionesStats} />
        <StatsCard title='Roles del Sistema' titleIcon={<HiShieldCheck />} items={rolesStats} />
      </section>

      <div className='reports-dashboard__grid'>
        <div onClick={() => handleGenerateReport('usuarios')} style={{ cursor: 'pointer' }}>
          <SectionCard
            title='Usuarios'
            description='Gestión de usuarios activos, roles y permisos del sistema.'
          >
            <div className='section-card-stats'>
              <div className='section-card-stat'>
                <span className='section-card-stat__value'>{totalUsuarios}</span>
                <span className='section-card-stat__label'>Total</span>
              </div>
              <div className='section-card-stat'>
                <span className='section-card-stat__value'>{usuariosActivos}</span>
                <span className='section-card-stat__label'>Activos</span>
              </div>
            </div>
            <div className='section-card__footer'>
              <span className='section-card-link'>
                {generatingReport === 'usuarios' ? (
                  <>
                    <HiClock className='spinning' /> Generando...
                  </>
                ) : (
                  <>
                    <BsFileEarmarkExcelFill /> Generar Reporte Excel →
                  </>
                )}
              </span>
            </div>
          </SectionCard>
        </div>

        <div onClick={() => handleGenerateReport('productos')} style={{ cursor: 'pointer' }}>
          <SectionCard
            title='Productos'
            description='Inventario, stock, valoración y productos más vendidos.'
          >
            <div className='section-card-stats'>
              <div className='section-card-stat'>
                <span className='section-card-stat__value'>{totalProductos}</span>
                <span className='section-card-stat__label'>Total</span>
              </div>
              <div className='section-card-stat'>
                <span
                  className='section-card-stat__value'
                  style={{ color: productosStockBajo > 0 ? '#dc3545' : '#28a745' }}
                >
                  {productosStockBajo}
                </span>
                <span className='section-card-stat__label'>Stock Bajo</span>
              </div>
            </div>
            <div className='section-card__footer'>
              <span className='section-card-link'>
                {generatingReport === 'productos' ? (
                  <>
                    <HiClock className='spinning' /> Generando...
                  </>
                ) : (
                  <>
                    <BsFileEarmarkExcelFill /> Generar Reporte Excel →
                  </>
                )}
              </span>
            </div>
          </SectionCard>
        </div>

        <Link to='/reportes/invitaciones' style={{ textDecoration: 'none', color: 'inherit' }}>
          <SectionCard
            title='Invitaciones'
            description='Estado de invitaciones, tasa de aceptación y seguimiento.'
          >
            <div className='section-card-stats'>
              <div className='section-card-stat'>
                <span className='section-card-stat__value'>{invitacionesPendientes}</span>
                <span className='section-card-stat__label'>Pendientes</span>
              </div>
              <div className='section-card-stat'>
                <span className='section-card-stat__value'>
                  {dashboardMetrics?.invitaciones.invitaciones_aceptadas || 0}
                </span>
                <span className='section-card-stat__label'>Aceptadas</span>
              </div>
            </div>
            <div className='section-card__footer'>
              <span className='section-card-link'>Ver detalles completos →</span>
            </div>
          </SectionCard>
        </Link>
      </div>
    </div>
  );
};

export default ReportsDashboardPage;
