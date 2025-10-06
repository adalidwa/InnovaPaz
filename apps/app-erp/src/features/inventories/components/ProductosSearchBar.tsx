import { useState, useEffect } from 'react';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { BiSearch, BiFilter } from 'react-icons/bi';
import { useProductsContext } from '../context/ProductsContext';
import './ProductosSearchBar.css';

function ProductosSearchBar() {
  const { searchTerm, updateSearchTerm } = useProductsContext();
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

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

  return (
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
      <Button variant='primary' className='filter-button'>
        <BiFilter size={16} />
        Filtros
      </Button>
    </div>
  );
}

export default ProductosSearchBar;
