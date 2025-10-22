const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reports.controller');
const exportController = require('../controllers/reports.export.controller');

// ============================================
// CRUD DE REPORTES GUARDADOS
// ============================================

/**
 * @route   GET /api/reports
 * @desc    Obtener todos los reportes de una empresa con filtros opcionales
 * @access  Private
 * @query   empresa_id (required), tipo_reporte, categoria, es_favorito, es_publico, usuario_id
 */
router.get('/', reportsController.getReportes);

/**
 * @route   GET /api/reports/:id
 * @desc    Obtener un reporte específico por ID
 * @access  Private
 */
router.get('/:id', reportsController.getReporte);

/**
 * @route   POST /api/reports
 * @desc    Crear un nuevo reporte
 * @access  Private
 * @body    empresa_id, usuario_id, nombre_reporte, tipo_reporte, descripcion, categoria, parametros, configuracion
 */
router.post('/', reportsController.createReporte);

/**
 * @route   PUT /api/reports/:id
 * @desc    Actualizar un reporte existente
 * @access  Private
 */
router.put('/:id', reportsController.updateReporte);

/**
 * @route   DELETE /api/reports/:id
 * @desc    Eliminar un reporte
 * @access  Private
 */
router.delete('/:id', reportsController.deleteReporte);

/**
 * @route   PATCH /api/reports/:id/favorito
 * @desc    Marcar/Desmarcar reporte como favorito
 * @access  Private
 */
router.patch('/:id/favorito', reportsController.toggleFavorito);

/**
 * @route   GET /api/reports/:id/historial
 * @desc    Obtener historial de ejecuciones de un reporte
 * @access  Private
 * @query   limite (default: 50)
 */
router.get('/:id/historial', reportsController.getHistorialReporte);

// ============================================
// GENERACIÓN DE REPORTES DINÁMICOS
// ============================================

/**
 * @route   GET /api/reports/generate/dashboard
 * @desc    Generar dashboard general con métricas clave
 * @access  Private
 * @query   empresa_id (required), periodo (default: 'mes_actual')
 * @periodo hoy, semana_actual, mes_actual, mes_anterior, trimestre_actual, año_actual, ultimos_7_dias, ultimos_30_dias
 */
router.get('/generate/dashboard', reportsController.getDashboard);

/**
 * @route   GET /api/reports/generate/usuarios
 * @desc    Generar reporte de usuarios
 * @access  Private
 * @query   empresa_id (required), estado, rol_id, plantilla_rol_id, fecha_desde, fecha_hasta
 */
router.get('/generate/usuarios', reportsController.getReporteUsuarios);

/**
 * @route   GET /api/reports/generate/productos
 * @desc    Generar reporte de productos/inventario
 * @access  Private
 * @query   empresa_id (required), categoria_id, marca_id, estado_id, stock_minimo, ordenar_por, orden
 */
router.get('/generate/productos', reportsController.getReporteProductos);

/**
 * @route   GET /api/reports/generate/stock-bajo
 * @desc    Generar reporte de productos con stock bajo (alerta)
 * @access  Private
 * @query   empresa_id (required), stock_minimo (default: 10)
 */
router.get('/generate/stock-bajo', reportsController.getReporteStockBajo);

/**
 * @route   GET /api/reports/generate/invitaciones
 * @desc    Generar reporte de invitaciones
 * @access  Private
 * @query   empresa_id (required), estado, fecha_desde, fecha_hasta
 */
router.get('/generate/invitaciones', reportsController.getReporteInvitaciones);

/**
 * @route   GET /api/reports/generate/roles
 * @desc    Generar reporte de roles y permisos
 * @access  Private
 * @query   empresa_id (required)
 */
router.get('/generate/roles', reportsController.getReporteRoles);

/**
 * @route   GET /api/reports/generate/ventas
 * @desc    Generar reporte completo de ventas
 * @access  Private
 * @query   empresa_id (required), fecha_desde, fecha_hasta, cliente_id, vendedor_id, metodo_pago_id, estado_venta_id, monto_minimo, monto_maximo
 */
router.get('/generate/ventas', reportsController.getReporteVentas);

/**
 * @route   GET /api/reports/generate/inventario
 * @desc    Generar reporte completo de inventario
 * @access  Private
 * @query   empresa_id (required), categoria_id, marca_id, estado_id, stock_minimo, almacen_id
 */
router.get('/generate/inventario', reportsController.getReporteInventario);

/**
 * @route   GET /api/reports/generate/movimientos-inventario
 * @desc    Generar reporte de movimientos de inventario
 * @access  Private
 * @query   empresa_id (required), fecha_desde, fecha_hasta, producto_id, tipo_movimiento_id, almacen_id, entidad_tipo
 */
router.get('/generate/movimientos-inventario', reportsController.getReporteMovimientosInventario);

/**
 * @route   GET /api/reports/generate/alertas
 * @desc    Generar reporte de alertas (stock bajo y productos próximos a vencer)
 * @access  Private
 * @query   empresa_id (required), stock_minimo (default: 10)
 */
router.get('/generate/alertas', reportsController.getReporteAlertas);

// ============================================
// EXPORTACIÓN DE REPORTES
// ============================================

/**
 * @route   GET /api/reports/export/dashboard/pdf
 * @desc    Exportar dashboard a PDF
 * @access  Private
 * @query   empresa_id (required), periodo (default: 'mes_actual')
 */
router.get('/export/dashboard/pdf', exportController.exportDashboardPDF);

/**
 * @route   GET /api/reports/export/dashboard/excel
 * @desc    Exportar dashboard a Excel
 * @access  Private
 * @query   empresa_id (required), periodo (default: 'mes_actual')
 */
router.get('/export/dashboard/excel', exportController.exportDashboardExcel);

/**
 * @route   GET /api/reports/export/productos/pdf
 * @desc    Exportar productos a PDF
 * @access  Private
 * @query   empresa_id (required)
 */
router.get('/export/productos/pdf', exportController.exportProductosPDF);

/**
 * @route   GET /api/reports/export/productos/excel
 * @desc    Exportar productos a Excel
 * @access  Private
 * @query   empresa_id (required)
 */
router.get('/export/productos/excel', exportController.exportProductosExcel);

/**
 * @route   GET /api/reports/export/usuarios/excel
 * @desc    Exportar usuarios a Excel
 * @access  Private
 * @query   empresa_id (required)
 */
router.get('/export/usuarios/excel', exportController.exportUsuariosExcel);

/**
 * @route   GET /api/reports/export/ventas/pdf
 * @desc    Exportar ventas a PDF
 * @access  Private
 * @query   empresa_id (required), fecha_desde, fecha_hasta, cliente_id, vendedor_id, metodo_pago_id
 */
router.get('/export/ventas/pdf', exportController.exportVentasPDF);

/**
 * @route   GET /api/reports/export/ventas/excel
 * @desc    Exportar ventas a Excel
 * @access  Private
 * @query   empresa_id (required), fecha_desde, fecha_hasta, cliente_id, vendedor_id, metodo_pago_id
 */
router.get('/export/ventas/excel', exportController.exportVentasExcel);

/**
 * @route   GET /api/reports/export/inventario/pdf
 * @desc    Exportar inventario a PDF
 * @access  Private
 * @query   empresa_id (required), categoria_id, marca_id, estado_id, stock_minimo, almacen_id
 */
router.get('/export/inventario/pdf', exportController.exportInventarioPDF);

/**
 * @route   GET /api/reports/export/inventario/excel
 * @desc    Exportar inventario a Excel
 * @access  Private
 * @query   empresa_id (required), categoria_id, marca_id, estado_id, stock_minimo, almacen_id
 */
router.get('/export/inventario/excel', exportController.exportInventarioExcel);

/**
 * @route   GET /api/reports/export/movimientos-inventario/pdf
 * @desc    Exportar movimientos de inventario a PDF
 * @access  Private
 * @query   empresa_id (required), fecha_desde, fecha_hasta, producto_id, tipo_movimiento_id, almacen_id
 */
router.get('/export/movimientos-inventario/pdf', exportController.exportMovimientosPDF);

/**
 * @route   GET /api/reports/export/movimientos-inventario/excel
 * @desc    Exportar movimientos de inventario a Excel
 * @access  Private
 * @query   empresa_id (required), fecha_desde, fecha_hasta, producto_id, tipo_movimiento_id, almacen_id
 */
router.get('/export/movimientos-inventario/excel', exportController.exportMovimientosExcel);

/**
 * @route   GET /api/reports/export/alertas/pdf
 * @desc    Exportar alertas del sistema a PDF
 * @access  Private
 * @query   empresa_id (required), stock_minimo (default: 10)
 */
router.get('/export/alertas/pdf', exportController.exportAlertasPDF);

/**
 * @route   GET /api/reports/export/alertas/excel
 * @desc    Exportar alertas del sistema a Excel
 * @access  Private
 * @query   empresa_id (required), stock_minimo (default: 10)
 */
router.get('/export/alertas/excel', exportController.exportAlertasExcel);

/**
 * @route   POST /api/reports/export
 * @desc    Exportar reporte a diferentes formatos (PDF, Excel, CSV) - LEGACY
 * @access  Private
 * @body    tipo_reporte, parametros, formato (json, pdf, excel, csv)
 * @note    Funcionalidad en desarrollo - actualmente solo soporta JSON
 */
router.post('/export', reportsController.exportarReporte);

module.exports = router;
