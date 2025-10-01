import ProductsHeader from '../components/ProductsHeader';
import ProductosSearchBar from '../components/ProductosSearchBar';
import ProductsCardCrud from '../components/ProductsCardCrud';
import './ProductManagement.css';

function ProductManagement() {
  return (
    <div>
      <ProductsHeader
        title='Gestion de productos'
        subtitle='Administra el inventario de tu minimarket'
        buttonText='Agregar Producto'
        buttonVariant='primary'
        hasIcon={true}
        icon={<span className='icon-plus'>+</span>}
        iconPosition='left'
      />
      <ProductosSearchBar />
      <div className='products-container'>
        <ProductsCardCrud />
        <ProductsCardCrud />
        <ProductsCardCrud />
        <ProductsCardCrud />
        <ProductsCardCrud />
      </div>
    </div>
  );
}

export default ProductManagement;
