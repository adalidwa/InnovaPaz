import { useParams } from 'react-router-dom';
import { useProductsContext } from '../context/ProductsContext';
import PricingInfoComponent from '../components/PricingInfoComponent';
import ProductDetails from '../components/ProductDetails';
import ProductInfoCard from '../components/ProductInfoCard';
import RecentMovementsComponent from '../components/RecentMovementsComponent';
import StatsCardComponent from '../components/StatsCardComponent';
import StockComponent from '../components/StockComponent';
import './SeeInventories.css';

function SeeInventories() {
  const { id } = useParams<{ id: string }>();
  const { getProductById, products } = useProductsContext();

  // Si hay un ID, buscar el producto específico, sino usar el primero disponible
  const selectedProduct = id ? getProductById(id) : products[0];

  // Si no hay producto seleccionado, mostrar mensaje
  if (!selectedProduct) {
    return (
      <div className='no-product-selected'>
        <h2>Producto no encontrado</h2>
        <p>El producto que buscas no existe o no hay productos disponibles.</p>
      </div>
    );
  }

  return (
    <div>
      <ProductDetails product={selectedProduct} />
      <div className='info-stock-container'>
        <ProductInfoCard product={selectedProduct} />
        <StockComponent product={selectedProduct} />
      </div>
      <div className='secondary-info-container'>
        <RecentMovementsComponent product={selectedProduct} />
        <div className='side-cards-container'>
          <PricingInfoComponent product={selectedProduct} />
          <StatsCardComponent product={selectedProduct} />
        </div>
      </div>
    </div>
  );
}

export default SeeInventories;
