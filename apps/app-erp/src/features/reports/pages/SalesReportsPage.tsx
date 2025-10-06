import React, { useMemo } from 'react';
import { useDummyReportsData } from '../hooks/useDummyReportsData';
import SimpleTable from '../components/SimpleTable';
import FilterBar from '../components/FilterBar';
// Reemplazamos MiniBarChart por el nuevo TopProductsChart para vista de productos
import TopProductsChart from '../components/TopProductsChart';
import AdvancedBarChart from '../components/AdvancedBarChart';
import { groupByDate } from '../utils/aggregate';
import { useReportFilters } from '../hooks/useReportFilters';
import { exportXlsx } from '../utils/exportXlsx';
import './SalesReportsPage.css';
import { Link } from 'react-router-dom';
import MetricCard from '../components/MetricCard';

const SalesReportsPage: React.FC = () => {
  const { sales, metrics } = useDummyReportsData();
  const today = new Date().toISOString().slice(0, 10);
  const { filters, setFilters } = useReportFilters('ventas', {
    search: '',
    from: today,
    to: today,
    groupBy: 'dia',
  });

  const filtered = useMemo(() => {
    return sales.filter((r) => {
      if (filters.search && !r.producto.toLowerCase().includes(filters.search.toLowerCase()))
        return false;
      if (filters.from && r.fecha < filters.from) return false;
      if (filters.to && r.fecha > filters.to) return false;
      return true;
    });
  }, [sales, filters]);

  const groupedByProduct = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((s) => {
      map.set(s.producto, (map.get(s.producto) || 0) + s.total);
    });
    return Array.from(map.entries())
      .map(([label, value]) => ({ label, value: Number(value.toFixed(2)) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [filtered]);

  const groupedByDate = useMemo(() => {
    return groupByDate(filtered, 'fecha', filters.groupBy as any, (s) => s.total).map((r) => ({
      key: r.key,
      total: Number(r.total.toFixed(2)),
    }));
  }, [filtered, filters.groupBy]);

  const [chartMode, setChartMode] = React.useState<'productos' | 'tiempo'>('productos');

  const handleExport = () => {
    exportXlsx('reporte_ventas', {
      Ventas: filtered,
      ProductosTop: groupedByProduct.map((g) => ({ producto: g.label, total: g.value })),
    });
  };

  return (
    <div className='report-page'>
      <header className='report-page__header'>
        <nav style={{ width: '100%' }}>
          <Link to='/reportes' className='report-back-link'>
            &larr; Volver al Panel
          </Link>
        </nav>
        <div className='report-page__header-text'>
          <h2 className='report-page__title'>Reportes de Ventas</h2>
          <p className='report-page__subtitle'>Rendimiento diario simulado para ejemplo de UI.</p>
        </div>
        <button className='report-btn' onClick={handleExport}>
          Exportar XLSX
        </button>
      </header>
      <FilterBar value={filters} onChange={setFilters} placeholderSearch='Producto...' />
      <div className='report-block'>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '.5rem',
            flexWrap: 'wrap',
          }}
        >
          <h4 className='report-block__title'>
            {chartMode === 'productos'
              ? 'Top Productos (Total)'
              : 'Ventas por ' +
                (filters.groupBy === 'dia'
                  ? 'Día'
                  : filters.groupBy === 'semana'
                    ? 'Semana'
                    : 'Mes')}
          </h4>
          <div style={{ display: 'flex', gap: '.4rem' }}>
            <button
              className='report-btn'
              style={{
                padding: '.35rem .7rem',
                background: chartMode === 'productos' ? 'var(--sec-700)' : 'var(--pri-400)',
              }}
              onClick={() => setChartMode('productos')}
            >
              Productos
            </button>
            <button
              className='report-btn'
              style={{
                padding: '.35rem .7rem',
                background: chartMode === 'tiempo' ? 'var(--sec-700)' : 'var(--pri-400)',
              }}
              onClick={() => setChartMode('tiempo')}
            >
              Tiempo
            </button>
          </div>
        </div>
        {chartMode === 'productos' ? (
          <TopProductsChart
            data={groupedByProduct.map((g) => ({ label: g.label, value: g.value }))}
          />
        ) : (
          <AdvancedBarChart data={groupedByDate} />
        )}
      </div>
      <section className='report-metrics'>
        <MetricCard
          label='Total Ventas'
          value={'Bs ' + metrics.salesTotal.toLocaleString()}
          trend={12}
          hint='vs. día anterior'
        />
        <MetricCard
          label='Ticket Promedio'
          value={'Bs ' + metrics.avgTicket.toLocaleString()}
          trend={-3}
          hint='variación'
        />
      </section>
      <SimpleTable
        caption='Detalle de ventas (dummy)'
        columns={[
          { key: 'id', label: '#', sortable: true },
          { key: 'fecha', label: 'Fecha', sortable: true },
          { key: 'producto', label: 'Producto', sortable: true },
          { key: 'cantidad', label: 'Cant.', sortable: true },
          {
            key: 'precioUnitario',
            label: 'P.Unit',
            render: (r) => 'Bs ' + r.precioUnitario,
            sortable: true,
          },
          { key: 'total', label: 'Total', render: (r) => 'Bs ' + r.total, sortable: true },
        ]}
        data={filtered}
      />
    </div>
  );
};

export default SalesReportsPage;
