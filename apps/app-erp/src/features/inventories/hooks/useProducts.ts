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

  const deleteProduct = useCallback((id: string) => {
    try {
      setLoading(true);
      setError(null);

      setProducts((prev) => {
        const updatedProducts = prev.filter((product) => product.id !== id);
        saveToLocalStorage(updatedProducts);
        return updatedProducts;
      });
      return { success: true };
    } catch (err) {
      setError('Error al eliminar el producto');
      return { success: false, error: 'Error al eliminar el producto' };
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

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
  };
};
