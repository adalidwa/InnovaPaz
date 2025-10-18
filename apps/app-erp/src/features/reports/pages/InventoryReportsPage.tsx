import React, { useEffect, useMemo } from 'react';
import { useReports } from '../hooks/useReports';
import { useUser } from '../../users/hooks/useContextBase';
import SimpleTable from '../components/SimpleTable';
import FilterBar from '../components/FilterBar';
import MiniBarChart from '../components/MiniBarChart';
import { exportXlsx } from '../utils/exportXlsx';
import { useReportFilters } from '../hooks/useReportFilters';
import './InventoryReportsPage.css';
import { Link } from 'react-router-dom';
import MetricCard from '../components/MetricCard';
import reportsService from '../services/reportsService';

const InventoryReportsPage: React.FC = () => {
  const { user } = useUser();
  const empresaId = user?.empresa_id || '';
  const { productosReport, loadingProductos, errorProductos, refreshProductos } =
    useReports(empresaId);

  const today = new Date().toISOString().slice(0, 10);
  const { filters, setFilters } = useReportFilters('inventario', {
    search: '',
    from: today,
    to: today,
    groupBy: 'dia',
  });

  // Cargar productos al montar
  useEffect(() => {
    if (empresaId) {
      refreshProductos({ ordenar_por: 'stock', orden: 'ASC' });
    }
  }, [empresaId, refreshProductos]);

  // Filtrar productos por búsqueda
  const filtered = useMemo(() => {
    if (!productosReport) return [];

    return productosReport.productos.filter((p) => {
      if (filters.search && !p.nombre_producto.toLowerCase().includes(filters.search.toLowerCase()))
        return false;
      return true;
    });
  }, [productosReport, filters]);

  // Top 10 productos por valoración
  const grouped = useMemo(() => {
    if (!filtered.length) return [];

    return filtered
      .map((p) => ({
        label: p.codigo || p.nombre_producto.substring(0, 15),
        value: parseFloat(p.valor_stock),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [filtered]);

  const handleExport = () => {
    if (!filtered.length) {
      alert('No hay datos para exportar');
      return;
    }

    exportXlsx('reporte_inventario', {
      Inventario: filtered.map((p) => ({
        Código: p.codigo,
        Producto: p.nombre_producto,
        Stock: p.stock,
        'Precio Costo': parseFloat(p.precio_costo),
        'Precio Venta': parseFloat(p.precio_venta),
        'Valor Stock': parseFloat(p.valor_stock),
        Categoría: p.nombre_categoria,
        Marca: p.marca_nombre,
        Estado: p.estado_nombre,
      })),
      Resumen: [
        {
          'Total Productos': productosReport?.estadisticas.total_productos || 0,
          'Stock Bajo': productosReport?.estadisticas.productos_stock_bajo || 0,
          'Total Unidades': productosReport?.estadisticas.total_unidades || 0,
          'Valor Total': productosReport?.estadisticas.valor_total_inventario || 0,
        },
      ],
    });
  };

  const handleExportPDF = async () => {
    try {
      await reportsService.exportProductosPDF(empresaId);
    } catch (error) {
      console.error('Error exportando PDF:', error);
      alert('Error al exportar PDF');
    }
  };

  const handleExportExcel = async () => {
    try {
      await reportsService.exportProductosExcel(empresaId);
    } catch (error) {
      console.error('Error exportando Excel:', error);
      alert('Error al exportar Excel');
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

  if (loadingProductos) {
    return (
      <div className='report-page'>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Cargando reporte de inventario...</p>
        </div>
      </div>
    );
  }

  if (errorProductos) {
    return (
      <div className='report-page'>
        <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>
          <p>Error: {errorProductos}</p>
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
          <h2 className='report-page__title'>Reportes de Inventario</h2>
          <p className='report-page__subtitle'>
            Valuación y gestión de stock - {filtered.length} productos
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className='report-btn' onClick={handleExportPDF}>
            📄 PDF
          </button>
          <button className='report-btn' onClick={handleExportExcel}>
            📊 Excel
          </button>
          <button className='report-btn' onClick={handleExport} disabled={!filtered.length}>
            Exportar XLSX (Local)
          </button>
        </div>
      </header>

      <FilterBar value={filters} onChange={setFilters} placeholderSearch='Buscar producto...' />

      {grouped.length > 0 && (
        <div className='report-block'>
          <h4 className='report-block__title'>Top 10 Productos por Valoración</h4>
          <MiniBarChart data={grouped} color='#dd6b20' />
        </div>
      )}

      <section className='report-metrics'>
        <MetricCard
          label='Total Productos'
          value={productosReport?.estadisticas.total_productos || '0'}
          trend={0}
          hint='en inventario'
        />
        <MetricCard
          label='Valuación Stock'
          value={
            'Bs ' +
            parseFloat(productosReport?.estadisticas.valor_total_inventario || '0').toLocaleString(
              'es-BO'
            )
          }
          trend={0}
          hint='valor total'
        />
        <MetricCard
          label='Stock Bajo'
          value={productosReport?.estadisticas.productos_stock_bajo || '0'}
          trend={0}
          hint='requieren atención'
        />
        <MetricCard
          label='Total Unidades'
          value={(productosReport?.estadisticas.total_unidades || 0).toLocaleString()}
          trend={0}
          hint='en stock'
        />
      </section>

      <SimpleTable
        caption={`Inventario - ${filtered.length} productos`}
        columns={[
          { key: 'codigo', label: 'Código', sortable: true },
          { key: 'nombre_producto', label: 'Producto', sortable: true },
          { key: 'nombre_categoria', label: 'Categoría', sortable: true },
          { key: 'stock', label: 'Stock', sortable: true },
          {
            key: 'precio_costo',
            label: 'P. Costo',
            render: (r) => 'Bs ' + parseFloat(r.precio_costo).toFixed(2),
            sortable: true,
          },
          {
            key: 'precio_venta',
            label: 'P. Venta',
            render: (r) => 'Bs ' + parseFloat(r.precio_venta).toFixed(2),
            sortable: true,
          },
          {
            key: 'valor_stock',
            label: 'Valoración',
            render: (r) => 'Bs ' + parseFloat(r.valor_stock).toFixed(2),
            sortable: true,
          },
          { key: 'estado_nombre', label: 'Estado', sortable: true },
        ]}
        data={filtered}
      />
    </div>
  );
};

export default InventoryReportsPage;
