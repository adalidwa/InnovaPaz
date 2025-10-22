import React, { type ReactNode } from 'react';
import './StatsCard.css';

export interface StatItem {
  icon: ReactNode;
  label: string;
  value: string | number;
  iconColor?: 'success' | 'danger' | 'warning' | 'info' | 'primary';
}

interface StatsCardProps {
  title: string;
  titleIcon: ReactNode;
  items: StatItem[];
}

const StatsCard: React.FC<StatsCardProps> = ({ title, titleIcon, items }) => {
  return (
    <div className='stats-card'>
      <div className='stats-card__header'>
        <h3 className='stats-card__title'>
          <span className='stats-card__title-icon'>{titleIcon}</span>
          {title}
        </h3>
      </div>
      <ul className='stats-card__list'>
        {items.map((item, index) => (
          <li key={index} className='stats-card__item'>
            <span
              className={`stats-card__icon ${item.iconColor ? `stats-card__icon--${item.iconColor}` : ''}`}
            >
              {item.icon}
            </span>
            <span className='stats-card__label'>{item.label}</span>
            <span className='stats-card__value'>{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StatsCard;
