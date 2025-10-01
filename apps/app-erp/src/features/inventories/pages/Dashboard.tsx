import React from 'react';
import SummaryCardsRow from '../components/ui/SummaryCardsRow';
import StatusListCard from '../components/ui/StatusListCard';
import './Dashboard.css';

const Dashboard = () => {
  // Sample data for Recent Movements (only entrada and salida, with quantity as value)
  const recentMovements = [
    {
      id: 1,
      title: 'Entrada de Producto X',
      tag: { label: 'Entrada', type: 'entrada' },
      value: 50,
    },
    {
      id: 2,
      title: 'Salida de Producto Y',
      tag: { label: 'Salida', type: 'salida' },
      value: 20,
    },
  ];

  // Sample data for Critical Products (only critico and bajo, with see more icon, no quantity)
  const criticalProducts = [
    {
      id: 1,
      title: 'Producto A',
      tag: { label: 'Crítico', type: 'critico' },
      hasIcon: true,
    },
    {
      id: 2,
      title: 'Producto B',
      tag: { label: 'Bajo', type: 'bajo' },
      hasIcon: true,
    },
  ];

  return (
    <div className='dashboard'>
      <SummaryCardsRow />
      <div className='dashboard-row'>
        <StatusListCard
          title='Movimientos Recientes'
          items={recentMovements}
          buttonLabel='Ver todos los movimientos'
          buttonVariant='secondary'
          buttonClassName='status-list-card__button--blue-border'
          onButtonClick={() => console.log('Movimientos clicked')}
        />
        <StatusListCard
          title='Productos Críticos'
          items={criticalProducts}
          buttonLabel='Gestionar stock critico'
          buttonVariant='warning'
          buttonClassName='status-list-card__button--text-primary'
          onButtonClick={() => console.log('Productos clicked')}
        />
      </div>
    </div>
  );
};

export default Dashboard;
