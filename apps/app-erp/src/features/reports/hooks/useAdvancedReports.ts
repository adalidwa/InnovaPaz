/**
 * 📊 HOOK PARA REPORTES AVANZADOS
 * Hook especializado para gestionar los nuevos reportes del ERP
 */

import { useState, useCallback } from 'react';
import reportsService, {
  type VentasReport,
  type InventarioReport,
  type MovimientosInventarioReport,
  type AlertasReport,
} from '../services/reportsService';

export interface UseAdvancedReportsReturn {
  // Ventas
  ventasReport: VentasReport | null;
  loadingVentas: boolean;
  errorVentas: string | null;
  refreshVentas: (filters?: any) => Promise<void>;
  exportVentasPDF: (filters?: any) => Promise<void>;
  exportVentasExcel: (filters?: any) => Promise<void>;

  // Inventario
  inventarioReport: InventarioReport | null;
  loadingInventario: boolean;
  errorInventario: string | null;
  refreshInventario: (filters?: any) => Promise<void>;
  exportInventarioPDF: (filters?: any) => Promise<void>;
  exportInventarioExcel: (filters?: any) => Promise<void>;

  // Movimientos
  movimientosReport: MovimientosInventarioReport | null;
  loadingMovimientos: boolean;
  errorMovimientos: string | null;
  refreshMovimientos: (filters?: any) => Promise<void>;
  exportMovimientosPDF: (filters?: any) => Promise<void>;
  exportMovimientosExcel: (filters?: any) => Promise<void>;

  // Alertas
  alertasReport: AlertasReport | null;
  loadingAlertas: boolean;
  errorAlertas: string | null;
  refreshAlertas: (stockMinimo?: number) => Promise<void>;
  exportAlertasPDF: (stockMinimo?: number) => Promise<void>;
  exportAlertasExcel: (stockMinimo?: number) => Promise<void>;

  // Utilidades generales
  isAnyLoading: boolean;
  hasAnyError: boolean;
  clearAllErrors: () => void;
}

export function useAdvancedReports(empresaId: string): UseAdvancedReportsReturn {
  // ============================================
  // VENTAS STATE
  // ============================================
  const [ventasReport, setVentasReport] = useState<VentasReport | null>(null);
  const [loadingVentas, setLoadingVentas] = useState(false);
  const [errorVentas, setErrorVentas] = useState<string | null>(null);

  // ============================================
  // INVENTARIO STATE
  // ============================================
  const [inventarioReport, setInventarioReport] = useState<InventarioReport | null>(null);
  const [loadingInventario, setLoadingInventario] = useState(false);
  const [errorInventario, setErrorInventario] = useState<string | null>(null);

  // ============================================
  // MOVIMIENTOS STATE
  // ============================================
  const [movimientosReport, setMovimientosReport] = useState<MovimientosInventarioReport | null>(
    null
  );
  const [loadingMovimientos, setLoadingMovimientos] = useState(false);
  const [errorMovimientos, setErrorMovimientos] = useState<string | null>(null);

  // ============================================
  // ALERTAS STATE
  // ============================================
  const [alertasReport, setAlertasReport] = useState<AlertasReport | null>(null);
  const [loadingAlertas, setLoadingAlertas] = useState(false);
  const [errorAlertas, setErrorAlertas] = useState<string | null>(null);

  // ============================================
  // VENTAS METHODS
  // ============================================

  const refreshVentas = useCallback(
    async (filters?: any) => {
      if (!empresaId) return;

      setLoadingVentas(true);
      setErrorVentas(null);

      try {
        const response = await reportsService.getReporteVentas(empresaId, filters);
        setVentasReport({
          estadisticas: response.estadisticas,
          ventas: response.ventas,
          top_productos: response.top_productos,
          por_metodo_pago: response.por_metodo_pago,
          por_vendedor: response.por_vendedor,
        });
      } catch (error: any) {
        console.error('Error al cargar reporte de ventas:', error);
        setErrorVentas(error.response?.data?.message || 'Error al cargar reporte de ventas');
      } finally {
        setLoadingVentas(false);
      }
    },
    [empresaId]
  );

  const exportVentasPDF = useCallback(
    async (filters?: any) => {
      try {
        await reportsService.exportVentasPDF(empresaId, filters);
      } catch (error: any) {
        console.error('Error al exportar ventas PDF:', error);
        setErrorVentas(error.response?.data?.message || 'Error al exportar PDF');
      }
    },
    [empresaId]
  );

  const exportVentasExcel = useCallback(
    async (filters?: any) => {
      try {
        await reportsService.exportVentasExcel(empresaId, filters);
      } catch (error: any) {
        console.error('Error al exportar ventas Excel:', error);
        setErrorVentas(error.response?.data?.message || 'Error al exportar Excel');
      }
    },
    [empresaId]
  );

  // ============================================
  // INVENTARIO METHODS
  // ============================================

  const refreshInventario = useCallback(
    async (filters?: any) => {
      if (!empresaId) return;

      setLoadingInventario(true);
      setErrorInventario(null);

      try {
        const response = await reportsService.getReporteInventario(empresaId, filters);
        setInventarioReport({
          estadisticas: response.estadisticas,
          productos: response.productos,
          por_categoria: response.por_categoria,
          proximos_vencer: response.proximos_vencer,
        });
      } catch (error: any) {
        console.error('Error al cargar reporte de inventario:', error);
        setErrorInventario(
          error.response?.data?.message || 'Error al cargar reporte de inventario'
        );
      } finally {
        setLoadingInventario(false);
      }
    },
    [empresaId]
  );

  const exportInventarioPDF = useCallback(
    async (filters?: any) => {
      try {
        await reportsService.exportInventarioPDF(empresaId, filters);
      } catch (error: any) {
        console.error('Error al exportar inventario PDF:', error);
        setErrorInventario(error.response?.data?.message || 'Error al exportar PDF');
      }
    },
    [empresaId]
  );

  const exportInventarioExcel = useCallback(
    async (filters?: any) => {
      try {
        await reportsService.exportInventarioExcel(empresaId, filters);
      } catch (error: any) {
        console.error('Error al exportar inventario Excel:', error);
        setErrorInventario(error.response?.data?.message || 'Error al exportar Excel');
      }
    },
    [empresaId]
  );

  // ============================================
  // MOVIMIENTOS METHODS
  // ============================================

  const refreshMovimientos = useCallback(
    async (filters?: any) => {
      if (!empresaId) return;

      setLoadingMovimientos(true);
      setErrorMovimientos(null);

      try {
        const response = await reportsService.getReporteMovimientosInventario(empresaId, filters);
        setMovimientosReport({
          estadisticas: response.estadisticas,
          movimientos: response.movimientos,
          por_tipo: response.por_tipo,
          productos_mas_movimientos: response.productos_mas_movimientos,
          por_usuario: response.por_usuario,
        });
      } catch (error: any) {
        console.error('Error al cargar reporte de movimientos:', error);
        setErrorMovimientos(
          error.response?.data?.message || 'Error al cargar reporte de movimientos'
        );
      } finally {
        setLoadingMovimientos(false);
      }
    },
    [empresaId]
  );

  const exportMovimientosPDF = useCallback(
    async (filters?: any) => {
      try {
        await reportsService.exportMovimientosPDF(empresaId, filters);
      } catch (error: any) {
        console.error('Error al exportar movimientos PDF:', error);
        setErrorMovimientos(error.response?.data?.message || 'Error al exportar PDF');
      }
    },
    [empresaId]
  );

  const exportMovimientosExcel = useCallback(
    async (filters?: any) => {
      try {
        await reportsService.exportMovimientosExcel(empresaId, filters);
      } catch (error: any) {
        console.error('Error al exportar movimientos Excel:', error);
        setErrorMovimientos(error.response?.data?.message || 'Error al exportar Excel');
      }
    },
    [empresaId]
  );

  // ============================================
  // ALERTAS METHODS
  // ============================================

  const refreshAlertas = useCallback(
    async (stockMinimo: number = 10) => {
      if (!empresaId) return;

      setLoadingAlertas(true);
      setErrorAlertas(null);

      try {
        const response = await reportsService.getReporteAlertas(empresaId, stockMinimo);
        setAlertasReport({
          estadisticas: response.estadisticas,
          productos_sin_stock: response.productos_sin_stock,
          productos_stock_bajo: response.productos_stock_bajo,
          productos_proximos_vencer: response.productos_proximos_vencer,
        });
      } catch (error: any) {
        console.error('Error al cargar reporte de alertas:', error);
        setErrorAlertas(error.response?.data?.message || 'Error al cargar reporte de alertas');
      } finally {
        setLoadingAlertas(false);
      }
    },
    [empresaId]
  );

  const exportAlertasPDF = useCallback(
    async (stockMinimo: number = 10) => {
      try {
        await reportsService.exportAlertasPDF(empresaId, stockMinimo);
      } catch (error: any) {
        console.error('Error al exportar alertas PDF:', error);
        setErrorAlertas(error.response?.data?.message || 'Error al exportar PDF');
      }
    },
    [empresaId]
  );

  const exportAlertasExcel = useCallback(
    async (stockMinimo: number = 10) => {
      try {
        await reportsService.exportAlertasExcel(empresaId, stockMinimo);
      } catch (error: any) {
        console.error('Error al exportar alertas Excel:', error);
        setErrorAlertas(error.response?.data?.message || 'Error al exportar Excel');
      }
    },
    [empresaId]
  );

  // ============================================
  // UTILIDADES GENERALES
  // ============================================

  const isAnyLoading = loadingVentas || loadingInventario || loadingMovimientos || loadingAlertas;
  const hasAnyError = !!(errorVentas || errorInventario || errorMovimientos || errorAlertas);

  const clearAllErrors = useCallback(() => {
    setErrorVentas(null);
    setErrorInventario(null);
    setErrorMovimientos(null);
    setErrorAlertas(null);
  }, []);

  return {
    // Ventas
    ventasReport,
    loadingVentas,
    errorVentas,
    refreshVentas,
    exportVentasPDF,
    exportVentasExcel,

    // Inventario
    inventarioReport,
    loadingInventario,
    errorInventario,
    refreshInventario,
    exportInventarioPDF,
    exportInventarioExcel,

    // Movimientos
    movimientosReport,
    loadingMovimientos,
    errorMovimientos,
    refreshMovimientos,
    exportMovimientosPDF,
    exportMovimientosExcel,

    // Alertas
    alertasReport,
    loadingAlertas,
    errorAlertas,
    refreshAlertas,
    exportAlertasPDF,
    exportAlertasExcel,

    // Utilidades
    isAnyLoading,
    hasAnyError,
    clearAllErrors,
  };
}
