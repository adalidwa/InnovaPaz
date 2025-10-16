import ApiService from './api';
import type { Client, Product, Sale, Order, Quote, SaleProduct } from '../types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
}

export class SalesService {
  private static getEmpresaId(): string {
    const userStr = localStorage.getItem('user');
    console.log('🔍 User from localStorage:', userStr);
    if (userStr) {
      const user = JSON.parse(userStr);
      console.log('🔍 Parsed user:', user);
      console.log('🔍 empresa_id:', user.empresa_id);
      if (user && user.empresa_id) {
        return user.empresa_id;
      }
    }
    throw new Error(
      'No se encontró empresa_id en el usuario. Verifica que hayas iniciado sesión correctamente.'
    );
  }

  // ==================== CLIENTES ====================

  static async getAllClients(): Promise<Client[]> {
    const empresaId = this.getEmpresaId();
    const response = await ApiService.get<ApiResponse<any[]>>(`/clients/empresa/${empresaId}`);
    return this.mapClientsFromBackend(response.data);
  }

  static async getClientById(id: number): Promise<Client | null> {
    try {
      const empresaId = this.getEmpresaId();
      const response = await ApiService.get<ApiResponse<any>>(
        `/clients/empresa/${empresaId}/${id}`
      );
      return this.mapClientFromBackend(response.data);
    } catch (error) {
      console.error('Error al obtener cliente:', error);
      return null;
    }
  }

  static async searchClients(query: string): Promise<Client[]> {
    const empresaId = this.getEmpresaId();
    const response = await ApiService.get<ApiResponse<any[]>>(
      `/clients/empresa/${empresaId}?search=${encodeURIComponent(query)}`
    );
    return this.mapClientsFromBackend(response.data);
  }

  static async createClient(clientData: Omit<Client, 'id'>): Promise<Client> {
    const empresaId = this.getEmpresaId();
    const backendData = {
      nombre: clientData.name,
      email: clientData.email,
      telefono: clientData.phone,
      nit_ci: clientData.nit,
      direccion: clientData.address,
      tipo_cliente: clientData.type,
      limite_credito: clientData.creditLimit,
      deuda_actual: clientData.currentDebt,
    };

    const response = await ApiService.post<ApiResponse<any>>(
      `/clients/empresa/${empresaId}`,
      backendData
    );
    return this.mapClientFromBackend(response.data);
  }

  static async updateClient(id: number, clientData: Partial<Client>): Promise<Client> {
    const empresaId = this.getEmpresaId();
    const backendData: any = {};

    if (clientData.name) backendData.nombre = clientData.name;
    if (clientData.email) backendData.email = clientData.email;
    if (clientData.phone) backendData.telefono = clientData.phone;
    if (clientData.nit) backendData.nit_ci = clientData.nit;
    if (clientData.address) backendData.direccion = clientData.address;
    if (clientData.type) backendData.tipo_cliente = clientData.type;
    if (clientData.creditLimit !== undefined) backendData.limite_credito = clientData.creditLimit;
    if (clientData.currentDebt !== undefined) backendData.deuda_actual = clientData.currentDebt;

    const response = await ApiService.put<ApiResponse<any>>(
      `/clients/empresa/${empresaId}/${id}`,
      backendData
    );
    return this.mapClientFromBackend(response.data);
  }

  static async deleteClient(id: number): Promise<void> {
    const empresaId = this.getEmpresaId();
    await ApiService.delete(`/clients/empresa/${empresaId}/${id}`);
  }

  static async getAllClientsWithInactive(): Promise<any[]> {
    const empresaId = this.getEmpresaId();
    const response = await ApiService.get<ApiResponse<any[]>>(`/clients/empresa/${empresaId}/all`);
    return response.data;
  }

  static async activateClient(id: number): Promise<void> {
    const empresaId = this.getEmpresaId();
    await ApiService.put(`/clients/empresa/${empresaId}/${id}/activate`, {});
  }

  // ==================== CATEGORÍAS ====================

  static async getAllCategories(): Promise<any[]> {
    const response = await ApiService.get<ApiResponse<any[]>>(`/client-categories`);
    return response.data || [];
  }

  static async createCategory(categoryData: any): Promise<any> {
    const response = await ApiService.post<ApiResponse<any>>(`/client-categories`, categoryData);
    return response.data;
  }

  static async updateCategory(id: number, categoryData: any): Promise<any> {
    const response = await ApiService.put<ApiResponse<any>>(
      `/client-categories/${id}`,
      categoryData
    );
    return response.data;
  }

  static async activateCategory(id: number): Promise<void> {
    await ApiService.put(`/client-categories/${id}/activate`, {});
  }

  static async deactivateCategory(id: number): Promise<void> {
    await ApiService.delete(`/client-categories/${id}`);
  }

  // ==================== PRODUCTOS ====================

  static async getAllProducts(): Promise<Product[]> {
    const empresaId = this.getEmpresaId();
    const response = await ApiService.get<{ success: boolean; products: any[] }>(
      `/products?empresa_id=${empresaId}`
    );
    return this.mapProductsFromBackend(response.products);
  }

  static async getProductById(id: number): Promise<Product | null> {
    try {
      const empresaId = this.getEmpresaId();
      const response = await ApiService.get<{ success: boolean; product: any }>(
        `/products/${id}?empresa_id=${empresaId}`
      );
      return this.mapProductFromBackend(response.product);
    } catch (error) {
      console.error('Error al obtener producto:', error);
      return null;
    }
  }

  static async getProductByCode(code: string): Promise<Product | null> {
    try {
      const empresaId = this.getEmpresaId();
      const response = await ApiService.get<{ success: boolean; product: any }>(
        `/products/code/${code}?empresa_id=${empresaId}`
      );
      return this.mapProductFromBackend(response.product);
    } catch (error) {
      console.error('Error al obtener producto por código:', error);
      return null;
    }
  }

  static async searchProducts(query: string, category?: string): Promise<Product[]> {
    const empresaId = this.getEmpresaId();
    let url = `/products/search?empresa_id=${empresaId}&query=${encodeURIComponent(query)}`;
    if (category && category !== 'all') {
      url += `&category=${category}`;
    }
    const response = await ApiService.get<{ success: boolean; products: any[] }>(url);
    return this.mapProductsFromBackend(response.products);
  }

  static async getAvailableProducts(): Promise<Product[]> {
    const products = await this.getAllProducts();
    return products.filter((p) => p.stock > 0);
  }

  static async getLowStockProducts(): Promise<Product[]> {
    const products = await this.getAllProducts();
    return products.filter((p) => p.status === 'Crítico' || p.status === 'Bajo Stock');
  }

  // ==================== VENTAS ====================

  static async getAllSales(): Promise<Sale[]> {
    const empresaId = this.getEmpresaId();
    const response = await ApiService.get<ApiResponse<any[]>>(`/sales/empresa/${empresaId}`);
    return this.mapSalesFromBackend(response.data);
  }

  static async getSaleById(id: number): Promise<Sale | null> {
    try {
      const empresaId = this.getEmpresaId();
      const response = await ApiService.get<ApiResponse<any>>(`/sales/empresa/${empresaId}/${id}`);
      return this.mapSaleFromBackend(response.data);
    } catch (error) {
      console.error('Error al obtener venta:', error);
      return null;
    }
  }

  static async getSalesByClient(clientId: number): Promise<Sale[]> {
    const empresaId = this.getEmpresaId();
    const response = await ApiService.get<ApiResponse<any[]>>(
      `/sales/empresa/${empresaId}?clienteId=${clientId}`
    );
    return this.mapSalesFromBackend(response.data);
  }

  static async getSalesByDateRange(startDate: string, endDate: string): Promise<Sale[]> {
    const empresaId = this.getEmpresaId();
    const response = await ApiService.get<ApiResponse<any[]>>(
      `/sales/empresa/${empresaId}?fechaInicio=${startDate}&fechaFin=${endDate}`
    );
    return this.mapSalesFromBackend(response.data);
  }

  static async createSale(saleData: {
    clientId: number;
    products: SaleProduct[];
    subtotal: number;
    discount: number;
    total: number;
    paymentMethod: string;
  }): Promise<Sale> {
    const empresaId = this.getEmpresaId();

    // Buscar el ID del método de pago (temporal - idealmente obtenerlo de la DB)
    const paymentMethodMap: Record<string, number> = {
      cash: 1,
      credit: 2,
      debit: 3,
      transfer: 4,
    };

    const venta = {
      cliente_id: saleData.clientId,
      vendedor_id: 1, // TODO: obtener del usuario logueado
      subtotal: saleData.subtotal,
      total: saleData.total,
      descuento: saleData.discount,
      metodo_pago_id: paymentMethodMap[saleData.paymentMethod] || 1,
      estado_venta_id: 1, // Completado
    };

    const detalles = saleData.products.map((p) => ({
      producto_id: p.id,
      cantidad: p.quantity,
      precio_unitario: p.price,
      subtotal: p.subtotal,
      descuento: 0,
    }));

    const response = await ApiService.post<ApiResponse<any>>(`/sales/empresa/${empresaId}`, {
      venta,
      detalles,
    });

    return this.mapSaleFromBackend(response.data);
  }

  // ==================== ÓRDENES (PLACEHOLDER) ====================

  static async getAllOrders(): Promise<Order[]> {
    // TODO: Implementar cuando se creen las rutas de órdenes
    return [];
  }

  static async getOrderById(id: number): Promise<Order | null> {
    return null;
  }

  static async getOrdersByClient(clientId: number): Promise<Order[]> {
    return [];
  }

  static async getPendingOrders(): Promise<Order[]> {
    return [];
  }

  // ==================== COTIZACIONES (PLACEHOLDER) ====================

  static async getAllQuotes(): Promise<Quote[]> {
    // TODO: Implementar cuando se creen las rutas de cotizaciones
    return [];
  }

  static async getQuoteById(id: number): Promise<Quote | null> {
    return null;
  }

  static async getPendingQuotes(): Promise<Quote[]> {
    return [];
  }

  // ==================== ESTADÍSTICAS ====================

  static async getTotalSales(period?: 'today' | 'week' | 'month' | 'year'): Promise<number> {
    try {
      const empresaId = this.getEmpresaId();
      const response = await ApiService.get<ApiResponse<any>>(
        `/sales/empresa/${empresaId}/stats?periodo=${period || 'month'}`
      );
      return parseFloat(response.data.total_monto) || 0;
    } catch (error) {
      console.error('Error al obtener total de ventas:', error);
      return 0;
    }
  }

  static async getSalesCount(period?: 'today' | 'week' | 'month' | 'year'): Promise<number> {
    try {
      const empresaId = this.getEmpresaId();
      const response = await ApiService.get<ApiResponse<any>>(
        `/sales/empresa/${empresaId}/stats?periodo=${period || 'month'}`
      );
      return parseInt(response.data.total_ventas) || 0;
    } catch (error) {
      console.error('Error al obtener conteo de ventas:', error);
      return 0;
    }
  }

  static async getTopSellingProducts(
    limit: number = 10
  ): Promise<Array<{ product: Product; quantity: number }>> {
    // TODO: Implementar endpoint en backend
    return [];
  }

  static async getTopClients(
    limit: number = 10
  ): Promise<Array<{ client: Client; totalSpent: number }>> {
    // TODO: Implementar endpoint en backend
    return [];
  }

  // ==================== VALIDACIONES ====================

  static validateSale(sale: Omit<Sale, 'id' | 'date' | 'time'>): string | null {
    if (!sale.clientId || !sale.clientName.trim()) {
      return 'Debe seleccionar un cliente válido';
    }

    if (!sale.products || sale.products.length === 0) {
      return 'La venta debe tener al menos un producto';
    }

    if (sale.total <= 0) {
      return 'El total de la venta debe ser mayor a 0';
    }

    for (const product of sale.products) {
      if (product.quantity <= 0) {
        return `La cantidad del producto ${product.name} debe ser mayor a 0`;
      }
      if (product.price <= 0) {
        return `El precio del producto ${product.name} debe ser mayor a 0`;
      }
    }

    return null;
  }

  static validateOrder(order: Omit<Order, 'id' | 'date'>): string | null {
    if (!order.clientId || !order.clientName.trim()) {
      return 'Debe seleccionar un cliente válido';
    }

    if (!order.deliveryDate) {
      return 'Debe especificar una fecha de entrega';
    }

    const deliveryDate = new Date(order.deliveryDate);
    const today = new Date();
    if (deliveryDate < today) {
      return 'La fecha de entrega no puede ser anterior a hoy';
    }

    if (!order.products || order.products.length === 0) {
      return 'La orden debe tener al menos un producto';
    }

    if (order.total <= 0) {
      return 'El total de la orden debe ser mayor a 0';
    }

    return null;
  }

  static validateQuote(quote: Omit<Quote, 'id' | 'date'>): string | null {
    if (!quote.clientName.trim()) {
      return 'Debe especificar el nombre del cliente';
    }

    if (!quote.clientEmail.trim()) {
      return 'Debe especificar el email del cliente';
    }

    if (!quote.validUntil) {
      return 'Debe especificar la fecha de validez';
    }

    const validUntil = new Date(quote.validUntil);
    const today = new Date();
    if (validUntil < today) {
      return 'La fecha de validez no puede ser anterior a hoy';
    }

    if (!quote.products || quote.products.length === 0) {
      return 'La cotización debe tener al menos un producto';
    }

    if (quote.total <= 0) {
      return 'El total de la cotización debe ser mayor a 0';
    }

    return null;
  }

  // ==================== UTILIDADES ====================

  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
    }).format(amount);
  }

  static formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-BO');
  }

  static calculateCartTotal(products: SaleProduct[]): number {
    return products.reduce((total, product) => total + product.subtotal, 0);
  }

  // ==================== MAPPERS ====================

  private static mapClientFromBackend(data: any): Client {
    return {
      id: data.cliente_id,
      name: data.nombre,
      email: data.email || '',
      phone: data.telefono || '',
      nit: data.nit_ci || '',
      address: data.direccion || '',
      type: data.tipo_cliente || 'regular',
      creditLimit: parseFloat(data.limite_credito) || 0,
      currentDebt: parseFloat(data.deuda_actual) || 0,
      lastPurchase: data.ultima_compra || '',
      categoryName: data.categoria_nombre || 'Sin categoría',
    };
  }

  private static mapClientsFromBackend(data: any[]): Client[] {
    return data.map((item) => this.mapClientFromBackend(item));
  }

  private static mapProductFromBackend(data: any): Product {
    const stock = data.stock || 0;
    const minStock = 10; // TODO: obtener de la DB o configuración

    let status: 'Disponible' | 'Bajo Stock' | 'Crítico' = 'Disponible';
    if (stock === 0) {
      status = 'Crítico';
    } else if (stock < minStock) {
      status = 'Bajo Stock';
    }

    return {
      id: data.producto_id,
      name: data.nombre_producto,
      code: data.codigo || '',
      category: data.nombre_categoria || 'Sin categoría',
      price: parseFloat(data.precio_venta) || 0,
      cost: parseFloat(data.precio_costo) || 0,
      stock: stock,
      minStock: minStock,
      maxStock: 100, // TODO: obtener de la DB
      status: status,
    };
  }

  private static mapProductsFromBackend(data: any[]): Product[] {
    return data.map((item) => this.mapProductFromBackend(item));
  }

  private static mapSaleFromBackend(data: any): Sale {
    const paymentMethodMap: Record<number, 'cash' | 'credit' | 'debit' | 'transfer'> = {
      1: 'cash',
      2: 'credit',
      3: 'debit',
      4: 'transfer',
    };

    const statusMap: Record<number, 'completed' | 'pending' | 'cancelled'> = {
      1: 'completed',
      2: 'pending',
      3: 'cancelled',
    };

    return {
      id: data.venta_id,
      clientId: data.cliente_id,
      clientName: data.cliente_nombre || '',
      date: data.fecha_venta?.split('T')[0] || '',
      time: data.hora_venta || '',
      products:
        data.detalles?.map((d: any) => ({
          id: d.producto_id,
          name: d.producto_nombre,
          code: d.producto_codigo,
          price: parseFloat(d.precio_unitario),
          quantity: d.cantidad,
          subtotal: parseFloat(d.subtotal),
        })) || [],
      subtotal: parseFloat(data.subtotal) || 0,
      discount: parseFloat(data.descuento) || 0,
      total: parseFloat(data.total) || 0,
      paymentMethod: paymentMethodMap[data.metodo_pago_id] || 'cash',
      status: statusMap[data.estado_venta_id] || 'pending',
    };
  }

  private static mapSalesFromBackend(data: any[]): Sale[] {
    return data.map((item) => this.mapSaleFromBackend(item));
  }
}

export default SalesService;
