import React from 'react';
import SummaryCard from './SummaryCard';
import './SummaryCardsRow.css';

const SummaryCardsRow = () => {
  return (
    <div className='summary-cards-row'>
      <SummaryCard title='Inventario Total' value={1200} percentage='5%' isPositive={true} />
      <SummaryCard title='Productos Vendidos' value={340} percentage='2%' isPositive={true} />
      <SummaryCard title='Productos Devueltos' value={15} percentage='1%' isPositive={false} />
      <SummaryCard title='Stock Bajo' value={8} percentage='0.5%' isPositive={false} />
    </div>
  );
};

export default SummaryCardsRow;
