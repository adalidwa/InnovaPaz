import { useState, useEffect } from 'react';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { BiSearch, BiFilter } from 'react-icons/bi';
import { useProductsContext } from '../context/ProductsContext';
import FilterModal from './FilterModal';
import './ProductosSearchBar.css';

function ProductosSearchBar() {
  const { searchTerm, updateSearchTerm, filters } = useProductsContext();
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Debounce para evitar búsquedas excesivas
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateSearchTerm(localSearchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [localSearchTerm, updateSearchTerm]);

  // Sincronizar con el estado global si cambia externamente
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setLocalSearchTerm('');
    updateSearchTerm('');
  };

  const handleOpenFilterModal = () => {
    setIsFilterModalOpen(true);
  };

  const handleCloseFilterModal = () => {
    setIsFilterModalOpen(false);
  };

  // Verificar si hay filtros activos para mostrar un indicador
  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.statuses.length > 0 ||
    filters.priceRange.min > 0 ||
    filters.priceRange.max < 1000;

  return (
    <>
      <div className='productos-search-bar'>
        <div className='search-input-container'>
          <Input
            type='text'
            placeholder='Buscar productos por nombre, código o categoría...'
            className='search-input'
            leftIcon={<BiSearch size={20} />}
            value={localSearchTerm}
            onChange={handleSearchChange}
          />
          {localSearchTerm && (
            <button
              type='button'
              className='clear-search-button'
              onClick={handleClearSearch}
              aria-label='Limpiar búsqueda'
            >
              ×
            </button>
          )}
        </div>
        <Button
          variant='primary'
          className={`filter-button ${hasActiveFilters ? 'has-filters' : ''}`}
          onClick={handleOpenFilterModal}
        >
          <BiFilter size={16} />
          Filtros
          {hasActiveFilters && <span className='filter-badge'>•</span>}
        </Button>
      </div>

      <FilterModal isOpen={isFilterModalOpen} onClose={handleCloseFilterModal} />
    </>
  );
}

export default ProductosSearchBar;
