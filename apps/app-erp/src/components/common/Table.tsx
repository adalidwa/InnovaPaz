import React from 'react';
import './Table.css';

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  className?: string;
  width?: string;
}

export interface TableAction<T> {
  label: string;
  onClick: (row: T, index: number) => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  className?: string;
  show?: (row: T) => boolean;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  title?: string;
  className?: string;
  rowClassName?: (row: T, index: number) => string;
  emptyMessage?: string;
  loading?: boolean;
}

function Table<T extends Record<string, any>>({
  data,
  columns,
  actions,
  title,
  className = '',
  rowClassName,
  emptyMessage = 'No hay datos disponibles',
  loading = false,
}: TableProps<T>) {
  const renderCellContent = (column: TableColumn<T>, row: T, index: number) => {
    if (column.render) {
      return column.render(row[column.key as keyof T], row, index);
    }
    return row[column.key as keyof T];
  };

  const getRowClassName = (row: T, index: number) => {
    let baseClass = 'table-row';
    if (rowClassName) {
      baseClass += ` ${rowClassName(row, index)}`;
    }
    return baseClass;
  };

  if (loading) {
    return (
      <div className={`table-container ${className}`}>
        {title && <h2 className='table-title'>{title}</h2>}
        <div className='table-loading'>Cargando...</div>
      </div>
    );
  }

  return (
    <div className={`table-container ${className}`}>
      {title && <h2 className='table-title'>{title}</h2>}

      <div className='table-wrapper'>
        <table className='table'>
          <thead className='table-header'>
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`table-header-cell ${column.className || ''}`}
                  style={{ width: column.width }}
                >
                  {column.header}
                </th>
              ))}
              {actions && actions.length > 0 && (
                <th className='table-header-cell table-actions-header'>Acciones</th>
              )}
            </tr>
          </thead>

          <tbody className='table-body'>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className='table-empty'>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className={getRowClassName(row, rowIndex)}>
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className={`table-cell ${column.className || ''}`}>
                      {renderCellContent(column, row, rowIndex)}
                    </td>
                  ))}

                  {actions && actions.length > 0 && (
                    <td className='table-cell table-actions'>
                      {actions
                        .filter((action) => !action.show || action.show(row))
                        .map((action, actionIndex) => (
                          <button
                            key={actionIndex}
                            className={`table-action-btn table-action-${action.variant || 'primary'} ${action.className || ''}`}
                            onClick={() => action.onClick(row, rowIndex)}
                          >
                            {action.label}
                          </button>
                        ))}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Table;
