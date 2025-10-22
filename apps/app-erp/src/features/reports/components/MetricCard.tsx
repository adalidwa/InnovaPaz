import React from 'react';
import './MetricCard.css';

interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: number; // porcentaje
  hint?: string;
  icon?: string; // emoji icon
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, trend, hint }) => {
  const trendColor =
    trend == null
      ? undefined
      : trend > 0
        ? 'var(--sec-700)'
        : trend < 0
          ? 'var(--acc-700)'
          : 'var(--pri-500)';
  return (
    <div className='report-metric-card'>
      <p className='report-metric-card__label'>{label}</p>
      <p className='report-metric-card__value'>{value}</p>
      <div className='report-metric-card__footer'>
        {trend != null && Math.abs(trend) > 0 && (
          <span className='report-metric-card__trend' style={{ color: trendColor }}>
            {trend > 0 ? '▲' : trend < 0 ? '▼' : '●'} {Math.abs(trend)}%
          </span>
        )}
        {hint && <span className='report-metric-card__hint'>{hint}</span>}
      </div>
    </div>
  );
};

export default MetricCard;
