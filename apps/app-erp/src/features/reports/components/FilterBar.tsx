import React from 'react';
import './FilterBar.css';

export interface ReportFilters {
  search: string;
  from: string;
  to: string;
  groupBy: 'dia' | 'semana' | 'mes';
}

interface FilterBarProps {
  value: ReportFilters;
  onChange: (next: ReportFilters) => void;
  placeholderSearch?: string;
}

const FilterBar: React.FC<FilterBarProps> = ({ value, onChange, placeholderSearch }) => {
  const update = (partial: Partial<ReportFilters>) => onChange({ ...value, ...partial });

  return (
    <div className='report-filter-bar'>
      <div className='report-filter-bar__row'>
        <label>Buscar</label>
        <input
          className='report-filter-input'
          type='text'
          value={value.search}
          placeholder={placeholderSearch || 'Buscar...'}
          onChange={(e) => update({ search: e.target.value })}
        />
        <label>Desde</label>
        <input
          className='report-filter-input'
          type='date'
          value={value.from}
          onChange={(e) => update({ from: e.target.value })}
        />
        <label>Hasta</label>
        <input
          className='report-filter-input'
          type='date'
          value={value.to}
          onChange={(e) => update({ to: e.target.value })}
        />
        <label>Agrupar</label>
        <select
          className='report-filter-select'
          value={value.groupBy}
          onChange={(e) => update({ groupBy: e.target.value as ReportFilters['groupBy'] })}
        >
          <option value='dia'>Día</option>
          <option value='semana'>Semana</option>
          <option value='mes'>Mes</option>
        </select>
      </div>
    </div>
  );
};

export default FilterBar;
