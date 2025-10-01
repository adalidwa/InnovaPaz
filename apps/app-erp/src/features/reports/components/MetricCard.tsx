import React from 'react';
import './MetricCard.css';

interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: number; // porcentaje
  hint?: string;
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
      {trend != null && (
        <span style={{ font: 'var(--font-10)', color: trendColor }}>
          {trend > 0 ? '▲' : trend < 0 ? '▼' : '●'} {Math.abs(trend)}%
        </span>
      )}
      {hint && <span style={{ font: 'var(--font-10)', color: 'var(--pri-500)' }}>{hint}</span>}
    </div>
  );
};

export default MetricCard;
