import { useState, useCallback, useEffect } from 'react';
import type { Product, ProductLegacy, CreateProductRequest } from '../types/inventory';
import { productService } from '../services/productService';

// Empresa ID de prueba - puedes cambiar esto por el ID de tu empresa
const EMPRESA_ID = '6b838f74-c3ee-4195-8218-c501a81e0849';

export interface ProductFormData {
  id?: string; // ID del producto para edición
  name: string;
  code: string;
  parentCategory: string;
  category: string;
  brand: string;
  image: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  marca_id?: number; // ID de la marca en la base de datos
  estado_id?: number; // ID del estado (1=activo, 2=inactivo, etc.)
  // Atributos dinámicos específicos por categoría
  dynamicAttributes: Record<string, any>;
}

export const useProducts = () => {
  const [allProducts, setAllProducts] = useState<ProductLegacy[]>([]);
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

  // Función para convertir producto de BD a formato legacy
  const convertToLegacyProduct = (product: Product): ProductLegacy => {
    return productService.convertToLegacyFormat(product);
  };

  // Cargar productos del backend
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const backendProducts = await productService.getAllProducts(EMPRESA_ID);
      const legacyProducts = backendProducts.map(convertToLegacyProduct);

      setAllProducts(legacyProducts);
      // Los productos filtrados se manejan en el return del hook
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar productos al montar el componente
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const addProduct = useCallback(
    async (productData: ProductFormData) => {
      try {
        setLoading(true);
        setError(null);

        const createRequest: CreateProductRequest = {
          codigo: productData.code,
          nombre_producto: productData.name,
          descripcion: productData.description,
          imagen: productData.image || undefined,
          precio_venta: productData.price,
          precio_costo: productData.cost,
          stock: productData.stock,
          empresa_id: EMPRESA_ID,
          categoria_id: productData.category ? parseInt(productData.category) : undefined,
          marca_id: productData.brand ? parseInt(productData.brand) : undefined,
          estado_id: 1, // Por defecto activo
          dynamicAttributes: productData.dynamicAttributes,
        };

        const newProduct = await productService.createProduct(createRequest);

        if (newProduct) {
          // Recargar productos después de crear uno nuevo
          await loadProducts();
          return { success: true, product: convertToLegacyProduct(newProduct) };
        } else {
          return { success: false, error: 'Error al crear el producto' };
        }
      } catch (err) {
        console.error('Error creating product:', err);
        setError('Error al agregar el producto');
        return { success: false, error: 'Error al agregar el producto' };
      } finally {
        setLoading(false);
      }
    },
    [loadProducts]
  );

  const updateProduct = useCallback(
    async (id: string, productData: Partial<ProductFormData>) => {
      try {
        setLoading(true);
        setError(null);

        const productId = parseInt(id);
        if (isNaN(productId)) {
          return { success: false, error: 'ID de producto inválido' };
        }

        const updateRequest: Partial<CreateProductRequest> = {
          codigo: productData.code,
          nombre_producto: productData.name,
          descripcion: productData.description,
          imagen: productData.image,
          precio_venta: productData.price,
          precio_costo: productData.cost,
          stock: productData.stock,
          categoria_id: productData.category ? parseInt(productData.category) : undefined,
          marca_id:
            productData.marca_id || (productData.brand ? parseInt(productData.brand) : undefined),
          estado_id: productData.estado_id || 1, // Por defecto estado activo (1)
          dynamicAttributes: productData.dynamicAttributes,
        };

        const updatedProduct = await productService.updateProduct(productId, updateRequest);

        if (updatedProduct) {
          // Recargar productos después de actualizar
          await loadProducts();
          return { success: true };
        } else {
          return { success: false, error: 'Error al actualizar el producto' };
        }
      } catch (err) {
        console.error('Error updating product:', err);
        setError('Error al actualizar el producto');
        return { success: false, error: 'Error al actualizar el producto' };
      } finally {
        setLoading(false);
      }
    },
    [loadProducts]
  );

  const deactivateProduct = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);

        const productId = parseInt(id);
        if (isNaN(productId)) {
          return { success: false, error: 'ID de producto inválido' };
        }

        const success = await productService.deleteProduct(productId);

        if (success) {
          // Recargar productos después de desactivar
          await loadProducts();
          return { success: true };
        } else {
          return { success: false, error: 'Error al desactivar el producto' };
        }
      } catch (err) {
        console.error('Error deactivating product:', err);
        setError('Error al desactivar el producto');
        return { success: false, error: 'Error al desactivar el producto' };
      } finally {
        setLoading(false);
      }
    },
    [loadProducts]
  );

  const activateProduct = useCallback((id: string) => {
    // Esta funcionalidad necesitaría una nueva ruta en el backend
    console.log('Activate product not implemented yet:', id);
    return { success: false, error: 'Funcionalidad no implementada' };
  }, []);

  const getProductById = useCallback(
    (id: string) => {
      return allProducts.find((product) => product.id === id);
    },
    [allProducts]
  );

  // Función para filtrar productos por búsqueda
  const filterProductsBySearch = useCallback((products: ProductLegacy[], search: string) => {
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
  const applyFilters = useCallback((products: ProductLegacy[], currentFilters: typeof filters) => {
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
  const activeProducts = allProducts.filter((product) => product.active);

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
    allProducts: allProducts, // Todos los productos para funciones internas
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
    // Función adicional para recargar datos
    refreshProducts: loadProducts,
  };
};
