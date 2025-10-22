interface Column<T> {
  key: keyof T;
  label: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

interface SimpleTableProps<T extends Record<string, any>> {
  columns: Column<T>[];
  data: T[];
  caption?: string;
  dense?: boolean;
  pageSize?: number;
}

import React, { useMemo, useState } from 'react';
import './SimpleTable.css';

function SimpleTable<T extends Record<string, any>>({
  columns,
  data,
  caption,
  dense,
  pageSize = 10,
}: SimpleTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null) return 1;
      if (bv == null) return -1;
      if (av === bv) return 0;
      return (av > bv ? 1 : -1) * (sortDir === 'asc' ? 1 : -1);
    });
  }, [data, sortKey, sortDir]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));

  const toggleSort = (key: keyof T, sortable?: boolean) => {
    if (!sortable) return;
    setPage(1);
    setSortKey((prev) => {
      if (prev !== key) {
        setSortDir('asc');
        return key;
      }
      setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'));
      return key;
    });
  };

  return (
    <div className='rtable-wrapper'>
      <table className={`rtable ${dense ? 'rtable--dense' : ''}`}>
        {caption && <caption className='rtable__caption'>{caption}</caption>}
        <thead className='rtable__head'>
          <tr>
            {columns.map((c) => {
              const active = sortKey === c.key;
              return (
                <th
                  key={String(c.key)}
                  onClick={() => toggleSort(c.key, c.sortable)}
                  className={`rtable__th ${c.sortable ? 'rtable__th--sortable' : ''} ${active ? 'rtable__th--active' : ''}`}
                >
                  <span>{c.label}</span>
                  {c.sortable && active && (
                    <span className='rtable__sort-indicator'>{sortDir === 'asc' ? '▲' : '▼'}</span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className='rtable__body'>
          {paginated.map((row, i) => (
            <tr key={i} className='rtable__tr'>
              {columns.map((col) => (
                <td key={String(col.key)} className='rtable__td'>
                  {col.render ? col.render(row) : String(row[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
          {!paginated.length && (
            <tr className='rtable__tr-empty'>
              <td colSpan={columns.length} className='rtable__td-empty'>
                Sin datos
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {pages > 1 && (
        <div className='rtable__pagination'>
          <button
            className='rtable__page-btn'
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <span className='rtable__page-info'>
            Página {page} / {pages}
          </span>
          <button
            className='rtable__page-btn'
            disabled={page === pages}
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default SimpleTable;
