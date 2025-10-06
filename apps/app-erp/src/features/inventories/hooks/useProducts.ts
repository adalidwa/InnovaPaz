import { useState, useCallback } from 'react';
import type { Product } from '../types/inventory';

// Datos de ejemplo iniciales
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Coca Cola 500ml',
    code: 'COC500',
    category: 'Bebidas',
    description: 'Gaseosa Coca Cola 500ml',
    price: 3.5,
    cost: 2.0,
    stock: 48,
    minStock: 20,
    expirationDate: '2024-12-15',
    lot: 'LOT2024001',
    status: 'normal',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Pan Integral',
    code: 'PAN001',
    category: 'Alimentos',
    description: 'Pan integral artesanal',
    price: 8.0,
    cost: 5.0,
    stock: 15,
    minStock: 10,
    expirationDate: '2024-10-05',
    lot: 'LOT2024002',
    status: 'bajo',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Detergente Ariel',
    code: 'DET001',
    category: 'Limpieza',
    description: 'Detergente en polvo Ariel 1kg',
    price: 15.5,
    cost: 12.0,
    stock: 3,
    minStock: 10,
    expirationDate: '2025-06-15',
    lot: 'LOT2024003',
    status: 'critico',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Leche Gloria',
    code: 'LEC001',
    category: 'Lácteos',
    description: 'Leche evaporada Gloria 400ml',
    price: 4.2,
    cost: 3.0,
    stock: 0,
    minStock: 15,
    expirationDate: '2024-11-30',
    lot: 'LOT2024004',
    status: 'agotado',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Champú Head & Shoulders',
    code: 'CHA001',
    category: 'Higiene Personal',
    description: 'Champú anticaspa 400ml',
    price: 25.0,
    cost: 18.0,
    stock: 12,
    minStock: 8,
    expirationDate: '2025-03-20',
    lot: 'LOT2024005',
    status: 'normal',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'Papas Lays',
    code: 'SNK001',
    category: 'Snacks',
    description: 'Papas fritas sabor original 150g',
    price: 6.5,
    cost: 4.5,
    stock: 25,
    minStock: 20,
    expirationDate: '2024-12-10',
    lot: 'LOT2024006',
    status: 'normal',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export interface ProductFormData {
  name: string;
  code: string;
  category: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  expirationDate: string;
  lot: string;
}

export const useProducts = () => {
  // Inicializar con datos del localStorage o datos mock
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const savedProducts = localStorage.getItem('inventoryProducts');
      if (savedProducts) {
        const parsed = JSON.parse(savedProducts);
        return parsed.length > 0 ? parsed : mockProducts;
      }
      return mockProducts;
    } catch (error) {
      console.error('Error loading products from localStorage:', error);
      return mockProducts;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<{
    categories: string[];
    statuses: ('normal' | 'bajo' | 'critico' | 'agotado')[];
    priceRange: { min: number; max: number };
  }>({
    categories: [],
    statuses: [],
    priceRange: { min: 0, max: 1000 },
  });

  // Función para guardar en localStorage
  const saveToLocalStorage = (productsToSave: Product[]) => {
    try {
      localStorage.setItem('inventoryProducts', JSON.stringify(productsToSave));
    } catch (error) {
      console.error('Error saving products to localStorage:', error);
    }
  };

  const getProductStatus = (stock: number, minStock: number): Product['status'] => {
    if (stock === 0) return 'agotado';
    if (stock <= minStock * 0.5) return 'critico';
    if (stock <= minStock) return 'bajo';
    return 'normal';
  };

  const addProduct = useCallback((productData: ProductFormData) => {
    try {
      setLoading(true);
      setError(null);

      const newProduct: Product = {
        id: Date.now().toString(),
        ...productData,
        status: getProductStatus(productData.stock, productData.minStock),
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setProducts((prev) => {
        const updatedProducts = [newProduct, ...prev];
        saveToLocalStorage(updatedProducts);
        return updatedProducts;
      });
      return { success: true, product: newProduct };
    } catch (err) {
      setError('Error al agregar el producto');
      return { success: false, error: 'Error al agregar el producto' };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProduct = useCallback((id: string, productData: Partial<ProductFormData>) => {
    try {
      setLoading(true);
      setError(null);

      setProducts((prev) => {
        const updatedProducts = prev.map((product) =>
          product.id === id
            ? {
                ...product,
                ...productData,
                status:
                  productData.stock && productData.minStock
                    ? getProductStatus(productData.stock, productData.minStock)
                    : product.status,
                updatedAt: new Date().toISOString(),
              }
            : product
        );
        saveToLocalStorage(updatedProducts);
        return updatedProducts;
      });
      return { success: true };
    } catch (err) {
      setError('Error al actualizar el producto');
      return { success: false, error: 'Error al actualizar el producto' };
    } finally {
      setLoading(false);
    }
  }, []);

  const deactivateProduct = useCallback((id: string) => {
    try {
      setLoading(true);
      setError(null);

      setProducts((prev) => {
        const updatedProducts = prev.map((product) =>
          product.id === id
            ? { ...product, active: false, updatedAt: new Date().toISOString() }
            : product
        );
        saveToLocalStorage(updatedProducts);
        return updatedProducts;
      });
      return { success: true };
    } catch (err) {
      setError('Error al desactivar el producto');
      return { success: false, error: 'Error al desactivar el producto' };
    } finally {
      setLoading(false);
    }
  }, []);

  const activateProduct = useCallback((id: string) => {
    try {
      setLoading(true);
      setError(null);

      setProducts((prev) => {
        const updatedProducts = prev.map((product) =>
          product.id === id
            ? { ...product, active: true, updatedAt: new Date().toISOString() }
            : product
        );
        saveToLocalStorage(updatedProducts);
        return updatedProducts;
      });
      return { success: true };
    } catch (err) {
      setError('Error al activar el producto');
      return { success: false, error: 'Error al activar el producto' };
    } finally {
      setLoading(false);
    }
  }, []);

  const getProductById = useCallback(
    (id: string) => {
      return products.find((product) => product.id === id);
    },
    [products]
  );

  // Función para filtrar productos por búsqueda
  const filterProductsBySearch = useCallback((products: Product[], search: string) => {
    if (!search.trim()) {
      return products;
    }

    const searchLower = search.toLowerCase().trim();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchLower) ||
        product.code.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower)
    );
  }, []);

  // Función para aplicar filtros
  const applyFilters = useCallback((products: Product[], currentFilters: typeof filters) => {
    return products.filter((product) => {
      // Filtro por categorías
      if (
        currentFilters.categories.length > 0 &&
        !currentFilters.categories.includes(product.category)
      ) {
        return false;
      }

      // Filtro por estados
      if (currentFilters.statuses.length > 0 && !currentFilters.statuses.includes(product.status)) {
        return false;
      }

      // Filtro por rango de precios
      if (
        product.price < currentFilters.priceRange.min ||
        product.price > currentFilters.priceRange.max
      ) {
        return false;
      }

      return true;
    });
  }, []);

  // Filtrar solo productos activos para mostrar en la UI
  const activeProducts = products.filter((product) => product.active);

  // Aplicar filtros y búsqueda a productos activos
  const filteredByFilters = applyFilters(activeProducts, filters);
  const finalFilteredProducts = filterProductsBySearch(filteredByFilters, searchTerm);

  // Función para actualizar el término de búsqueda
  const updateSearchTerm = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  // Función para actualizar filtros
  const updateFilters = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
  }, []);

  // Función para limpiar filtros
  const clearFilters = useCallback(() => {
    setFilters({ categories: [], statuses: [], priceRange: { min: 0, max: 1000 } });
  }, []);

  // Obtener categorías únicas disponibles
  const availableCategories = useCallback(() => {
    const categories = [...new Set(activeProducts.map((product) => product.category))];
    return categories.sort();
  }, [activeProducts]);

  // Obtener rango de precios disponible
  const priceRange = useCallback(() => {
    if (activeProducts.length === 0) return { min: 0, max: 1000 };
    const prices = activeProducts.map((product) => product.price);
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    };
  }, [activeProducts]);

  return {
    products: finalFilteredProducts, // Productos activos filtrados por búsqueda y filtros
    allProducts: products, // Todos los productos para funciones internas
    searchTerm,
    filters,
    loading,
    error,
    addProduct,
    updateProduct,
    deactivateProduct,
    activateProduct,
    getProductById,
    updateSearchTerm,
    updateFilters,
    clearFilters,
    availableCategories,
    priceRange,
  };
};
