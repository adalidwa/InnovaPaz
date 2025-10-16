import { useState, useEffect } from 'react';
import ProductCard, { type Product } from './ProductCard';
import SalesService from '../services/salesService';
import './ProductList.css';

interface ProductListProps {
  products?: Product[];
  onAddToCart: (product: Product, quantity: number) => void;
  searchTerm?: string;
}

function ProductList({ products, onAddToCart, searchTerm = '' }: ProductListProps) {
  const [loadedProducts, setLoadedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!products) {
      loadProducts();
    }
  }, [products]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await SalesService.getAvailableProducts();
      setLoadedProducts(data);
    } catch (err: any) {
      console.error('Error al cargar productos:', err);
      setError('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const currentProducts = products || loadedProducts;

  const filteredProducts = currentProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className='product-list__empty'>
        <p className='product-list__empty-text'>Cargando productos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='product-list__empty'>
        <p className='product-list__empty-text' style={{ color: 'var(--danger)' }}>
          {error}
        </p>
      </div>
    );
  }

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
