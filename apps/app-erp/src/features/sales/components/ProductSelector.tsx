import { useState, useEffect, useRef } from 'react';
import { IoCartOutline, IoAddCircleOutline, IoSearchOutline } from 'react-icons/io5';
import { FiPackage } from 'react-icons/fi';
import Input from '../../../components/common/Input';
import SalesService from '../services/salesService';
import './ProductSelector.css';

export interface Product {
  id: number;
  name: string;
  code: string;
  price: number;
  stock: number;
}

interface ProductSelectorProps {
  onSelectProduct: (product: Product) => void;
}

function ProductSelector({ onSelectProduct }: ProductSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Cargar todos los productos al montar
  useEffect(() => {
    loadAllProducts();
  }, []);

  // Manejar click fuera del dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Buscar cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm.length > 0) {
      searchProducts();
    } else {
      setProducts(allProducts.slice(0, 10));
    }
  }, [searchTerm, allProducts]);

  const loadAllProducts = async () => {
    try {
      setLoading(true);
      const data = await SalesService.getAllProducts();
      setAllProducts(data);
      setProducts(data.slice(0, 10)); // Mostrar primeros 10
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setAllProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = () => {
    const searchLower = searchTerm.toLowerCase();
    const filtered = allProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchLower) ||
        product.code.toLowerCase().includes(searchLower)
    );
    setProducts(filtered.slice(0, 10)); // Limitar a 10 resultados
  };

  const handleSelectProduct = (product: Product) => {
    onSelectProduct(product);
    setSearchTerm('');
    setShowResults(false);
  };

  const handleInputFocus = () => {
    setShowResults(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowResults(true);
  };

  return (
    <div className='product-selector'>
      <label className='product-selector__label'>Buscar Producto</label>

      <div className='product-selector__search' ref={resultsRef}>
        <Input
          type='text'
          value={searchTerm}
          onChange={handleInputChange}
          placeholder='Buscar por nombre o código...'
          onFocus={handleInputFocus}
          leftIcon={<IoSearchOutline size={18} />}
        />
        {loading && <span className='product-selector__loading'>Cargando...</span>}

        {showResults && (
          <div className='product-selector__results'>
            {products.length > 0 ? (
              <>
                {products.map((product) => (
                  <button
                    key={product.id}
                    className='product-selector__result-item'
                    onClick={() => handleSelectProduct(product)}
                    type='button'
                  >
                    <div className='product-selector__result-main'>
                      <div className='product-selector__result-name'>
                        <FiPackage size={18} className='product-selector__result-icon' />
                        <span>{product.name}</span>
                      </div>
                      <div className='product-selector__result-price'>
                        Bs. {product.price.toFixed(2)}
                      </div>
                    </div>
                    <div className='product-selector__result-details'>
                      <span className='product-selector__result-code'>Código: {product.code}</span>
                      <span className='product-selector__result-stock'>
                        Stock: {product.stock} unidades
                      </span>
                    </div>
                    <IoAddCircleOutline size={24} className='product-selector__add-icon' />
                  </button>
                ))}
                {searchTerm && (
                  <div className='product-selector__results-footer'>
                    <IoCartOutline size={14} />
                    <span>
                      Mostrando {products.length} producto{products.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className='product-selector__no-results'>
                <IoSearchOutline size={32} className='product-selector__no-results-icon' />
                <p>{searchTerm ? 'No se encontraron productos' : 'No hay productos disponibles'}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductSelector;
