import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';
import './TopProductsChart.css';

export interface TopProductDatum {
  label: string;
  value: number;
}

interface TopProductsChartProps {
  data: TopProductDatum[];
  height?: number;
}

const palette = [
  '#2ca8a1',
  '#33c3bc',
  '#4ad0c9',
  '#66d7d1',
  '#8d89ad',
  '#403d58',
  '#fb5a2e',
  '#b72903',
];

const TopProductsChart: React.FC<TopProductsChartProps> = ({ data, height = 240 }) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  const enriched = data.map((d, i) => ({ ...d, percentage: (d.value / max) * 100, rank: i + 1 }));

  return (
    <div className='top-products-chart' style={{ height }}>
      <ResponsiveContainer width='100%' height='100%'>
        <BarChart data={enriched} margin={{ top: 10, left: 0, right: 10, bottom: 8 }}>
          <defs>
            {enriched.map((d, i) => (
              <linearGradient key={d.label} id={`tp-grad-${i}`} x1='0' y1='0' x2='0' y2='1'>
                <stop offset='0%' stopColor={palette[i % palette.length]} stopOpacity={0.95} />
                <stop offset='100%' stopColor={palette[i % palette.length]} stopOpacity={0.6} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray='3 3' stroke='var(--pri-100)' />
          <XAxis
            dataKey='label'
            tick={{ fontSize: 11 }}
            stroke='var(--pri-500)'
            interval={0}
            angle={-25}
            dy={10}
            textAnchor='end'
            height={50}
          />
          <YAxis tick={{ fontSize: 11 }} stroke='var(--pri-500)' />
          <Tooltip
            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
            formatter={(v: any, _n: any, p: any) => [
              `Bs ${Number(v).toLocaleString()}`,
              p?.payload?.label || 'Total',
            ]}
            labelFormatter={() => ''}
            wrapperClassName='top-products-chart__tooltip'
          />
          <Bar dataKey='value' radius={[5, 5, 4, 4]}>
            {enriched.map((entry, index) => (
              <Cell key={entry.label} fill={`url(#tp-grad-${index})`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <ul className='top-products-chart__legend'>
        {enriched.slice(0, 6).map((d, i) => (
          <li key={d.label} className='top-products-chart__legend-item'>
            <span
              className='top-products-chart__swatch'
              style={{ background: palette[i % palette.length] }}
            />
            <span className='top-products-chart__legend-text'>
              #{d.rank} {d.label}
            </span>
            <span className='top-products-chart__legend-val'>Bs {d.value.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TopProductsChart;
