import { useState } from 'react';
import Button from '../../../components/common/Button';
import { useProductsContext } from '../context/ProductsContext';
import './FilterModal.css';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function FilterModal({ isOpen, onClose }: FilterModalProps) {
  const { filters, updateFilters, clearFilters, availableCategories, priceRange } =
    useProductsContext();

  const [localFilters, setLocalFilters] = useState(filters);
  const availablePriceRange = priceRange();

  if (!isOpen) return null;

  const statusOptions = [
    { value: 'normal', label: 'Normal', color: 'var(--sec-600)' },
    { value: 'bajo', label: 'Stock Bajo', color: 'var(--warning-600)' },
    { value: 'critico', label: 'Stock Crítico', color: 'var(--error-600)' },
    { value: 'agotado', label: 'Agotado', color: 'var(--error-800)' },
  ] as const;

  const handleCategoryChange = (category: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const handleStatusChange = (status: 'normal' | 'bajo' | 'critico' | 'agotado') => {
    setLocalFilters((prev) => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter((s) => s !== status)
        : [...prev.statuses, status],
    }));
  };

  const handlePriceRangeChange = (field: 'min' | 'max', value: number) => {
    setLocalFilters((prev) => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        [field]: value,
      },
    }));
  };

  const handleApplyFilters = () => {
    updateFilters(localFilters);
    onClose();
  };

  const handleClearFilters = () => {
    const clearedFilters = { categories: [], statuses: [], priceRange: { min: 0, max: 1000 } };
    setLocalFilters(clearedFilters);
    clearFilters();
    onClose();
  };

  const hasActiveFilters =
    localFilters.categories.length > 0 ||
    localFilters.statuses.length > 0 ||
    localFilters.priceRange.min > 0 ||
    localFilters.priceRange.max < 1000;

  return (
    <div className='filter-modal-overlay' onClick={onClose}>
      <div className='filter-modal-container' onClick={(e) => e.stopPropagation()}>
        <div className='filter-modal-header'>
          <h3 className='filter-modal-title'>Filtrar Productos</h3>
          <button className='filter-modal-close' onClick={onClose}>
            ×
          </button>
        </div>

        <div className='filter-modal-body'>
          {/* Filtro por Categorías */}
          <div className='filter-section'>
            <h4 className='filter-section-title'>Categorías</h4>
            <div className='filter-options'>
              {availableCategories().map((category) => (
                <label key={category} className='filter-checkbox'>
                  <input
                    type='checkbox'
                    checked={localFilters.categories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                  />
                  <span className='checkmark'></span>
                  {category}
                </label>
              ))}
            </div>
          </div>

          {/* Filtro por Estado de Stock */}
          <div className='filter-section'>
            <h4 className='filter-section-title'>Estado de Stock</h4>
            <div className='filter-options'>
              {statusOptions.map((status) => (
                <label key={status.value} className='filter-checkbox'>
                  <input
                    type='checkbox'
                    checked={localFilters.statuses.includes(status.value)}
                    onChange={() => handleStatusChange(status.value)}
                  />
                  <span className='checkmark'></span>
                  <span
                    className='status-indicator'
                    style={{ backgroundColor: status.color }}
                  ></span>
                  {status.label}
                </label>
              ))}
            </div>
          </div>

          {/* Filtro por Rango de Precios */}
          <div className='filter-section'>
            <h4 className='filter-section-title'>Rango de Precios (Bs.)</h4>
            <div className='price-range-inputs'>
              <div className='price-input-group'>
                <label>Desde:</label>
                <input
                  type='number'
                  min={availablePriceRange.min}
                  max={availablePriceRange.max}
                  value={localFilters.priceRange.min}
                  onChange={(e) => handlePriceRangeChange('min', Number(e.target.value))}
                  className='price-input'
                />
              </div>
              <div className='price-input-group'>
                <label>Hasta:</label>
                <input
                  type='number'
                  min={availablePriceRange.min}
                  max={availablePriceRange.max}
                  value={localFilters.priceRange.max}
                  onChange={(e) => handlePriceRangeChange('max', Number(e.target.value))}
                  className='price-input'
                />
              </div>
            </div>
            <div className='price-range-info'>
              Rango disponible: Bs. {availablePriceRange.min} - Bs. {availablePriceRange.max}
            </div>
          </div>
        </div>

        <div className='filter-modal-footer'>
          <Button
            variant='secondary'
            size='medium'
            onClick={handleClearFilters}
            disabled={!hasActiveFilters}
          >
            Limpiar Filtros
          </Button>
          <Button variant='primary' size='medium' onClick={handleApplyFilters}>
            Aplicar Filtros
          </Button>
        </div>
      </div>
    </div>
  );
}

export default FilterModal;
