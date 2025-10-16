import ProductCard, { type Product } from './ProductCard';
import './ProductList.css';

interface ProductListProps {
  products?: Product[];
  onAddToCart: (product: Product, quantity: number) => void;
  searchTerm?: string;
}

// Mock products data
const mockProducts: Product[] = [
  {
    id: '1',
    code: 'COC500',
    name: 'Coca Cola 500ml',
    price: 3.5,
    stock: 48,
  },
  {
    id: '2',
    code: 'ARR1KG',
    name: 'Arroz Paisana 1kg',
    price: 12.0,
    stock: 15,
  },
  {
    id: '3',
    code: 'PAC355',
    name: 'Cerveza Paceña 355ml',
    price: 8.5,
    stock: 72,
  },
];

function ProductList({ products = mockProducts, onAddToCart, searchTerm = '' }: ProductListProps) {
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filteredProducts.length === 0) {
    return (
      <div className='product-list__empty'>
        <div className='product-list__empty-icon'>
          <svg width='64' height='64' viewBox='0 0 24 24' fill='currentColor'>
            <path d='M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2M12 6.5L11.5 8.5L9.5 9L11.5 9.5L12 11.5L12.5 9.5L14.5 9L12.5 8.5L12 6.5Z' />
          </svg>
        </div>
        <p className='product-list__empty-text'>No se encontraron productos</p>
        {searchTerm && (
          <p className='product-list__empty-suggestion'>Intenta con otro término de búsqueda</p>
        )}
      </div>
    );
  }

  return (
    <div className='product-list'>
      {filteredProducts.map((product) => (
        <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
      ))}
    </div>
  );
}

export default ProductList;
export type { Product };
