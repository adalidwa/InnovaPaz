import './ProductsHeader.css';
import Button from '../../../components/common/Button';

function ProductsHeader() {
  return (
    <div className='products-header'>
      <div>
        <h1>Gestion de productos</h1>
        <p>Administra el inventario de tu minimarket</p>
      </div>
      <div>
        <Button variant='primary' icon={<span className='icon-plus'>+</span>} iconPosition='left'>
          Agregar Producto
        </Button>
      </div>
    </div>
  );
}

export default ProductsHeader;
