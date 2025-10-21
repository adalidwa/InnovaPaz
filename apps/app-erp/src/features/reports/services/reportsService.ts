/**
 * 📊 SERVICIO DE REPORTES
 * API client para el módulo de reportes del ERP
 */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export interface DashboardMetrics {
  periodo: {
    inicio: string;
    fin: string;
    nombre: string;
  };
  usuarios: {
    usuarios_activos: string;
    usuarios_inactivos: string;
    total_usuarios: string;
    usuarios_nuevos_periodo: string;
  };
  productos: {
    total_productos: string;
    productos_stock_bajo: string;
    valor_inventario: string;
    promedio_stock: string;
  };
  invitaciones: {
    invitaciones_pendientes: string;
    invitaciones_aceptadas: string;
    invitaciones_rechazadas: string;
    invitaciones_expiradas: string;
  };
  roles: {
    total_roles: string;
    roles_predeterminados: string;
    roles_personalizados: string;
  };
}

export interface Usuario {
  uid: string;
  nombre_completo: string;
  email: string;
  estado: string;
  fecha_creacion: string;
  rol_nombre: string;
  tipo_rol: string;
}

export interface UsuariosReport {
  usuarios: Usuario[];
  estadisticas: {
    total: string;
    activos: string;
    inactivos: string;
  };
}

export interface Producto {
  producto_id: number;
  codigo: string;
  nombre_producto: string;
  descripcion: string;
  stock: number;
  precio_venta: string;
  precio_costo: string;
  cantidad_vendidos: number;
  valor_stock: string;
  nombre_categoria: string;
  marca_nombre: string;
  estado_nombre: string;
  fecha_creacion: string;
}

export interface ProductosReport {
  productos: Producto[];
  estadisticas: {
    total_productos: string;
    productos_stock_bajo: string;
    total_unidades: number;
    valor_total_inventario: string;
    precio_promedio_venta: string;
    total_vendidos: number;
  };
  por_categoria: Array<{
    nombre_categoria: string;
    cantidad_productos: string;
    total_stock: number;
    valor_categoria: string;
  }>;
}

export interface Invitacion {
  invitacion_id: number;
  email: string;
  estado: string;
  fecha_creacion: string;
  fecha_expiracion: string;
  fecha_aceptacion: string | null;
  nombre_rol: string;
  invitado_por_nombre: string;
  esta_expirada: boolean;
}

export interface InvitacionesReport {
  invitaciones: Invitacion[];
  estadisticas: {
    total_invitaciones: string;
    pendientes: string;
    aceptadas: string;
    rechazadas: string;
    expiradas: string;
    tasa_aceptacion: string;
  };
}

export interface Reporte {
  reporte_id: number;
  empresa_id: string;
  usuario_id: string;
  nombre_reporte: string;
  descripcion: string;
  tipo_reporte: string;
  categoria: string;
  parametros: Record<string, any>;
  configuracion: Record<string, any>;
  es_favorito: boolean;
  es_publico: boolean;
  fecha_creacion: string;
  fecha_modificacion: string;
  fecha_ultima_ejecucion: string | null;
  numero_ejecuciones: number;
  creador_nombre?: string;
  creador_email?: string;
}

export interface CreateReporteDTO {
  empresa_id: string;
  usuario_id: string;
  nombre_reporte: string;
  descripcion?: string;
  tipo_reporte: string;
  categoria?: string;
  parametros?: Record<string, any>;
  configuracion?: Record<string, any>;
  es_favorito?: boolean;
  es_publico?: boolean;
}

class ReportsService {
  // ============================================
  // CRUD DE REPORTES GUARDADOS
  // ============================================

  /**
   * Obtener todos los reportes de una empresa
   */
  async getReportes(
    empresaId: string,
    filters?: {
      tipo_reporte?: string;
      categoria?: string;
      es_favorito?: boolean;
      es_publico?: boolean;
      usuario_id?: string;
    }
  ): Promise<{ success: boolean; count: number; reportes: Reporte[] }> {
    const params = new URLSearchParams({ empresa_id: empresaId });

    if (filters) {
      if (filters.tipo_reporte) params.append('tipo_reporte', filters.tipo_reporte);
      if (filters.categoria) params.append('categoria', filters.categoria);
      if (filters.es_favorito !== undefined)
        params.append('es_favorito', String(filters.es_favorito));
      if (filters.es_publico !== undefined) params.append('es_publico', String(filters.es_publico));
      if (filters.usuario_id) params.append('usuario_id', filters.usuario_id);
    }

    const response = await axios.get(`${API_URL}/api/reports?${params}`);
    return response.data;
  }

  /**
   * Obtener un reporte por ID
   */
  async getReporte(reporteId: number): Promise<{ success: boolean; reporte: Reporte }> {
    const response = await axios.get(`${API_URL}/api/reports/${reporteId}`);
    return response.data;
  }

  /**
   * Crear un nuevo reporte
   */
  async createReporte(
    data: CreateReporteDTO
  ): Promise<{ success: boolean; message: string; reporte: Reporte }> {
    const response = await axios.post(`${API_URL}/api/reports`, data);
    return response.data;
  }

  /**
   * Actualizar un reporte
   */
  async updateReporte(
    reporteId: number,
    data: Partial<CreateReporteDTO>
  ): Promise<{ success: boolean; message: string; reporte: Reporte }> {
    const response = await axios.put(`${API_URL}/api/reports/${reporteId}`, data);
    return response.data;
  }

  /**
   * Eliminar un reporte
   */
  async deleteReporte(reporteId: number): Promise<{ success: boolean; message: string }> {
    const response = await axios.delete(`${API_URL}/api/reports/${reporteId}`);
    return response.data;
  }

  /**
   * Marcar/Desmarcar como favorito
   */
  async toggleFavorito(
    reporteId: number
  ): Promise<{ success: boolean; message: string; reporte: Reporte }> {
    const response = await axios.patch(`${API_URL}/api/reports/${reporteId}/favorito`);
    return response.data;
  }

  // ============================================
  // GENERACIÓN DE REPORTES DINÁMICOS
  // ============================================

  /**
   * Obtener Dashboard General
   */
  async getDashboard(
    empresaId: string,
    periodo: string = 'mes_actual'
  ): Promise<{ success: boolean; metricas: DashboardMetrics; tiempo_ejecucion_ms: number }> {
    const response = await axios.get(
      `${API_URL}/api/reports/generate/dashboard?empresa_id=${empresaId}&periodo=${periodo}`
    );
    return response.data;
  }

  /**
   * Obtener Reporte de Usuarios
   */
  async getReporteUsuarios(
    empresaId: string,
    filters?: {
      estado?: string;
      rol_id?: number;
      fecha_desde?: string;
      fecha_hasta?: string;
    }
  ): Promise<
    { success: boolean; tipo_reporte: string } & UsuariosReport & { tiempo_ejecucion_ms: number }
  > {
    const params = new URLSearchParams({ empresa_id: empresaId });

    if (filters) {
      if (filters.estado) params.append('estado', filters.estado);
      if (filters.rol_id) params.append('rol_id', String(filters.rol_id));
      if (filters.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
      if (filters.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);
    }

    const response = await axios.get(`${API_URL}/api/reports/generate/usuarios?${params}`);
    return response.data;
  }

  /**
   * Obtener Reporte de Productos/Inventario
   */
  async getReporteProductos(
    empresaId: string,
    filters?: {
      categoria_id?: number;
      marca_id?: number;
      estado_id?: number;
      stock_minimo?: number;
      ordenar_por?: string;
      orden?: 'ASC' | 'DESC';
    }
  ): Promise<
    { success: boolean; tipo_reporte: string } & ProductosReport & { tiempo_ejecucion_ms: number }
  > {
    const params = new URLSearchParams({ empresa_id: empresaId });

    if (filters) {
      if (filters.categoria_id) params.append('categoria_id', String(filters.categoria_id));
      if (filters.marca_id) params.append('marca_id', String(filters.marca_id));
      if (filters.estado_id) params.append('estado_id', String(filters.estado_id));
      if (filters.stock_minimo) params.append('stock_minimo', String(filters.stock_minimo));
      if (filters.ordenar_por) params.append('ordenar_por', filters.ordenar_por);
      if (filters.orden) params.append('orden', filters.orden);
    }

    const response = await axios.get(`${API_URL}/api/reports/generate/productos?${params}`);
    return response.data;
  }

  /**
   * Obtener Reporte de Stock Bajo (Alerta)
   */
  async getReporteStockBajo(
    empresaId: string,
    stockMinimo: number = 10
  ): Promise<{
    success: boolean;
    tipo_reporte: string;
    alerta: boolean;
    cantidad_productos_criticos: number;
    productos: Producto[];
    estadisticas: ProductosReport['estadisticas'];
  }> {
    const response = await axios.get(
      `${API_URL}/api/reports/generate/stock-bajo?empresa_id=${empresaId}&stock_minimo=${stockMinimo}`
    );
    return response.data;
  }

  /**
   * Obtener Reporte de Invitaciones
   */
  async getReporteInvitaciones(
    empresaId: string,
    filters?: {
      estado?: string;
      fecha_desde?: string;
      fecha_hasta?: string;
    }
  ): Promise<
    { success: boolean; tipo_reporte: string } & InvitacionesReport & {
        tiempo_ejecucion_ms: number;
      }
  > {
    const params = new URLSearchParams({ empresa_id: empresaId });

    if (filters) {
      if (filters.estado) params.append('estado', filters.estado);
      if (filters.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
      if (filters.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);
    }

    const response = await axios.get(`${API_URL}/api/reports/generate/invitaciones?${params}`);
    return response.data;
  }

  /**
   * Obtener Reporte de Roles
   */
  async getReporteRoles(empresaId: string): Promise<{
    success: boolean;
    tipo_reporte: string;
    roles_personalizados: any[];
    plantillas_usadas: any[];
    total_roles_personalizados: number;
    total_plantillas_usadas: number;
    tiempo_ejecucion_ms: number;
  }> {
    const response = await axios.get(
      `${API_URL}/api/reports/generate/roles?empresa_id=${empresaId}`
    );
    return response.data;
  }

  // ============================================
  // HISTORIAL
  // ============================================

  /**
   * Obtener historial de un reporte
   */
  async getHistorial(
    reporteId: number,
    limite: number = 50
  ): Promise<{
    success: boolean;
    count: number;
    historial: any[];
  }> {
    const response = await axios.get(
      `${API_URL}/api/reports/${reporteId}/historial?limite=${limite}`
    );
    return response.data;
  }

  // ============================================
  // EXPORTACIÓN
  // ============================================

  /**
   * Exportar Dashboard a PDF
   */
  async exportDashboardPDF(empresaId: string, periodo: string = 'mes_actual'): Promise<void> {
    const response = await axios.get(
      `${API_URL}/api/reports/export/dashboard/pdf?empresa_id=${empresaId}&periodo=${periodo}`,
      { responseType: 'blob' }
    );

    // Crear descarga
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-${Date.now()}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Exportar Dashboard a Excel
   */
  async exportDashboardExcel(empresaId: string, periodo: string = 'mes_actual'): Promise<void> {
    const response = await axios.get(
      `${API_URL}/api/reports/export/dashboard/excel?empresa_id=${empresaId}&periodo=${periodo}`,
      { responseType: 'blob' }
    );

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-${Date.now()}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Exportar Productos a PDF
   */
  async exportProductosPDF(empresaId: string): Promise<void> {
    const response = await axios.get(
      `${API_URL}/api/reports/export/productos/pdf?empresa_id=${empresaId}`,
      { responseType: 'blob' }
    );

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `productos-${Date.now()}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Exportar Productos a Excel
   */
  async exportProductosExcel(empresaId: string): Promise<void> {
    const response = await axios.get(
      `${API_URL}/api/reports/export/productos/excel?empresa_id=${empresaId}`,
      { responseType: 'blob' }
    );

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `productos-${Date.now()}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Exportar Usuarios a Excel
   */
  async exportUsuariosExcel(empresaId: string): Promise<void> {
    const response = await axios.get(
      `${API_URL}/api/reports/export/usuarios/excel?empresa_id=${empresaId}`,
      { responseType: 'blob' }
    );

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `usuarios-${Date.now()}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}

export const reportsService = new ReportsService();
export default reportsService;
