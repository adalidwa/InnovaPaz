import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { BiSearch, BiFilter } from 'react-icons/bi';
import './ProductosSearchBar.css';

function ProductosSearchBar() {
  return (
    <div className='productos-search-bar'>
      <div className='search-input-container'>
        <Input
          type='text'
          placeholder='Buscar productos por nombre, código o categoría...'
          className='search-input'
          leftIcon={<BiSearch size={20} />}
        />
      </div>
      <Button variant='primary' className='filter-button'>
        <BiFilter size={16} />
        Filtros
      </Button>
    </div>
  );
}

export default ProductosSearchBar;
