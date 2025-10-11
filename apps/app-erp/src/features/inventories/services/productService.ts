import type { Product, CreateProductRequest, ProductResponse } from '../types/inventory';

const API_BASE_URL = 'http://localhost:4000'; // Cambia esto por la URL de tu backend

class ProductService {
  private async fetchWithErrorHandling(url: string, options?: RequestInit): Promise<any> {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los productos filtrados por empresa
   */
  async getAllProducts(empresaId?: string): Promise<Product[]> {
    try {
      const url = empresaId
        ? `${API_BASE_URL}/api/products?empresa_id=${empresaId}`
        : `${API_BASE_URL}/api/products`;

      const response: ProductResponse = await this.fetchWithErrorHandling(url);

      if (response.success && response.products) {
        return response.products;
      }

      throw new Error(response.message || 'Error al obtener productos');
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  /**
   * Obtiene un producto específico por ID
   */
  async getProductById(productId: number): Promise<Product | null> {
    try {
      const response: ProductResponse = await this.fetchWithErrorHandling(
        `${API_BASE_URL}/api/products/${productId}`
      );

      if (response.success && response.product) {
        return response.product;
      }

      return null;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  /**
   * Crea un nuevo producto
   */
  async createProduct(productData: CreateProductRequest): Promise<Product | null> {
    try {
      const response: ProductResponse = await this.fetchWithErrorHandling(
        `${API_BASE_URL}/api/products`,
        {
          method: 'POST',
          body: JSON.stringify(productData),
        }
      );

      if (response.success && response.product) {
        return response.product;
      }

      throw new Error(response.message || 'Error al crear producto');
    } catch (error) {
      console.error('Error creating product:', error);
      return null;
    }
  }

  /**
   * Actualiza un producto existente
   */
  async updateProduct(
    productId: number,
    productData: Partial<CreateProductRequest>
  ): Promise<Product | null> {
    try {
      const response: ProductResponse = await this.fetchWithErrorHandling(
        `${API_BASE_URL}/api/products/${productId}`,
        {
          method: 'PUT',
          body: JSON.stringify(productData),
        }
      );

      if (response.success && response.product) {
        return response.product;
      }

      throw new Error(response.message || 'Error al actualizar producto');
    } catch (error) {
      console.error('Error updating product:', error);
      return null;
    }
  }

  /**
   * Desactiva un producto (soft delete)
   */
  async deleteProduct(productId: number): Promise<boolean> {
    try {
      const response: ProductResponse = await this.fetchWithErrorHandling(
        `${API_BASE_URL}/api/products/${productId}`,
        {
          method: 'DELETE',
        }
      );

      return response.success;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  }

  /**
   * Convierte un producto de la BD a formato legacy para compatibilidad
   */
  convertToLegacyFormat(product: Product): any {
    return {
      id: product.producto_id.toString(),
      name: product.nombre_producto,
      code: product.codigo || '',
      category: product.nombre_categoria || 'Sin categoría',
      description: product.descripcion || '',
      price: parseFloat(product.precio_venta),
      cost: parseFloat(product.precio_costo),
      stock: product.stock,
      minStock: 10, // Por defecto, esto debería venir de otra tabla
      expirationDate: undefined, // Por ahora no tenemos esta info
      lot: undefined, // Por ahora no tenemos esta info
      status: this.getStockStatus(product.stock),
      active: product.estado_id === 1, // Asumiendo que 1 = activo
      createdAt: product.fecha_creacion,
      updatedAt: product.fecha_modificacion,
    };
  }

  /**
   * Determina el status del stock basado en la cantidad
   */
  private getStockStatus(stock: number): 'normal' | 'bajo' | 'critico' | 'agotado' {
    if (stock === 0) return 'agotado';
    if (stock < 5) return 'critico';
    if (stock < 20) return 'bajo';
    return 'normal';
  }
}

export const productService = new ProductService();
export default productService;
