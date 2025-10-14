// Interfaces basadas en la estructura real de la base de datos
export interface Product {
  producto_id: number;
  codigo?: string;
  nombre_producto: string;
  descripcion?: string;
  imagen?: string;
  precio_venta: string; // viene como string desde el backend
  precio_costo: string; // viene como string desde el backend
  stock: number;
  cantidad_vendidos: number;
  categoria_id?: number;
  empresa_id: string; // UUID
  marca_id?: number;
  estado_id: number;
  fecha_creacion: string;
  fecha_modificacion: string;
  // Datos relacionados que vienen del JOIN
  nombre_categoria?: string;
  marca_nombre?: string;
  estado_nombre?: string;
}

export interface CreateProductRequest {
  codigo?: string;
  nombre_producto: string;
  descripcion?: string;
  imagen?: string;
  precio_venta: number;
  precio_costo: number;
  stock?: number;
  categoria_id?: number;
  empresa_id: string;
  marca_id?: number;
  estado_id?: number;
  dynamicAttributes?: Record<string, any>;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  producto_id: number;
}

export interface ProductResponse {
  success: boolean;
  message: string;
  product?: Product;
  products?: Product[];
}

// Interfaz para compatibilidad con componentes existentes
export interface ProductLegacy {
  id: string;
  name: string;
  code: string;
  category: string;
  description?: string;
  image?: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  expirationDate?: string;
  lot?: string;
  status: 'normal' | 'bajo' | 'critico' | 'agotado';
  active: boolean;
  createdAt: string;
  updatedAt: string;
  // IDs originales para preservar en edición
  marca_id?: number;
  estado_id?: number;
  categoria_id?: number;
}

export interface CriticalProduct {
  id: string | number;
  name: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  category: string;
  supplier?: string;
  lastUpdated: string;
  status: 'critico' | 'bajo';
  location?: string;
  unit: string;
}

export interface StockAction {
  productId: string | number;
  action: 'restock' | 'adjust' | 'transfer';
  quantity: number;
  notes?: string;
}

export interface ProductFilters {
  categories: string[];
  statuses: ('normal' | 'bajo' | 'critico' | 'agotado')[];
  priceRange: {
    min: number;
    max: number;
  };
}
