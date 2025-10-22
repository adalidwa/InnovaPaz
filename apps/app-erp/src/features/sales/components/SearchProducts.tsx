import { useState } from 'react';
import { BiSearch } from 'react-icons/bi';
import Input from '../../../components/common/Input';
import './SearchProducts.css';

interface SearchProductsProps {
  onSearch?: (searchTerm: string) => void;
  placeholder?: string;
  className?: string;
}

function SearchProducts({
  onSearch,
  placeholder = 'Buscar por código o nombre...',
  className = '',
}: SearchProductsProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Llamar a onSearch si está definido
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  return (
    <section className={`search-products ${className}`}>
      <div className='search-products__header'>
        <h1 className='search-products__title'>
          <BiSearch className='search-products__title-icon' />
          Buscar Productos
        </h1>
      </div>

      <form className='search-products__form' onSubmit={handleSearchSubmit}>
        <Input
          type='text'
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder={placeholder}
          leftIcon={<BiSearch size={20} />}
          className='search-products__input'
          aria-label='Buscar productos por código o nombre'
        />
      </form>
    </section>
  );
}

export default SearchProducts;
