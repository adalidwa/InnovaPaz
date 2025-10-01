import React, { useState } from 'react';
import ProductsHeader from '../components/ProductsHeader';
import SummaryCardsRow from '../components/ui/SummaryCardsRow';
import StatusListCard from '../components/ui/StatusListCard';
import CriticalStockModal from '../components/ui/CriticalStockModal';
import './Dashboard.css';

const Dashboard = () => {
  const [showAllMovements, setShowAllMovements] = useState(false);
  const [showCriticalStockModal, setShowCriticalStockModal] = useState(false);

  const allMovements = [
    {
      id: 1,
      title: 'Entrada de Producto X',
      time: '10:00 AM',
      tag: { label: 'Entrada', type: 'entrada' },
      value: 50,
    },
    {
      id: 2,
      title: 'Salida de Producto Y',
      time: '02:30 PM',
      tag: { label: 'Salida', type: 'salida' },
      value: 20,
    },
    {
      id: 3,
      title: 'Entrada de Producto Z',
      time: '09:15 AM',
      tag: { label: 'Entrada', type: 'entrada' },
      value: 30,
    },
    {
      id: 4,
      title: 'Salida de Producto W',
      time: '04:45 PM',
      tag: { label: 'Salida', type: 'salida' },
      value: 15,
    },
    {
      id: 5,
      title: 'Entrada de Producto V',
      time: '11:30 AM',
      tag: { label: 'Entrada', type: 'entrada' },
      value: 40,
    },
    {
      id: 6,
      title: 'Salida de Producto U',
      time: '01:20 PM',
      tag: { label: 'Salida', type: 'salida' },
      value: 25,
    },
    {
      id: 7,
      title: 'Entrada de Producto T',
      time: '08:00 AM',
      tag: { label: 'Entrada', type: 'entrada' },
      value: 60,
    },
    {
      id: 8,
      title: 'Salida de Producto S',
      time: '03:45 PM',
      tag: { label: 'Salida', type: 'salida' },
      value: 35,
    },
    {
      id: 9,
      title: 'Entrada de Producto R',
      time: '07:30 AM',
      tag: { label: 'Entrada', type: 'entrada' },
      value: 45,
    },
    {
      id: 10,
      title: 'Salida de Producto Q',
      time: '05:00 PM',
      tag: { label: 'Salida', type: 'salida' },
      value: 10,
    },
    {
      id: 11,
      title: 'Entrada de Producto P',
      time: '12:15 PM',
      tag: { label: 'Entrada', type: 'entrada' },
      value: 55,
    },
    {
      id: 12,
      title: 'Salida de Producto O',
      time: '06:30 PM',
      tag: { label: 'Salida', type: 'salida' },
      value: 18,
    },
    {
      id: 13,
      title: 'Entrada de Producto N',
      time: '09:45 AM',
      tag: { label: 'Entrada', type: 'entrada' },
      value: 70,
    },
    {
      id: 14,
      title: 'Salida de Producto M',
      time: '02:00 PM',
      tag: { label: 'Salida', type: 'salida' },
      value: 22,
    },
    {
      id: 15,
      title: 'Entrada de Producto L',
      time: '10:30 AM',
      tag: { label: 'Entrada', type: 'entrada' },
      value: 65,
    },
  ];

  const displayedMovements = showAllMovements ? allMovements : allMovements.slice(0, 7);

  const criticalProducts = [
    {
      id: 1,
      title: 'Producto A',
      subtitle: 'Stock: 3 | Mínimo: 10',
      tag: { label: 'Crítico', type: 'critico' },
      hasIcon: true,
    },
    {
      id: 2,
      title: 'Producto B',
      subtitle: 'Stock: 8 | Mínimo: 15',
      tag: { label: 'Bajo', type: 'bajo' },
      hasIcon: true,
    },
    {
      id: 3,
      title: 'Producto C',
      subtitle: 'Stock: 2 | Mínimo: 7',
      tag: { label: 'Crítico', type: 'critico' },
      hasIcon: true,
    },
    {
      id: 4,
      title: 'Producto D',
      subtitle: 'Stock: 9 | Mínimo: 12',
      tag: { label: 'Bajo', type: 'bajo' },
      hasIcon: true,
    },
    {
      id: 5,
      title: 'Producto E',
      subtitle: 'Stock: 1 | Mínimo: 6',
      tag: { label: 'Crítico', type: 'critico' },
      hasIcon: true,
    },
    {
      id: 6,
      title: 'Producto F',
      subtitle: 'Stock: 5 | Mínimo: 11',
      tag: { label: 'Bajo', type: 'bajo' },
      hasIcon: true,
    },
    {
      id: 7,
      title: 'Producto G',
      subtitle: 'Stock: 4 | Mínimo: 9',
      tag: { label: 'Crítico', type: 'critico' },
      hasIcon: true,
    },
  ];

  return (
    <div className='dashboard'>
      <ProductsHeader
        title='Dashboard de Inventario'
        subtitle='Resumen general de tu minimarket'
        buttonText='Generar reporte'
        buttonVariant='primary'
        hasIcon={false}
      />
      <SummaryCardsRow />
      <div className='dashboard-row'>
        <StatusListCard
          title='Movimientos Recientes'
          items={displayedMovements}
          buttonLabel={showAllMovements ? 'Ver menos' : 'Ver todos los movimientos'}
          buttonVariant='secondary'
          buttonClassName='status-list-card__button--blue-border'
          onButtonClick={() => setShowAllMovements(!showAllMovements)}
        />
        <StatusListCard
          title='Productos Críticos'
          items={criticalProducts}
          buttonLabel='Gestionar stock critico'
          buttonVariant='warning'
          buttonClassName='status-list-card__button--text-primary'
          onButtonClick={() => setShowCriticalStockModal(true)}
        />
      </div>

      <CriticalStockModal
        isOpen={showCriticalStockModal}
        onClose={() => setShowCriticalStockModal(false)}
      />
    </div>
  );
};

export default Dashboard;
