/**
 * 📊 HOOK PARA REPORTES
 * Hook personalizado para gestionar reportes del ERP
 */

import { useState, useEffect, useCallback } from 'react';
import reportsService, {
  type DashboardMetrics,
  type UsuariosReport,
  type ProductosReport,
} from '../services/reportsService';

export interface UseReportsReturn {
  // Dashboard
  dashboardMetrics: DashboardMetrics | null;
  loadingDashboard: boolean;
  errorDashboard: string | null;
  refreshDashboard: (periodo?: string) => Promise<void>;

  // Usuarios
  usuariosReport: UsuariosReport | null;
  loadingUsuarios: boolean;
  errorUsuarios: string | null;
  refreshUsuarios: (filters?: any) => Promise<void>;

  // Productos
  productosReport: ProductosReport | null;
  loadingProductos: boolean;
  errorProductos: string | null;
  refreshProductos: (filters?: any) => Promise<void>;

  // Stock Bajo
  stockBajo: any | null;
  loadingStockBajo: boolean;
  errorStockBajo: string | null;
  refreshStockBajo: (stockMinimo?: number) => Promise<void>;
}

export function useReports(empresaId: string): UseReportsReturn {
  // Dashboard
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [errorDashboard, setErrorDashboard] = useState<string | null>(null);

  // Usuarios
  const [usuariosReport, setUsuariosReport] = useState<UsuariosReport | null>(null);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [errorUsuarios, setErrorUsuarios] = useState<string | null>(null);

  // Productos
  const [productosReport, setProductosReport] = useState<ProductosReport | null>(null);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [errorProductos, setErrorProductos] = useState<string | null>(null);

  // Stock Bajo
  const [stockBajo, setStockBajo] = useState<any | null>(null);
  const [loadingStockBajo, setLoadingStockBajo] = useState(false);
  const [errorStockBajo, setErrorStockBajo] = useState<string | null>(null);

  // ============================================
  // DASHBOARD
  // ============================================

  const refreshDashboard = useCallback(
    async (periodo: string = 'mes_actual') => {
      if (!empresaId) return;

      setLoadingDashboard(true);
      setErrorDashboard(null);

      try {
        const response = await reportsService.getDashboard(empresaId, periodo);
        setDashboardMetrics(response.metricas);
      } catch (error: any) {
        console.error('Error al cargar dashboard:', error);
        setErrorDashboard(error.response?.data?.message || 'Error al cargar el dashboard');
      } finally {
        setLoadingDashboard(false);
      }
    },
    [empresaId]
  );

  // ============================================
  // USUARIOS
  // ============================================

  const refreshUsuarios = useCallback(
    async (filters?: any) => {
      if (!empresaId) return;

      setLoadingUsuarios(true);
      setErrorUsuarios(null);

      try {
        const response = await reportsService.getReporteUsuarios(empresaId, filters);
        setUsuariosReport({
          usuarios: response.usuarios,
          estadisticas: response.estadisticas,
        });
      } catch (error: any) {
        console.error('Error al cargar reporte de usuarios:', error);
        setErrorUsuarios(error.response?.data?.message || 'Error al cargar usuarios');
      } finally {
        setLoadingUsuarios(false);
      }
    },
    [empresaId]
  );

  // ============================================
  // PRODUCTOS
  // ============================================

  const refreshProductos = useCallback(
    async (filters?: any) => {
      if (!empresaId) return;

      setLoadingProductos(true);
      setErrorProductos(null);

      try {
        const response = await reportsService.getReporteProductos(empresaId, filters);
        setProductosReport({
          productos: response.productos,
          estadisticas: response.estadisticas,
          por_categoria: response.por_categoria,
        });
      } catch (error: any) {
        console.error('Error al cargar reporte de productos:', error);
        setErrorProductos(error.response?.data?.message || 'Error al cargar productos');
      } finally {
        setLoadingProductos(false);
      }
    },
    [empresaId]
  );

  // ============================================
  // STOCK BAJO
  // ============================================

  const refreshStockBajo = useCallback(
    async (stockMinimo: number = 10) => {
      if (!empresaId) return;

      setLoadingStockBajo(true);
      setErrorStockBajo(null);

      try {
        const response = await reportsService.getReporteStockBajo(empresaId, stockMinimo);
        setStockBajo(response);
      } catch (error: any) {
        console.error('Error al cargar stock bajo:', error);
        setErrorStockBajo(error.response?.data?.message || 'Error al cargar stock bajo');
      } finally {
        setLoadingStockBajo(false);
      }
    },
    [empresaId]
  );

  // ============================================
  // CARGAR DATOS INICIALES
  // ============================================

  useEffect(() => {
    if (empresaId) {
      refreshDashboard();
    }
  }, [empresaId, refreshDashboard]);

  return {
    // Dashboard
    dashboardMetrics,
    loadingDashboard,
    errorDashboard,
    refreshDashboard,

    // Usuarios
    usuariosReport,
    loadingUsuarios,
    errorUsuarios,
    refreshUsuarios,

    // Productos
    productosReport,
    loadingProductos,
    errorProductos,
    refreshProductos,

    // Stock Bajo
    stockBajo,
    loadingStockBajo,
    errorStockBajo,
    refreshStockBajo,
  };
}
