import React from 'react';
import '../../../assets/styles/theme.css';
import './ShoppingCard.css';
import StatusTag from '../../../components/common/StatusTag';
import TitleDescription from '../../../components/common/TitleDescription';
import Button from '../../../components/common/Button';

interface ShoppingCardProps {
  statusText: string;
  statusBgColor?: string;
  statusTextColor?: string;
  icon?: React.ReactNode;
  title: string;
  description: string;
  type: string;
  quantity: number | string;
  buttonText?: string;
  buttonVariant?: 'primary' | 'secondary' | 'warning' | 'success' | 'outline' | 'accent';
  onButtonClick?: () => void;
  titleSize?: number | string;
  descriptionSize?: number | string;
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  className?: string;
}

function ShoppingCard({
  statusText,
  statusBgColor = 'var(--pri-100)',
  statusTextColor = 'var(--pri-800)',
  icon,
  title,
  description,
  type,
  quantity,
  buttonText = 'View',
  buttonVariant = 'primary',
  onButtonClick,
  titleSize = 25,
  descriptionSize = 16,
  width = 340,
  height = 390,
  radius = 20,
  className = '',
}: ShoppingCardProps) {
  const toUnit = (v: number | string) => (typeof v === 'number' ? `${v}px` : v);

  const style = {
    ['--sc-width' as any]: toUnit(width),
    ['--sc-height' as any]: toUnit(height),
    ['--sc-radius' as any]: toUnit(radius),
  } as React.CSSProperties;

  return (
    <div className={`shopping-card ${className}`} style={style}>
      <div className='shopping-card-header'>
        <div className='shopping-card-icon'>{icon}</div>
        <div className='shopping-card-status'>
          <StatusTag
            text={statusText}
            backgroundColor={statusBgColor}
            textColor={statusTextColor}
          />
        </div>
      </div>
      <div className='shopping-card-body'>
        <TitleDescription
          title={title}
          description={description}
          titleSize={titleSize}
          descriptionSize={descriptionSize}
        />
        <div className='shopping-card-meta'>
          <div className='shopping-card-type'>{type}</div>
          <div className='shopping-card-quantity'>{quantity}</div>
        </div>
      </div>
      <div className='shopping-card-footer'>
        <Button onClick={onButtonClick} fullWidth variant={buttonVariant}>
          {buttonText}
        </Button>
      </div>
    </div>
  );
}

export default ShoppingCard;
