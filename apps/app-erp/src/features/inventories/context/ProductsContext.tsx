import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useProducts } from '../hooks/useProducts';
import type { ProductFormData } from '../hooks/useProducts';
import type { Product } from '../types/inventory';

interface ProductsContextType {
  products: Product[];
  allProducts: Product[];
  searchTerm: string;
  filters: {
    categories: string[];
    statuses: ('normal' | 'bajo' | 'critico' | 'agotado')[];
    priceRange: { min: number; max: number };
  };
  loading: boolean;
  error: string | null;
  addProduct: (productData: ProductFormData) => {
    success: boolean;
    product?: Product;
    error?: string;
  };
  updateProduct: (
    id: string,
    productData: Partial<ProductFormData>
  ) => { success: boolean; error?: string };
  deactivateProduct: (id: string) => { success: boolean; error?: string };
  activateProduct: (id: string) => { success: boolean; error?: string };
  getProductById: (id: string) => Product | undefined;
  updateSearchTerm: (term: string) => void;
  updateFilters: (filters: {
    categories: string[];
    statuses: ('normal' | 'bajo' | 'critico' | 'agotado')[];
    priceRange: { min: number; max: number };
  }) => void;
  clearFilters: () => void;
  availableCategories: () => string[];
  priceRange: () => { min: number; max: number };
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

interface ProductsProviderProps {
  children: ReactNode;
}

export const ProductsProvider: React.FC<ProductsProviderProps> = ({ children }) => {
  const productsData = useProducts();

  return <ProductsContext.Provider value={productsData}>{children}</ProductsContext.Provider>;
};

export const useProductsContext = () => {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error('useProductsContext must be used within a ProductsProvider');
  }
  return context;
};
