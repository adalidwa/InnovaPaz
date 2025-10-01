import ProductsHeader from '../components/ProductsHeader';
import ProductosSearchBar from '../components/ProductosSearchBar';
import ProductsCardCrud from '../components/ProductsCardCrud';
import './ProductManagement.css';

function ProductManagement() {
  return (
    <div>
      <ProductsHeader />
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
