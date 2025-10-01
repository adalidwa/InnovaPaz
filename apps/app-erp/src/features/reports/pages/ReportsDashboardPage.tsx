import React, { useMemo } from 'react';
import SectionCard from '../components/SectionCard.tsx';
import { Link } from 'react-router-dom';
import './ReportsDashboardPage.css';
import MetricCard from '../components/MetricCard';
import TinyTrendBar from '../components/TinyTrendBar';
import { useDummyReportsData } from '../hooks/useDummyReportsData';
import { groupByDate } from '../utils/aggregate';

const ReportsDashboardPage: React.FC = () => {
  const { sales, purchases, /* inventory */ metrics } = useDummyReportsData();

  const last7Sales = useMemo(
    () => groupByDate(sales, 'fecha', 'dia', (s) => s.total).slice(-7),
    [sales]
  );
  const last7Purchases = useMemo(
    () => groupByDate(purchases, 'fecha', 'dia', (p) => p.costo).slice(-7),
    [purchases]
  );

  return (
    <div className='reports-dashboard'>
      <header className='reports-dashboard__header'>
        <h1 className='reports-dashboard__title'>Panel de Reportes</h1>
        <p className='reports-dashboard__subtitle'>
          Resumen y accesos rápidos a los principales reportes del sistema.
        </p>
      </header>
      <section className='reports-dashboard__kpis'>
        <MetricCard
          label='Ventas Totales'
          value={'Bs ' + metrics.salesTotal.toLocaleString()}
          trend={8}
          hint='últimos días'
        />
        <MetricCard
          label='Ticket Promedio'
          value={'Bs ' + metrics.avgTicket.toLocaleString()}
          trend={2}
        />
        <MetricCard
          label='Compras Totales'
          value={'Bs ' + metrics.purchaseTotal.toLocaleString()}
          trend={-4}
        />
        <MetricCard
          label='Valuación Stock'
          value={'Bs ' + metrics.stockValuation.toLocaleString()}
          trend={5}
        />
      </section>
      <section className='reports-dashboard__trends'>
        <TinyTrendBar
          title='Tendencia Ventas (7d)'
          data={last7Sales.map((r) => ({ key: r.key, total: Number(r.total.toFixed(2)) }))}
          currency
        />
        <TinyTrendBar
          title='Tendencia Compras (7d)'
          data={last7Purchases.map((r) => ({ key: r.key, total: Number(r.total.toFixed(2)) }))}
          currency
        />
      </section>
      <div className='reports-dashboard__grid'>
        <SectionCard
          title='Ventas'
          description='Métricas de facturación, tickets promedio y top productos.'
        >
          <Link className='reports-dashboard__link' to='ventas'>
            Ver reportes de Ventas →
          </Link>
        </SectionCard>
        <SectionCard
          title='Compras'
          description='Gasto a proveedores, órdenes y variaciones de costo.'
        >
          <Link className='reports-dashboard__link' to='compras'>
            Ver reportes de Compras →
          </Link>
        </SectionCard>
        <SectionCard title='Inventario' description='Rotación, valuación y quiebres de stock.'>
          <Link className='reports-dashboard__link' to='inventario'>
            Ver reportes de Inventario →
          </Link>
        </SectionCard>
      </div>
    </div>
  );
};

export default ReportsDashboardPage;
