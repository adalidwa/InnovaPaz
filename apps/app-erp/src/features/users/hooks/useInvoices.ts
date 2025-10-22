/**
 * ================================================================
 * HOOK: useInvoices
 * ================================================================
 *
 * Maneja toda la lógica de facturas:
 * - Obtener historial de facturas
 * - Descargar facturas
 * - Filtrar y ordenar facturas
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getInvoices,
  downloadInvoice,
  invoiceHelpers,
  type Invoice,
} from '../services/invoiceService';

interface UseInvoicesReturn {
  // Datos
  invoices: Invoice[];

  // Estados de carga
  loading: boolean;
  downloading: boolean;

  // Estados de error
  error: string | null;

  // Acciones
  fetchInvoices: () => Promise<void>;
  handleDownload: (invoiceId: string, numero: string) => Promise<void>;
  clearError: () => void;

  // Helpers
  helpers: typeof invoiceHelpers;
}

export const useInvoices = (): UseInvoicesReturn => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Obtiene el historial de facturas
   */
  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Obteniendo facturas...');

      const data = await getInvoices();
      console.log('✅ Facturas obtenidas:', data);

      // Ordenar por fecha (más reciente primero)
      const sortedInvoices = invoiceHelpers.ordenarPorFecha(data);
      setInvoices(sortedInvoices);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener facturas';
      console.error('❌ Error en fetchInvoices:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Descarga una factura
   */
  const handleDownload = useCallback(async (invoiceId: string, numero: string) => {
    try {
      setDownloading(true);
      setError(null);
      console.log('📥 Descargando factura:', numero);

      const blob = await downloadInvoice(invoiceId);

      // Crear URL temporal para descargar
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${numero}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('✅ Factura descargada:', numero);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al descargar factura';
      console.error('❌ Error en handleDownload:', errorMessage);
      setError(errorMessage);
    } finally {
      setDownloading(false);
    }
  }, []);

  /**
   * Limpia el error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Cargar facturas al montar el componente
   */
  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return {
    invoices,
    loading,
    downloading,
    error,
    fetchInvoices,
    handleDownload,
    clearError,
    helpers: invoiceHelpers,
  };
};
