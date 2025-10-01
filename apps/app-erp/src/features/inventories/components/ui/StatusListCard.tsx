import React from 'react';
import './StatusListCard.css';
import { FaEye } from 'react-icons/fa';
import Button from '../../../../components/common/Button';

interface StatusListItem {
  id: string | number;
  title: string;
  subtitle?: string;
  time?: string;
  tag?: {
    label: string;
    type: 'entrada' | 'salida' | 'critico' | 'bajo';
  };
  value?: string | number;
  hasIcon?: boolean;
}

interface StatusListCardProps {
  title: string;
  icon?: React.ReactNode;
  items: StatusListItem[];
  buttonLabel?: string;
  onButtonClick?: () => void;
  buttonVariant?: string;
  buttonClassName?: string;
}

const StatusListCard: React.FC<StatusListCardProps> = ({
  title,
  icon,
  items,
  buttonLabel,
  onButtonClick,
  buttonVariant = 'warning',
  buttonClassName,
}) => {
  return (
    <div className='status-list-card'>
      <div className='status-list-card__header'>
        {icon && <span className='status-list-card__icon'>{icon}</span>}
        <h3 className='status-list-card__title'>{title}</h3>
      </div>

      <div className='status-list-card__items'>
        {items.map((item) => (
          <div className='status-list-card__item' key={item.id}>
            <div className='status-list-card__info'>
              <p className='status-list-card__item-title'>{item.title}</p>
              {item.time && <p className='status-list-card__item-time'>{item.time}</p>}
              {item.subtitle && <p className='status-list-card__item-subtitle'>{item.subtitle}</p>}
            </div>

            <div className='status-list-card__right'>
              {item.tag && (
                <span className={`status-list-card__tag status-list-card__tag--${item.tag.type}`}>
                  {item.tag.label}
                </span>
              )}

              {item.value && <span className='status-list-card__value'>{item.value}</span>}

              {item.hasIcon && (
                <button className='status-list-card__action'>
                  <FaEye />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {buttonLabel && (
        <Button variant={buttonVariant} className={buttonClassName} onClick={onButtonClick}>
          {buttonLabel}
        </Button>
      )}
    </div>
  );
};

export default StatusListCard;
