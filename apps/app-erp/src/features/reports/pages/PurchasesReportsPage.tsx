import React, { useMemo } from 'react';
import { useDummyReportsData } from '../hooks/useDummyReportsData';
import SimpleTable from '../components/SimpleTable';
import FilterBar from '../components/FilterBar';
import MiniBarChart from '../components/MiniBarChart';
import { exportXlsx } from '../utils/exportXlsx';
import { useReportFilters } from '../hooks/useReportFilters';
import './PurchasesReportsPage.css';
import { Link } from 'react-router-dom';
import MetricCard from '../components/MetricCard';

const PurchasesReportsPage: React.FC = () => {
  const { purchases, metrics } = useDummyReportsData();
  const today = new Date().toISOString().slice(0, 10);
  const { filters, setFilters } = useReportFilters('compras', {
    search: '',
    from: today,
    to: today,
    groupBy: 'dia',
  });
  const filtered = useMemo(() => {
    return purchases.filter((p) => {
      if (filters.search && !p.proveedor.toLowerCase().includes(filters.search.toLowerCase()))
        return false;
      if (filters.from && p.fecha < filters.from) return false;
      if (filters.to && p.fecha > filters.to) return false;
      return true;
    });
  }, [purchases, filters]);
  const grouped = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((p) => {
      map.set(p.proveedor, (map.get(p.proveedor) || 0) + p.costo);
    });
    return Array.from(map.entries()).map(([label, value]) => ({
      label,
      value: Number(value.toFixed(2)),
    }));
  }, [filtered]);

  const handleExport = () => {
    exportXlsx('reporte_compras', {
      Compras: filtered,
      GastoPorProveedor: grouped.map((g) => ({ proveedor: g.label, total: g.value })),
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
          <h2 className='report-page__title'>Reportes de Compras</h2>
          <p className='report-page__subtitle'>Gasto a proveedores (ejemplo dummy).</p>
        </div>
        <button className='report-btn' onClick={handleExport}>
          Exportar XLSX
        </button>
      </header>
      <FilterBar value={filters} onChange={setFilters} placeholderSearch='Proveedor...' />
      <div className='report-block'>
        <h4 className='report-block__title'>Gasto por Proveedor</h4>
        <MiniBarChart data={grouped} color='#805ad5' />
      </div>
      <section className='report-metrics'>
        <MetricCard
          label='Total Compras'
          value={'Bs ' + metrics.purchaseTotal.toLocaleString()}
          trend={5}
          hint='vs. período previo'
        />
      </section>
      <SimpleTable
        caption='Detalle de compras (dummy)'
        columns={[
          { key: 'id', label: '#', sortable: true },
          { key: 'fecha', label: 'Fecha', sortable: true },
          { key: 'proveedor', label: 'Proveedor', sortable: true },
          { key: 'items', label: 'Items', sortable: true },
          { key: 'costo', label: 'Costo', render: (r) => 'Bs ' + r.costo, sortable: true },
        ]}
        data={filtered}
      />
    </div>
  );
};

export default PurchasesReportsPage;
