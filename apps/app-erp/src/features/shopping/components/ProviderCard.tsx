import React from 'react';
import '../../../assets/styles/theme.css';
import './ProviderCard.css';
import TitleDescription from '../../../components/common/TitleDescription';
import Button from '../../../components/common/Button';

interface ProviderCardProps {
  title: string;
  description: string;
  nit: string;
  contact: string;
  phone: string;
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

function ProviderCard({
  title,
  description,
  nit,
  contact,
  phone,
  buttonText = 'Ver historial',
  buttonVariant = 'primary',
  onButtonClick,
  titleSize = 25,
  descriptionSize = 16,
  width = 340,
  height = 320,
  radius = 20,
  className = '',
}: ProviderCardProps) {
  const toUnit = (v: number | string) => (typeof v === 'number' ? `${v}px` : v);

  const style = {
    ['--pc-width' as any]: toUnit(width),
    ['--pc-height' as any]: toUnit(height),
    ['--pc-radius' as any]: toUnit(radius),
  } as React.CSSProperties;

  return (
    <div className={`provider-card ${className}`} style={style}>
      <div className='provider-card-body'>
        <TitleDescription
          title={title}
          description={description}
          titleSize={titleSize}
          descriptionSize={descriptionSize}
        />
        <div className='provider-card-info'>
          <div className='provider-info-item'>
            <span className='provider-info-label'>NIT:</span>
            <span className='provider-info-value'>{nit}</span>
          </div>
          <div className='provider-info-item'>
            <span className='provider-info-label'>Contacto:</span>
            <span className='provider-info-value'>{contact}</span>
          </div>
          <div className='provider-info-item'>
            <span className='provider-info-label'>Teléfono:</span>
            <span className='provider-info-value'>{phone}</span>
          </div>
        </div>
      </div>
      <div className='provider-card-footer'>
        <Button onClick={onButtonClick} fullWidth variant={buttonVariant}>
          {buttonText}
        </Button>
      </div>
    </div>
  );
}

export default ProviderCard;
