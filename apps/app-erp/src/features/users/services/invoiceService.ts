/**
 * ================================================================
 * SERVICIO DE FACTURAS
 * ================================================================
 *
 * Maneja todas las operaciones relacionadas con facturas:
 * - Obtener historial de facturas
 * - Descargar facturas
 * - Información de facturación
 */

const API_URL = '/api/subscriptions';

export interface Invoice {
  id: string;
  numero: string;
  fecha: string;
  monto: number;
  estado: 'pagada' | 'pendiente';
  url?: string;
  descripcion?: string;
  metodoPago?: string;
}

export interface InvoicesResponse {
  facturas: Invoice[];
  total: number;
  pendientes: number;
}

/**
 * Obtiene el historial de facturas de la empresa
 */
export const getInvoices = async (): Promise<Invoice[]> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  const response = await fetch(`${API_URL}/invoices`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al obtener facturas');
  }

  const data = await response.json();

  // Si el backend retorna { facturas: [...] }, extraemos el array
  return data.facturas || data || [];
};

/**
 * Descarga una factura en formato PDF
 */
export const downloadInvoice = async (invoiceId: string): Promise<Blob> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  const response = await fetch(`${API_URL}/invoices/${invoiceId}/download`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Error al descargar la factura');
  }

  return response.blob();
};

/**
 * Helpers para trabajar con facturas
 */
export const invoiceHelpers = {
  /**
   * Formatea el número de factura
   */
  formatNumero: (numero: string): string => {
    return numero.toUpperCase();
  },

  /**
   * Formatea la fecha de factura
   */
  formatFecha: (fecha: string): string => {
    const date = new Date(fecha);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  },

  /**
   * Formatea el monto con símbolo de moneda
   */
  formatMonto: (monto: number): string => {
    return `Bs${monto.toFixed(2)}`;
  },

  /**
   * Obtiene la clase CSS según el estado
   */
  getEstadoClass: (estado: 'pagada' | 'pendiente'): string => {
    return estado === 'pagada' ? 'invoice-status--paid' : 'invoice-status--pending';
  },

  /**
   * Obtiene el texto del estado
   */
  getEstadoText: (estado: 'pagada' | 'pendiente'): string => {
    return estado === 'pagada' ? 'Pagada' : 'Pendiente';
  },

  /**
   * Calcula el total de facturas
   */
  calcularTotal: (facturas: Invoice[]): number => {
    return facturas.reduce((sum, factura) => sum + factura.monto, 0);
  },

  /**
   * Cuenta facturas pendientes
   */
  contarPendientes: (facturas: Invoice[]): number => {
    return facturas.filter((f) => f.estado === 'pendiente').length;
  },

  /**
   * Filtra facturas por estado
   */
  filtrarPorEstado: (facturas: Invoice[], estado: 'pagada' | 'pendiente'): Invoice[] => {
    return facturas.filter((f) => f.estado === estado);
  },

  /**
   * Ordena facturas por fecha (más reciente primero)
   */
  ordenarPorFecha: (facturas: Invoice[]): Invoice[] => {
    return [...facturas].sort((a, b) => {
      const dateA = new Date(a.fecha).getTime();
      const dateB = new Date(b.fecha).getTime();
      return dateB - dateA;
    });
  },
};
