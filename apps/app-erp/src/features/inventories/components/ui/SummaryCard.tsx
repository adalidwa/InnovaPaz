import React from 'react';
import './SummaryCard.css';
import { FaCube } from 'react-icons/fa';

interface SummaryCardProps {
  title: string;
  value: number | string;
  percentage: string;
  isPositive?: boolean;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  percentage,
  isPositive = true,
}) => {
  return (
    <div className='summary-card'>
      <div className='summary-card__content'>
        <p className='summary-card__title'>{title}</p>
        <h2 className='summary-card__value'>{value}</h2>
        <p
          className={`summary-card__percentage ${
            isPositive ? 'summary-card__percentage--positive' : 'summary-card__percentage--negative'
          }`}
        >
          {isPositive ? '↑' : '↓'} {percentage}
        </p>
      </div>
      <div className='summary-card__icon'>
        <FaCube />
      </div>
    </div>
  );
};

export default SummaryCard;
