import React from 'react';
import './SectionCard.css';

interface SectionCardProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, description, children, footer }) => (
  <div className='report-section-card'>
    <div className='report-section-card__head'>
      <h3 className='report-section-card__title'>{title}</h3>
      {description && <p className='report-section-card__description'>{description}</p>}
    </div>
    {children && <div className='report-section-card__body'>{children}</div>}
    {footer && <div className='report-section-card__footer'>{footer}</div>}
  </div>
);

export default SectionCard;
