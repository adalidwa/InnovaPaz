import React, { useMemo } from 'react';
import { useDummyReportsData } from '../hooks/useDummyReportsData';
import SimpleTable from '../components/SimpleTable';
import FilterBar from '../components/FilterBar';
import MiniBarChart from '../components/MiniBarChart';
import { exportXlsx } from '../utils/exportXlsx';
import { useReportFilters } from '../hooks/useReportFilters';
import './InventoryReportsPage.css';
import { Link } from 'react-router-dom';
import MetricCard from '../components/MetricCard';

const InventoryReportsPage: React.FC = () => {
  const { inventory, metrics } = useDummyReportsData();
  const today = new Date().toISOString().slice(0, 10);
  const { filters, setFilters } = useReportFilters('inventario', {
    search: '',
    from: today,
    to: today,
    groupBy: 'dia',
  });
  const filtered = useMemo(() => {
    return inventory.filter((i) => {
      if (filters.search && !i.descripcion.toLowerCase().includes(filters.search.toLowerCase()))
        return false;
      return true;
    });
  }, [inventory, filters]);
  const grouped = useMemo(() => {
    return filtered.map((i) => ({ label: i.sku, value: i.valuacion })).slice(0, 10);
  }, [filtered]);

  const handleExport = () => {
    exportXlsx('reporte_inventario', {
      Inventario: filtered,
      Valuacion: grouped.map((g) => ({ sku: g.label, valuacion: g.value })),
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
          <h2 className='report-page__title'>Reportes de Inventario</h2>
          <p className='report-page__subtitle'>Valuación y stock estimado (datos dummy).</p>
        </div>
        <button className='report-btn' onClick={handleExport}>
          Exportar XLSX
        </button>
      </header>
      <FilterBar value={filters} onChange={setFilters} placeholderSearch='Producto...' />
      <div className='report-block'>
        <h4 className='report-block__title'>Valuación por SKU</h4>
        <MiniBarChart data={grouped} color='#dd6b20' />
      </div>
      <section className='report-metrics'>
        <MetricCard
          label='Valuación Stock'
          value={'Bs ' + metrics.stockValuation.toLocaleString()}
          trend={2}
          hint='estimado'
        />
      </section>
      <SimpleTable
        caption='Detalle inventario (dummy)'
        columns={[
          { key: 'sku', label: 'SKU', sortable: true },
          { key: 'descripcion', label: 'Descripción', sortable: true },
          { key: 'stock', label: 'Stock', sortable: true },
          { key: 'minimo', label: 'Mínimo', sortable: true },
          {
            key: 'costoPromedio',
            label: 'C. Prom',
            render: (r) => 'Bs ' + r.costoPromedio,
            sortable: true,
          },
          {
            key: 'valuacion',
            label: 'Valuación',
            render: (r) => 'Bs ' + r.valuacion,
            sortable: true,
          },
        ]}
        data={filtered}
      />
    </div>
  );
};

export default InventoryReportsPage;
