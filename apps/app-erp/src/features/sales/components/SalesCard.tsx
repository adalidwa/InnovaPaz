import React from 'react';
import { StatusTag } from '../../../components/common';
import { type SalesModule } from '../hooks/hooks';
import './SalesCard.css';

interface SalesCardProps {
  module: SalesModule;
  quantity: number;
  status: 'Normal' | 'Revisar';
  onClick?: () => void;
}

export const SalesCard: React.FC<SalesCardProps> = ({ module, quantity, status, onClick }) => {
  const handleClick = () => {
    if (onClick && module.isActive) {
      onClick();
    }
  };

  const getStatusStyle = (status: string) => {
    return status === 'Normal'
      ? { bg: 'var(--sec-100)', text: 'var(--sec-800)' }
      : { bg: 'var(--warning-100)', text: 'var(--warning-800)' };
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: '#ff4757',
      medium: '#ffa502',
      low: '#2ed573',
    };
    return colors[priority as keyof typeof colors] || colors.low;
  };

  const getIconDisplay = (icon: string) => {
    const iconMap: Record<string, string> = {
      card: '💳',
      people: '👥',
      'document-text': '📄',
      calculator: '🧮',
      cube: '📦',
      time: '🕐',
      'bar-chart': '📊',
    };
    return iconMap[icon] || '📋';
  };

  const statusStyle = getStatusStyle(status);

  return (
    <div
      className={`sales-card ${module.isActive ? 'active' : 'inactive'} ${
        module.isActive ? 'clickable' : ''
      }`}
      onClick={handleClick}
    >
      <div className='sales-card-header'>
        <div className='sales-card-icon'>{getIconDisplay(module.icon)}</div>
        <div className='sales-card-info'>
          <h3 className='sales-card-title'>{module.title}</h3>
          <p className='sales-card-description'>{module.description}</p>
        </div>
        <div className='sales-card-status'>
          <StatusTag text={status} backgroundColor={statusStyle.bg} textColor={statusStyle.text} />
        </div>
      </div>

      <div className='sales-card-body'>
        <div className='sales-card-stats'>
          <div className='stat'>
            <span className='stat-label'>Registros:</span>
            <span className='stat-value'>{quantity}</span>
          </div>
          <div className='stat'>
            <span className='stat-label'>Tipo:</span>
            <span className='stat-value'>{module.type}</span>
          </div>
        </div>

        <div className='sales-card-meta'>
          <div className='priority-indicator'>
            <span
              className='priority-dot'
              style={{ backgroundColor: getPriorityColor(module.priority) }}
            ></span>
            <span className='priority-label'>
              Prioridad {module.priority === 'high' && 'Alta'}
              {module.priority === 'medium' && 'Media'}
              {module.priority === 'low' && 'Baja'}
            </span>
          </div>

          {!module.isActive && <div className='inactive-badge'>Próximamente</div>}
        </div>
      </div>

      {module.isActive && (
        <div className='sales-card-footer'>
          <button className='access-button'>Acceder</button>
        </div>
      )}
    </div>
  );
};
