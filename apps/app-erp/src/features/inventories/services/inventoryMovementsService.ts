// Servicio para obtener movimientos de inventario y productos críticos

const API_BASE_URL = 'http://localhost:4000';

export interface MovimientoInventario {
  movimiento_id: number;
  nombre_producto: string;
  tipo_movimiento: string;
  cantidad: number;
  fecha_movimiento: string;
  motivo?: string;
  entidad_tipo?: string;
}

export interface ProductoCritico {
  producto_id: number;
  nombre_producto: string;
  stock: number;
  stock_minimo: number;
  categoria: string;
  imagen?: string;
}

export interface MetricasDashboard {
  total_productos: number;
  productos_criticos: number;
  productos_bajo_stock: number;
  movimientos_hoy: number;
  entradas_semana: number;
  salidas_semana: number;
  valor_inventario_total: number;
}

export const inventoryMovementsService = {
  // Obtener movimientos recientes de inventario usando los endpoints correctos
  async getRecentMovements(empresaId: string, limit: number = 10): Promise<MovimientoInventario[]> {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${API_BASE_URL}/api/dashboard/${empresaId}/recent-movements?limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      const data = await res.json();
      return Array.isArray(data.movimientos) ? data.movimientos : [];
    } catch (err) {
      console.error('Error getRecentMovements:', err);
      return [];
    }
  },

  // Obtener productos con stock crítico usando los endpoints correctos
  async getCriticalProducts(empresaId: string): Promise<ProductoCritico[]> {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/dashboard/${empresaId}/critical-products`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      const data = await res.json();
      return Array.isArray(data.productos_criticos) ? data.productos_criticos : [];
    } catch (err) {
      console.error('Error getCriticalProducts:', err);
      return [];
    }
  },

  // Obtener métricas del dashboard
  async getDashboardMetrics(empresaId: string): Promise<MetricasDashboard | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/dashboard/${empresaId}/metrics`);
      if (!res.ok) throw new Error('Error al obtener métricas');
      const data = await res.json();
      return data.metricas || null;
    } catch (err) {
      console.error('Error getDashboardMetrics:', err);
      return null;
    }
  },
};
