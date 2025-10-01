import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Rectangle,
} from 'recharts';
import './AdvancedBarChart.css';

interface AdvancedBarChartProps {
  data: { key: string; total: number }[];
  colorFrom?: string;
  colorTo?: string;
  height?: number;
}

const AdvancedBarChart: React.FC<AdvancedBarChartProps> = ({
  data,
  colorFrom = '#33c3bc',
  colorTo = '#2ca8a1',
  height = 260,
}) => {
  return (
    <div className='adv-bar-chart' style={{ height }}>
      <ResponsiveContainer width='100%' height='100%'>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
          <defs>
            <linearGradient id='barGradient' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='0%' stopColor={colorFrom} />
              <stop offset='100%' stopColor={colorTo} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray='3 3' stroke='var(--pri-100)' />
          <XAxis dataKey='key' tick={{ fontSize: 11 }} stroke='var(--pri-500)' />
          <YAxis tick={{ fontSize: 11 }} stroke='var(--pri-500)' />
          <Tooltip
            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
            formatter={(v: any) => [`Bs ${Number(v).toLocaleString()}`, 'Total']}
          />
          <Bar
            dataKey='total'
            fill='url(#barGradient)'
            radius={[4, 4, 0, 0]}
            activeBar={
              <Rectangle fill='url(#barGradient)' stroke='var(--pri-600)' strokeWidth={1} />
            }
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AdvancedBarChart;
