import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export interface Order {
  id: number;
  numero: string;
  clientName: string;
  clientNit?: string;
  clientEmail?: string;
  clientPhone?: string;
  fecha: string;
  fechaEntrega?: string;
  cotizacion?: string;
  subtotal: number;
  impuesto: number;
  descuento: number;
  total: number;
  estado: string;
  estadoId: number;
  completado: boolean;
  observaciones?: string;
  productos: OrderProduct[];
}

export interface OrderProduct {
  id: number;
  nombre: string;
  codigo: string;
  cantidad: number;
  precio: number;
  subtotal: number;
  descuento: number;
}

export interface OrderStats {
  pendientes: number;
  enProceso: number;
  completados: number;
  total: number;
  totalMonto: number;
}

class OrdersService {
  // Obtener todos los pedidos
  static async getAllOrders(empresaId: string, estadoId?: number): Promise<Order[]> {
    try {
      const params = estadoId ? { estadoId } : {};
      const response = await axios.get(`${API_URL}/${empresaId}/orders`, { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
      throw error;
    }
  }

  // Obtener un pedido por ID
  static async getOrderById(empresaId: string, pedidoId: number): Promise<Order> {
    try {
      const response = await axios.get(`${API_URL}/${empresaId}/orders/${pedidoId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener pedido:', error);
      throw error;
    }
  }

  // Crear un nuevo pedido
  static async createOrder(
    empresaId: string,
    orderData: {
      cliente_id: number;
      cotizacion_id?: number;
      fecha_entrega_estimada?: string;
      productos: {
        producto_id: number;
        cantidad: number;
        precio_unitario: number;
        subtotal: number;
        descuento?: number;
      }[];
      observaciones?: string;
    }
  ): Promise<{ message: string; pedido: { id: number; numero: string } }> {
    try {
      const response = await axios.post(`${API_URL}/${empresaId}/orders`, orderData);
      return response.data;
    } catch (error) {
      console.error('Error al crear pedido:', error);
      throw error;
    }
  }

  // Actualizar estado de pedido
  static async updateOrderStatus(
    empresaId: string,
    pedidoId: number,
    estadoId: number
  ): Promise<{ message: string }> {
    try {
      const response = await axios.patch(`${API_URL}/${empresaId}/orders/${pedidoId}/status`, {
        estadoId,
      });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar estado del pedido:', error);
      throw error;
    }
  }

  // Obtener estadísticas
  static async getStats(empresaId: string): Promise<OrderStats> {
    try {
      const response = await axios.get(`${API_URL}/${empresaId}/orders/stats`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }
}

export default OrdersService;
