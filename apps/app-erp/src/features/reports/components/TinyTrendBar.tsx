import React from 'react';
import { ResponsiveContainer, BarChart, Bar, Tooltip, CartesianGrid } from 'recharts';
import './TinyTrendBar.css';

export interface TinyTrendDatum {
  key: string;
  total: number;
}

interface TinyTrendBarProps {
  data: TinyTrendDatum[];
  height?: number;
  title?: string;
  currency?: boolean;
}

const TinyTrendBar: React.FC<TinyTrendBarProps> = ({ data, height = 170, title, currency }) => {
  return (
    <div className='tiny-trend-card' style={{ height }}>
      {title && <p className='tiny-trend-card__title'>{title}</p>}
      <ResponsiveContainer width='100%' height='100%'>
        <BarChart data={data} margin={{ top: 12, right: 4, left: 4, bottom: 4 }}>
          <defs>
            <linearGradient id='ttb-grad' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='0%' stopColor='var(--sec-600)' stopOpacity={0.95} />
              <stop offset='100%' stopColor='var(--sec-600)' stopOpacity={0.4} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray='3 3' stroke='var(--pri-100)' />
          <Tooltip
            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
            formatter={(v: any) => [currency ? 'Bs ' + Number(v).toLocaleString() : v, 'Total']}
            labelFormatter={(l: any) => l}
            wrapperClassName='tiny-trend-card__tooltip'
          />
          <Bar dataKey='total' fill='url(#ttb-grad)' radius={[4, 4, 3, 3]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TinyTrendBar;
