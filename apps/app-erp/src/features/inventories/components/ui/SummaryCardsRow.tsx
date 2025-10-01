import React from 'react';
import SummaryCard from './SummaryCard';
import { FaCube, FaDollarSign, FaExclamationTriangle, FaExchangeAlt } from 'react-icons/fa';
import './SummaryCardsRow.css';

const SummaryCardsRow = () => {
  return (
    <div className='summary-cards-row'>
      <SummaryCard
        title='Total Productos'
        value={1200}
        percentage='5%'
        isPositive={true}
        icon={<FaCube />}
      />
      <SummaryCard
        title='Valor Inventario'
        value={340}
        percentage='2%'
        isPositive={true}
        icon={<FaDollarSign />}
      />
      <SummaryCard
        title='Productos Críticos'
        value={15}
        percentage='1%'
        isPositive={false}
        icon={<FaExclamationTriangle />}
      />
      <SummaryCard
        title='Movimientos Hoy'
        value={8}
        percentage='0.5%'
        isPositive={false}
        icon={<FaExchangeAlt />}
      />
    </div>
  );
};

export default SummaryCardsRow;
