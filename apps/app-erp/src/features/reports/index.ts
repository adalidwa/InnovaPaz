/**
 * 📊 EXPORTACIONES DEL MÓDULO DE REPORTES AVANZADOS
 * Punto de entrada centralizado para todos los componentes y hooks
 */

// Hooks
export { useAdvancedReports } from './hooks/useAdvancedReports';
export type { UseAdvancedReportsReturn } from './hooks/useAdvancedReports';

// Componentes
export { default as ExportButtons } from './components/ExportButtons';
export type { ExportButtonsProps } from './components/ExportButtons';

// Páginas
export { default as AdvancedReportsPage } from './pages/AdvancedReportsPage';

// Servicios - Re-export desde el servicio principal
export { reportsService } from './services/reportsService';
export type {
  VentasReport,
  InventarioReport,
  MovimientosInventarioReport,
  AlertasReport,
} from './services/reportsService';

// Tipos adicionales
export type ReportType = 'ventas' | 'inventario' | 'movimientos' | 'alertas';

// Constantes útiles
export const REPORT_TYPES = {
  VENTAS: 'ventas' as const,
  INVENTARIO: 'inventario' as const,
  MOVIMIENTOS: 'movimientos' as const,
  ALERTAS: 'alertas' as const,
} as const;

export const REPORT_LABELS = {
  [REPORT_TYPES.VENTAS]: 'Ventas',
  [REPORT_TYPES.INVENTARIO]: 'Inventario',
  [REPORT_TYPES.MOVIMIENTOS]: 'Movimientos',
  [REPORT_TYPES.ALERTAS]: 'Alertas',
} as const;
