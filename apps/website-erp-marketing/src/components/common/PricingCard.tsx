import React from 'react';
import './PricingCard.css';
import Button from './Button';
import CardHeader from './CardHeader';
import FeatureList from './FeatureList';

interface PricingCardProps {
  title: string;
  price: string;
  description?: string;
  comment?: string;
  features: string[];
  highlight?: boolean;
  buttonText: string;
  icons?: React.ReactNode[];
  onButtonClick?: () => void;
  priceComment?: string;
  isPopular?: boolean;
  badgeText?: string;
}

const PricingCard: React.FC<PricingCardProps> = ({
  title,
  price,
  description,
  comment,
  features,
  highlight = false,
  buttonText,
  icons = [],
  onButtonClick,
  priceComment,
  isPopular = false,
  badgeText,
}) => {
  return (
    <div
      className={`pricing-card ${highlight ? 'pricing-card--highlight' : ''} ${isPopular ? 'pricing-card--popular' : ''}`}
    >
      {badgeText && <div className='pricing-card__badge'>{badgeText}</div>}
      <CardHeader
        title={title}
        description={description}
        comment={comment}
        price={price}
        priceComment={priceComment}
        icons={icons}
      />

      <FeatureList features={features} />

      <div className='pricing-card__button'>
        <Button
          title={buttonText}
          size='medium'
          backgroundColor='var(--acc-500)'
          textColor='white'
          className='custom-button--pricingcard'
          onClick={onButtonClick}
        />
      </div>
    </div>
  );
};

export default PricingCard;
