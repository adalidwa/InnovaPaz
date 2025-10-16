import dbData from '../data/db.json';
import { Client, Product, Sale, Order, Quote, SaleProduct } from '../hooks/hooks';

export class SalesService {
  // Métodos para clientes
  static async getAllClients(): Promise<Client[]> {
    // Simula una llamada async
    return new Promise((resolve) => {
      setTimeout(() => resolve(dbData.clients), 100);
    });
  }

  static async getClientById(id: number): Promise<Client | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const client = dbData.clients.find((c) => c.id === id) || null;
        resolve(client);
      }, 100);
    });
  }

  static async searchClients(query: string): Promise<Client[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered = dbData.clients.filter(
          (client) =>
            client.name.toLowerCase().includes(query.toLowerCase()) ||
            client.email.toLowerCase().includes(query.toLowerCase()) ||
            client.nit.includes(query) ||
            client.phone.includes(query)
        );
        resolve(filtered);
      }, 100);
    });
  }

  // Métodos para productos
  static async getAllProducts(): Promise<Product[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(dbData.products), 100);
    });
  }

  static async getProductById(id: number): Promise<Product | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const product = dbData.products.find((p) => p.id === id) || null;
        resolve(product);
      }, 100);
    });
  }

  static async getProductByCode(code: string): Promise<Product | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const product =
          dbData.products.find((p) => p.code.toLowerCase() === code.toLowerCase()) || null;
        resolve(product);
      }, 100);
    });
  }

  static async searchProducts(query: string, category?: string): Promise<Product[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filtered = dbData.products.filter(
          (product) =>
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.code.toLowerCase().includes(query.toLowerCase()) ||
            product.category.toLowerCase().includes(query.toLowerCase())
        );

        if (category && category !== 'all') {
          filtered = filtered.filter((p) => p.category === category);
        }

        resolve(filtered);
      }, 100);
    });
  }

  static async getAvailableProducts(): Promise<Product[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const available = dbData.products.filter((p) => p.status !== 'Crítico' && p.stock > 0);
        resolve(available);
      }, 100);
    });
  }

  static async getLowStockProducts(): Promise<Product[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const lowStock = dbData.products.filter(
          (p) => p.status === 'Crítico' || p.status === 'Bajo Stock'
        );
        resolve(lowStock);
      }, 100);
    });
  }

  // Métodos para ventas
  static async getAllSales(): Promise<Sale[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(dbData.sales), 100);
    });
  }

  static async getSaleById(id: number): Promise<Sale | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const sale = dbData.sales.find((s) => s.id === id) || null;
        resolve(sale);
      }, 100);
    });
  }

  static async getSalesByClient(clientId: number): Promise<Sale[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const sales = dbData.sales.filter((s) => s.clientId === clientId);
        resolve(sales);
      }, 100);
    });
  }

  static async getSalesByDateRange(startDate: string, endDate: string): Promise<Sale[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const sales = dbData.sales.filter((s) => s.date >= startDate && s.date <= endDate);
        resolve(sales);
      }, 100);
    });
  }

  // Métodos para órdenes
  static async getAllOrders(): Promise<Order[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(dbData.orders), 100);
    });
  }

  static async getOrderById(id: number): Promise<Order | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const order = dbData.orders.find((o) => o.id === id) || null;
        resolve(order);
      }, 100);
    });
  }

  static async getOrdersByClient(clientId: number): Promise<Order[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const orders = dbData.orders.filter((o) => o.clientId === clientId);
        resolve(orders);
      }, 100);
    });
  }

  static async getPendingOrders(): Promise<Order[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const pending = dbData.orders.filter(
          (o) => o.status === 'pending' || o.status === 'confirmed'
        );
        resolve(pending);
      }, 100);
    });
  }

  // Métodos para cotizaciones
  static async getAllQuotes(): Promise<Quote[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(dbData.quotes), 100);
    });
  }

  static async getQuoteById(id: number): Promise<Quote | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const quote = dbData.quotes.find((q) => q.id === id) || null;
        resolve(quote);
      }, 100);
    });
  }

  static async getPendingQuotes(): Promise<Quote[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const pending = dbData.quotes.filter((q) => q.status === 'pending');
        resolve(pending);
      }, 100);
    });
  }

  // Métodos de estadísticas y reportes
  static async getTotalSales(period?: 'today' | 'week' | 'month' | 'year'): Promise<number> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredSales = dbData.sales.filter((s) => s.status === 'completed');

        if (period) {
          const now = new Date();
          const filterDate = new Date();

          switch (period) {
            case 'today':
              filterDate.setHours(0, 0, 0, 0);
              break;
            case 'week':
              filterDate.setDate(now.getDate() - 7);
              break;
            case 'month':
              filterDate.setMonth(now.getMonth() - 1);
              break;
            case 'year':
              filterDate.setFullYear(now.getFullYear() - 1);
              break;
          }

          filteredSales = filteredSales.filter((s) => new Date(s.date) >= filterDate);
        }

        const total = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
        resolve(total);
      }, 100);
    });
  }

  static async getSalesCount(period?: 'today' | 'week' | 'month' | 'year'): Promise<number> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let count = dbData.sales.filter((s) => s.status === 'completed').length;

        if (period) {
          const now = new Date();
          const filterDate = new Date();

          switch (period) {
            case 'today':
              filterDate.setHours(0, 0, 0, 0);
              break;
            case 'week':
              filterDate.setDate(now.getDate() - 7);
              break;
            case 'month':
              filterDate.setMonth(now.getMonth() - 1);
              break;
            case 'year':
              filterDate.setFullYear(now.getFullYear() - 1);
              break;
          }

          count = dbData.sales.filter(
            (s) => s.status === 'completed' && new Date(s.date) >= filterDate
          ).length;
        }

        resolve(count);
      }, 100);
    });
  }

  static async getTopSellingProducts(
    limit: number = 10
  ): Promise<Array<{ product: Product; quantity: number }>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const productSales: Record<number, number> = {};

        // Contar ventas por producto
        dbData.sales.forEach((sale) => {
          if (sale.status === 'completed') {
            sale.products.forEach((product) => {
              productSales[product.id] = (productSales[product.id] || 0) + product.quantity;
            });
          }
        });

        // Crear array ordenado
        const topProducts = Object.entries(productSales)
          .sort(([, a], [, b]) => b - a)
          .slice(0, limit)
          .map(([productId, quantity]) => {
            const product = dbData.products.find((p) => p.id === parseInt(productId));
            return {
              product: product!,
              quantity,
            };
          })
          .filter((item) => item.product); // Filtrar productos no encontrados

        resolve(topProducts);
      }, 100);
    });
  }

  static async getTopClients(
    limit: number = 10
  ): Promise<Array<{ client: Client; totalSpent: number }>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const clientSales: Record<number, number> = {};

        // Sumar ventas por cliente
        dbData.sales.forEach((sale) => {
          if (sale.status === 'completed') {
            clientSales[sale.clientId] = (clientSales[sale.clientId] || 0) + sale.total;
          }
        });

        // Crear array ordenado
        const topClients = Object.entries(clientSales)
          .sort(([, a], [, b]) => b - a)
          .slice(0, limit)
          .map(([clientId, totalSpent]) => {
            const client = dbData.clients.find((c) => c.id === parseInt(clientId));
            return {
              client: client!,
              totalSpent,
            };
          })
          .filter((item) => item.client); // Filtrar clientes no encontrados

        resolve(topClients);
      }, 100);
    });
  }

  // Métodos de validación
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

  // Utilidades
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
}

export default SalesService;
