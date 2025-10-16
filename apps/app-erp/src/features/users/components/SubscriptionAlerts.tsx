import React from 'react';
import { FiAlertTriangle, FiInfo, FiX, FiExternalLink } from 'react-icons/fi';
import { useSubscriptionAlerts } from '../hooks/useSubscriptionAlerts';
import './SubscriptionAlerts.css';

const SubscriptionAlerts: React.FC = () => {
  const { alerts, loading, dismissAlert } = useSubscriptionAlerts();

  if (loading || alerts.length === 0) {
    return null;
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <FiAlertTriangle className='alert-icon warning' />;
      case 'error':
        return <FiAlertTriangle className='alert-icon error' />;
      case 'info':
      default:
        return <FiInfo className='alert-icon info' />;
    }
  };

  return (
    <div className='subscription-alerts'>
      {alerts.map((alert, index) => (
        <div key={index} className={`alert alert--${alert.type}`}>
          <div className='alert-content'>
            <div className='alert-header'>
              {getIcon(alert.type)}
              <h4 className='alert-title'>{alert.title}</h4>
              <button
                className='alert-dismiss'
                onClick={() => dismissAlert(index)}
                aria-label='Cerrar alerta'
              >
                <FiX size={16} />
              </button>
            </div>
            <p className='alert-message'>{alert.message}</p>
            {alert.actionText && alert.actionUrl && (
              <a
                href={alert.actionUrl}
                className='alert-action'
                onClick={(e) => {
                  e.preventDefault();
                  window.location.hash = alert.actionUrl!.replace('/', '#');
                }}
              >
                {alert.actionText}
                <FiExternalLink size={14} />
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SubscriptionAlerts;
