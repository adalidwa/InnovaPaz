/**
 * 📊 PÁGINA DE REPORTES AVANZADOS
 * Interfaz integrada para todos los reportes del ERP con exportación profesional
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdvancedReports } from '../hooks/useAdvancedReports';
import { useUser } from '../../users/hooks/useContextBase';
import ExportButtons from '../components/ExportButtons';
import MetricCard from '../components/MetricCard';
import SimpleTable from '../components/SimpleTable';
import FilterBar from '../components/FilterBar';
import { useReportFilters } from '../hooks/useReportFilters';
import './AdvancedReportsPage.css';

type ReportType = 'ventas' | 'inventario' | 'movimientos' | 'alertas';

const AdvancedReportsPage: React.FC = () => {
  const { user } = useUser();
  const empresaId = user?.empresa_id || '';

  const [activeReport, setActiveReport] = useState<ReportType>('ventas');
  const [exportLoading, setExportLoading] = useState(false);

  const {
    // Ventas
    ventasReport,
    loadingVentas,
    errorVentas,
    refreshVentas,
    exportVentasPDF,
    exportVentasExcel,

    // Inventario
    inventarioReport,
    loadingInventario,
    errorInventario,
    refreshInventario,
    exportInventarioPDF,
    exportInventarioExcel,

    // Movimientos
    movimientosReport,
    loadingMovimientos,
    errorMovimientos,
    refreshMovimientos,
    exportMovimientosPDF,
    exportMovimientosExcel,

    // Alertas
    alertasReport,
    loadingAlertas,
    errorAlertas,
    refreshAlertas,
    exportAlertasPDF,
    exportAlertasExcel,

    // Utilidades
    clearAllErrors,
  } = useAdvancedReports(empresaId);

  // Filtros por tipo de reporte
  const { filters, setFilters } = useReportFilters(activeReport, {
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    to: new Date().toISOString().slice(0, 10),
    search: '',
    groupBy: 'dia',
  });

  // Cargar datos según el reporte activo
  useEffect(() => {
    if (!empresaId) return;

    clearAllErrors();

    switch (activeReport) {
      case 'ventas':
        refreshVentas({
          fecha_desde: filters.from,
          fecha_hasta: filters.to,
        });
        break;
      case 'inventario':
        refreshInventario({
          stock_minimo: 10,
        });
        break;
      case 'movimientos':
        refreshMovimientos({
          fecha_desde: filters.from,
          fecha_hasta: filters.to,
        });
        break;
      case 'alertas':
        refreshAlertas(10);
        break;
    }
  }, [activeReport, empresaId, filters.from, filters.to]);

  // Funciones de exportación con loading
  const handleExportPDF = async () => {
    setExportLoading(true);
    try {
      switch (activeReport) {
        case 'ventas':
          await exportVentasPDF({ fecha_desde: filters.from, fecha_hasta: filters.to });
          break;
        case 'inventario':
          await exportInventarioPDF();
          break;
        case 'movimientos':
          await exportMovimientosPDF({ fecha_desde: filters.from, fecha_hasta: filters.to });
          break;
        case 'alertas':
          await exportAlertasPDF(10);
          break;
      }
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportExcel = async () => {
    setExportLoading(true);
    try {
      switch (activeReport) {
        case 'ventas':
          await exportVentasExcel({ fecha_desde: filters.from, fecha_hasta: filters.to });
          break;
        case 'inventario':
          await exportInventarioExcel();
          break;
        case 'movimientos':
          await exportMovimientosExcel({ fecha_desde: filters.from, fecha_hasta: filters.to });
          break;
        case 'alertas':
          await exportAlertasExcel(10);
          break;
      }
    } finally {
      setExportLoading(false);
    }
  };

  // Obtener datos según el reporte activo
  const getCurrentData = () => {
    switch (activeReport) {
      case 'ventas':
        return {
          loading: loadingVentas,
          error: errorVentas,
          data: ventasReport,
        };
      case 'inventario':
        return {
          loading: loadingInventario,
          error: errorInventario,
          data: inventarioReport,
        };
      case 'movimientos':
        return {
          loading: loadingMovimientos,
          error: errorMovimientos,
          data: movimientosReport,
        };
      case 'alertas':
        return {
          loading: loadingAlertas,
          error: errorAlertas,
          data: alertasReport,
        };
      default:
        return { loading: false, error: null, data: null };
    }
  };

  const { loading, error, data } = getCurrentData();

  // Renderizar métricas según el tipo de reporte
  const renderMetrics = () => {
    if (!data) return null;

    switch (activeReport) {
      case 'ventas': {
        const ventas = data as typeof ventasReport;
        if (!ventas?.estadisticas) return null;
        return (
          <section className='report-metrics'>
            <MetricCard
              label='Total Ventas'
              value={ventas.estadisticas.total_ventas.toLocaleString()}
              hint='transacciones'
            />
            <MetricCard
              label='Ingresos Totales'
              value={`Bs ${ventas.estadisticas.ingresos_totales.toLocaleString('es-BO')}`}
              hint='en el período'
            />
            <MetricCard
              label='Venta Promedio'
              value={`Bs ${ventas.estadisticas.venta_promedio.toLocaleString('es-BO')}`}
              hint='por transacción'
            />
            <MetricCard
              label='Clientes Únicos'
              value={ventas.estadisticas.clientes_unicos.toLocaleString()}
              hint='diferentes'
            />
          </section>
        );
      }

      case 'inventario': {
        const inventario = data as typeof inventarioReport;
        if (!inventario?.estadisticas) return null;
        return (
          <section className='report-metrics'>
            <MetricCard
              label='Total Productos'
              value={inventario.estadisticas.total_productos.toLocaleString()}
              hint='en inventario'
            />
            <MetricCard
              label='Valor Total'
              value={`Bs ${inventario.estadisticas.valor_total_inventario.toLocaleString('es-BO')}`}
              hint='del inventario'
            />
            <MetricCard
              label='Stock Bajo'
              value={inventario.estadisticas.productos_stock_bajo.toLocaleString()}
              hint='productos críticos'
            />
            <MetricCard
              label='Sin Stock'
              value={inventario.estadisticas.productos_sin_stock.toLocaleString()}
              hint='productos agotados'
            />
          </section>
        );
      }

      case 'movimientos': {
        const movimientos = data as typeof movimientosReport;
        if (!movimientos?.estadisticas) return null;
        return (
          <section className='report-metrics'>
            <MetricCard
              label='Total Movimientos'
              value={movimientos.estadisticas.total_movimientos.toLocaleString()}
              hint='en el período'
            />
            <MetricCard
              label='Entradas'
              value={movimientos.estadisticas.total_entradas.toLocaleString()}
              hint='al inventario'
            />
            <MetricCard
              label='Salidas'
              value={movimientos.estadisticas.total_salidas.toLocaleString()}
              hint='del inventario'
            />
            <MetricCard
              label='Usuarios Activos'
              value={movimientos.estadisticas.usuarios_activos.toLocaleString()}
              hint='realizaron movimientos'
            />
          </section>
        );
      }

      case 'alertas': {
        const alertas = data as typeof alertasReport;
        if (!alertas?.estadisticas) return null;
        return (
          <section className='report-metrics'>
            <MetricCard
              label='Total Alertas'
              value={alertas.estadisticas.total_alertas.toLocaleString()}
              hint='activas'
            />
            <MetricCard
              label='Sin Stock'
              value={alertas.estadisticas.alertas_sin_stock.toLocaleString()}
              hint='productos críticos'
            />
            <MetricCard
              label='Stock Bajo'
              value={alertas.estadisticas.alertas_stock_bajo.toLocaleString()}
              hint='productos en riesgo'
            />
            <MetricCard
              label='Próximos a Vencer'
              value={alertas.estadisticas.alertas_vencimiento.toLocaleString()}
              hint='productos con vencimiento'
            />
          </section>
        );
      }

      default:
        return null;
    }
  };

  // Renderizar tabla principal
  const renderMainTable = () => {
    if (!data) return null;

    switch (activeReport) {
      case 'ventas': {
        const ventas = data as typeof ventasReport;
        if (!ventas?.ventas) return null;
        return (
          <SimpleTable
            caption={`Ventas - ${ventas.ventas.length} registros`}
            columns={[
              { key: 'numero_venta', label: 'N° Venta', sortable: true },
              {
                key: 'fecha_venta',
                label: 'Fecha',
                render: (r: any) => new Date(r.fecha_venta).toLocaleDateString('es-BO'),
                sortable: true,
              },
              {
                key: 'cliente_nombre',
                label: 'Cliente',
                render: (r: any) =>
                  r.cliente_nombre || r.nombre_cliente_directo || 'Cliente Directo',
                sortable: true,
              },
              {
                key: 'total',
                label: 'Total',
                render: (r: any) => `Bs ${r.total.toLocaleString('es-BO')}`,
                sortable: true,
              },
              { key: 'metodo_pago', label: 'Método Pago', sortable: true },
              { key: 'estado_venta', label: 'Estado', sortable: true },
            ]}
            data={ventas.ventas.slice(0, 100)} // Limitar a 100 registros para performance
          />
        );
      }

      case 'inventario': {
        const inventario = data as typeof inventarioReport;
        if (!inventario?.productos) return null;
        return (
          <SimpleTable
            caption={`Inventario - ${inventario.productos.length} productos`}
            columns={[
              { key: 'codigo', label: 'Código', sortable: true },
              { key: 'nombre_producto', label: 'Producto', sortable: true },
              { key: 'stock', label: 'Stock', sortable: true },
              {
                key: 'precio_venta',
                label: 'P. Venta',
                render: (r: any) => `Bs ${r.precio_venta.toLocaleString('es-BO')}`,
                sortable: true,
              },
              {
                key: 'valor_stock',
                label: 'Valor Stock',
                render: (r: any) => `Bs ${r.valor_stock.toLocaleString('es-BO')}`,
                sortable: true,
              },
              { key: 'nombre_categoria', label: 'Categoría', sortable: true },
            ]}
            data={inventario.productos.slice(0, 100)}
          />
        );
      }

      case 'movimientos': {
        const movimientos = data as typeof movimientosReport;
        if (!movimientos?.movimientos) return null;
        return (
          <SimpleTable
            caption={`Movimientos - ${movimientos.movimientos.length} registros`}
            columns={[
              {
                key: 'fecha_movimiento',
                label: 'Fecha',
                render: (r: any) => new Date(r.fecha_movimiento).toLocaleDateString('es-BO'),
                sortable: true,
              },
              {
                key: 'tipo_movimiento',
                label: 'Tipo',
                render: (r: any) => r.tipo_movimiento.toUpperCase(),
                sortable: true,
              },
              { key: 'nombre_producto', label: 'Producto', sortable: true },
              { key: 'cantidad', label: 'Cantidad', sortable: true },
              { key: 'usuario_nombre', label: 'Usuario', sortable: true },
              { key: 'motivo', label: 'Motivo', sortable: true },
            ]}
            data={movimientos.movimientos.slice(0, 100)}
          />
        );
      }

      case 'alertas': {
        const alertas = data as typeof alertasReport;
        if (
          !alertas?.productos_sin_stock ||
          !alertas?.productos_stock_bajo ||
          !alertas?.productos_proximos_vencer
        )
          return null;

        const allAlertsData = [
          ...alertas.productos_sin_stock.map((p: any) => ({
            ...p,
            tipo_alerta: 'SIN STOCK',
            criticidad: 'ALTA',
          })),
          ...alertas.productos_stock_bajo.map((p: any) => ({
            ...p,
            tipo_alerta: 'STOCK BAJO',
            criticidad: 'MEDIA',
          })),
          ...alertas.productos_proximos_vencer.map((p: any) => ({
            codigo: p.codigo,
            nombre_producto: p.nombre_producto,
            nombre_categoria: 'N/A',
            stock_actual: p.cantidad,
            stock_minimo: 0,
            tipo_alerta: 'PRÓXIMO A VENCER',
            criticidad: p.dias_restantes <= 7 ? 'ALTA' : 'MEDIA',
          })),
        ];

        return (
          <SimpleTable
            caption={`Alertas - ${allAlertsData.length} alertas activas`}
            columns={[
              { key: 'codigo', label: 'Código', sortable: true },
              { key: 'nombre_producto', label: 'Producto', sortable: true },
              { key: 'tipo_alerta', label: 'Tipo Alerta', sortable: true },
              { key: 'criticidad', label: 'Criticidad', sortable: true },
              { key: 'stock_actual', label: 'Stock', sortable: true },
              { key: 'nombre_categoria', label: 'Categoría', sortable: true },
            ]}
            data={allAlertsData.slice(0, 100)}
          />
        );
      }

      default:
        return null;
    }
  };

  if (!empresaId) {
    return (
      <div className='report-page'>
        <div style={{ textAlign: 'center', padding: '40px', color: 'orange' }}>
          <p>⚠️ Configuración pendiente: Se requiere ID de empresa</p>
        </div>
      </div>
    );
  }

  return (
    <div className='report-page'>
      <header className='report-page__header'>
        <nav style={{ width: '100%' }}>
          <Link to='/reportes' className='report-back-link'>
            &larr; Volver al Panel
          </Link>
        </nav>
        <div className='report-page__header-text'>
          <h2 className='report-page__title'>Reportes Avanzados</h2>
          <p className='report-page__subtitle'>
            Sistema completo de reportes con exportación profesional
          </p>
        </div>
        <ExportButtons
          onExportPDF={handleExportPDF}
          onExportExcel={handleExportExcel}
          loading={exportLoading}
          disabled={!data}
        />
      </header>

      {/* Selector de tipo de reporte */}
      <div className='report-tabs'>
        <button
          className={`report-tab ${activeReport === 'ventas' ? 'report-tab--active' : ''}`}
          onClick={() => setActiveReport('ventas')}
        >
          💰 Ventas
        </button>
        <button
          className={`report-tab ${activeReport === 'inventario' ? 'report-tab--active' : ''}`}
          onClick={() => setActiveReport('inventario')}
        >
          📦 Inventario
        </button>
        <button
          className={`report-tab ${activeReport === 'movimientos' ? 'report-tab--active' : ''}`}
          onClick={() => setActiveReport('movimientos')}
        >
          📋 Movimientos
        </button>
        <button
          className={`report-tab ${activeReport === 'alertas' ? 'report-tab--active' : ''}`}
          onClick={() => setActiveReport('alertas')}
        >
          🚨 Alertas
        </button>
      </div>

      {/* Filtros para fechas en algunos reportes */}
      {(activeReport === 'ventas' || activeReport === 'movimientos') && (
        <FilterBar value={filters} onChange={setFilters} placeholderSearch='Buscar...' />
      )}

      {/* Estado de carga */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Cargando reporte de {activeReport}...</p>
        </div>
      )}

      {/* Estado de error */}
      {error && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>
          <p>Error: {error}</p>
        </div>
      )}

      {/* Contenido del reporte */}
      {!loading && !error && data && (
        <>
          {renderMetrics()}
          {renderMainTable()}
        </>
      )}
    </div>
  );
};

export default AdvancedReportsPage;
