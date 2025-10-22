/**
 * 📊 COMPONENTE DE BOTONES DE EXPORTACIÓN
 * Botones reutilizables para exportar reportes en PDF y Excel
 */

import React from 'react';
import './ExportButtons.css';

export interface ExportButtonsProps {
  onExportPDF: () => Promise<void>;
  onExportExcel: () => Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'outlined';
  showLabels?: boolean;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({
  onExportPDF,
  onExportExcel,
  loading = false,
  disabled = false,
  className = '',
  size = 'md',
  variant = 'default',
  showLabels = true,
}) => {
  const handlePDFExport = async () => {
    try {
      await onExportPDF();
    } catch (error) {
      console.error('Error al exportar PDF:', error);
    }
  };

  const handleExcelExport = async () => {
    try {
      await onExportExcel();
    } catch (error) {
      console.error('Error al exportar Excel:', error);
    }
  };

  const baseClasses = `export-buttons export-buttons--${size} export-buttons--${variant}`;
  const containerClasses = `${baseClasses} ${className}`;

  return (
    <div className={containerClasses}>
      {/* Botón PDF */}
      <button
        type='button'
        className='export-buttons__btn export-buttons__btn--pdf'
        onClick={handlePDFExport}
        disabled={disabled || loading}
        title='Exportar a PDF'
      >
        {loading ? (
          <span className='export-buttons__spinner'>⟳</span>
        ) : (
          <span className='export-buttons__icon'>📄</span>
        )}
        {showLabels && <span>PDF</span>}
      </button>

      {/* Botón Excel */}
      <button
        type='button'
        className='export-buttons__btn export-buttons__btn--excel'
        onClick={handleExcelExport}
        disabled={disabled || loading}
        title='Exportar a Excel'
      >
        {loading ? (
          <span className='export-buttons__spinner'>⟳</span>
        ) : (
          <span className='export-buttons__icon'>📊</span>
        )}
        {showLabels && <span>Excel</span>}
      </button>
    </div>
  );
};

export default ExportButtons;
