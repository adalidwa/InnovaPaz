import React from 'react';
import './MiniBarChart.css';

interface MiniBarChartProps {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
}

const MiniBarChart: React.FC<MiniBarChartProps> = ({ data, height = 140, color = '#3182ce' }) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className='mini-bar-chart' style={{ minHeight: height }}>
      {data.map((d) => {
        const h = (d.value / max) * (height - 20);
        return (
          <div key={d.label} className='mini-bar-chart__bar-wrapper'>
            <div
              className='mini-bar-chart__bar'
              style={{ height: h, background: color }}
              title={d.value.toString()}
            />
            <div className='mini-bar-chart__label'>{d.label}</div>
          </div>
        );
      })}
    </div>
  );
};

export default MiniBarChart;
