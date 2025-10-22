import type { Product, CreateProductRequest, ProductResponse } from '../types/inventory';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'; // Ahora usa variables de entorno

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
    // Calcular un stock mínimo sugerido basado en el stock actual
    const stockMinimo = this.calculateSuggestedMinStock(product.stock);

    return {
      id: product.producto_id.toString(),
      name: product.nombre_producto,
      code: product.codigo || '',
      category: product.nombre_categoria || 'Sin categoría',
      description: product.descripcion || '',
      image: product.imagen || '',
      price: parseFloat(product.precio_venta),
      cost: parseFloat(product.precio_costo),
      stock: product.stock,
      minStock: stockMinimo,
      expirationDate: undefined, // Por ahora no tenemos esta info
      lot: undefined, // Por ahora no tenemos esta info
      status: this.getStockStatus(product.stock),
      active: product.estado_id === 1, // Asumiendo que 1 = activo
      createdAt: product.fecha_creacion,
      updatedAt: product.fecha_modificacion,
      // Preservar IDs originales para edición
      marca_id: product.marca_id,
      estado_id: product.estado_id,
      categoria_id: product.categoria_id,
    };
  }

  /**
   * Calcula un stock mínimo sugerido basado en el stock actual
   */
  private calculateSuggestedMinStock(currentStock: number): number {
    // Si el stock es alto, el mínimo podría ser 20% del stock actual
    if (currentStock > 50) return Math.floor(currentStock * 0.2);
    // Si el stock es medio, el mínimo podría ser 30% del stock actual
    if (currentStock > 20) return Math.floor(currentStock * 0.3);
    // Si el stock es bajo, usar un mínimo fijo de 5
    if (currentStock > 10) return 5;
    // Si el stock es muy bajo, usar 2 como mínimo
    return 2;
  }

  /**
   * Determina el status del stock basado en la cantidad actual
   */
  private getStockStatus(stock: number): 'normal' | 'bajo' | 'critico' | 'agotado' {
    if (stock === 0) return 'agotado';
    if (stock <= 5) return 'critico';
    if (stock <= 15) return 'bajo';
    return 'normal';
  }
}

export const productService = new ProductService();
export default productService;
