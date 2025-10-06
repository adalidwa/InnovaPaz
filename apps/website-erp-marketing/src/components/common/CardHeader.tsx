import React from 'react';
import './CardHeader.css';

interface CardHeaderProps {
  title: string;
  description?: string;
  comment?: string;
  price: string;
  priceComment?: string;
  icons?: React.ReactNode[];
}

const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  description,
  comment,
  price,
  priceComment,
  icons = [],
}) => {
  return (
    <div className='card-header'>
      <div className='card-header__icons'>{icons}</div>
      <h3 className='card-header__title'>{title}</h3>
      {description && <div className='card-header__description'>{description}</div>}
      {comment && <div className='card-header__comment'>{comment}</div>}
      <div className='pricing-card__price'>
        {price}
        {priceComment && <span className='pricing-card__price-comment'>{priceComment}</span>}
      </div>
    </div>
  );
};

export default CardHeader;
