/**
 * 📊 CONTROLADOR DE EXPORTACIÓN DE REPORTES
 * Maneja la exportación de reportes a PDF y Excel
 */

const PDFDocument = require('pdfkit');
const XLSX = require('xlsx');
const Report = require('../models/report.model');

// ============================================
// EXPORTAR DASHBOARD A PDF
// ============================================
const exportDashboardPDF = async (req, res) => {
  try {
    const { empresa_id, periodo = 'mes_actual' } = req.query;

    if (!empresa_id) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere empresa_id',
      });
    }

    // Obtener datos
    const metricas = await Report.getDashboardMetrics(empresa_id, periodo);

    // Crear PDF
    const doc = new PDFDocument({ margin: 50 });

    // Headers para descarga
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=dashboard-${Date.now()}.pdf`);

    doc.pipe(res);

    // Título
    doc.fontSize(20).text('Dashboard de Reportes', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Período: ${metricas.periodo.nombre}`, { align: 'center' });
    doc.text(`${metricas.periodo.inicio} - ${metricas.periodo.fin}`, { align: 'center' });
    doc.moveDown(2);

    // Sección Usuarios
    doc.fontSize(16).text('Usuarios', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12);
    doc.text(`Total: ${metricas.usuarios.total_usuarios}`);
    doc.text(`Activos: ${metricas.usuarios.usuarios_activos}`);
    doc.text(`Inactivos: ${metricas.usuarios.usuarios_inactivos}`);
    doc.text(`Nuevos en período: ${metricas.usuarios.usuarios_nuevos_periodo}`);
    doc.moveDown();

    // Sección Productos
    doc.fontSize(16).text('Productos', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12);
    doc.text(`Total: ${metricas.productos.total_productos}`);
    doc.text(`Stock bajo: ${metricas.productos.productos_stock_bajo}`);
    doc.text(`Valor inventario: Bs ${parseFloat(metricas.productos.valor_inventario).toFixed(2)}`);
    doc.text(`Promedio stock: ${parseFloat(metricas.productos.promedio_stock).toFixed(2)}`);
    doc.moveDown();

    // Sección Invitaciones
    doc.fontSize(16).text('Invitaciones', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12);
    doc.text(`Pendientes: ${metricas.invitaciones.invitaciones_pendientes}`);
    doc.text(`Aceptadas: ${metricas.invitaciones.invitaciones_aceptadas}`);
    doc.text(`Rechazadas: ${metricas.invitaciones.invitaciones_rechazadas}`);
    doc.text(`Expiradas: ${metricas.invitaciones.invitaciones_expiradas}`);
    doc.moveDown();

    // Sección Roles
    doc.fontSize(16).text('Roles', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12);
    doc.text(`Total: ${metricas.roles.total_roles}`);
    doc.text(`Predeterminados: ${metricas.roles.roles_predeterminados}`);
    doc.text(`Personalizados: ${metricas.roles.roles_personalizados}`);

    // Pie de página
    doc.moveDown(2);
    doc.fontSize(10).text(`Generado: ${new Date().toLocaleString('es-BO')}`, { align: 'center' });

    doc.end();
  } catch (error) {
    console.error('Error exportando dashboard a PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error exportando dashboard',
      error: error.message,
    });
  }
};

// ============================================
// EXPORTAR DASHBOARD A EXCEL
// ============================================
const exportDashboardExcel = async (req, res) => {
  try {
    const { empresa_id, periodo = 'mes_actual' } = req.query;

    if (!empresa_id) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere empresa_id',
      });
    }

    // Obtener datos
    const metricas = await Report.getDashboardMetrics(empresa_id, periodo);

    // Crear libro Excel
    const wb = XLSX.utils.book_new();

    // Hoja de Usuarios
    const usuariosData = [
      ['Métrica', 'Valor'],
      ['Total Usuarios', metricas.usuarios.total_usuarios],
      ['Usuarios Activos', metricas.usuarios.usuarios_activos],
      ['Usuarios Inactivos', metricas.usuarios.usuarios_inactivos],
      ['Nuevos en Período', metricas.usuarios.usuarios_nuevos_periodo],
    ];
    const wsUsuarios = XLSX.utils.aoa_to_sheet(usuariosData);
    XLSX.utils.book_append_sheet(wb, wsUsuarios, 'Usuarios');

    // Hoja de Productos
    const productosData = [
      ['Métrica', 'Valor'],
      ['Total Productos', metricas.productos.total_productos],
      ['Stock Bajo', metricas.productos.productos_stock_bajo],
      ['Valor Inventario', parseFloat(metricas.productos.valor_inventario).toFixed(2)],
      ['Promedio Stock', parseFloat(metricas.productos.promedio_stock).toFixed(2)],
    ];
    const wsProductos = XLSX.utils.aoa_to_sheet(productosData);
    XLSX.utils.book_append_sheet(wb, wsProductos, 'Productos');

    // Hoja de Invitaciones
    const invitacionesData = [
      ['Métrica', 'Valor'],
      ['Pendientes', metricas.invitaciones.invitaciones_pendientes],
      ['Aceptadas', metricas.invitaciones.invitaciones_aceptadas],
      ['Rechazadas', metricas.invitaciones.invitaciones_rechazadas],
      ['Expiradas', metricas.invitaciones.invitaciones_expiradas],
    ];
    const wsInvitaciones = XLSX.utils.aoa_to_sheet(invitacionesData);
    XLSX.utils.book_append_sheet(wb, wsInvitaciones, 'Invitaciones');

    // Hoja de Roles
    const rolesData = [
      ['Métrica', 'Valor'],
      ['Total Roles', metricas.roles.total_roles],
      ['Predeterminados', metricas.roles.roles_predeterminados],
      ['Personalizados', metricas.roles.roles_personalizados],
    ];
    const wsRoles = XLSX.utils.aoa_to_sheet(rolesData);
    XLSX.utils.book_append_sheet(wb, wsRoles, 'Roles');

    // Generar buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Enviar
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename=dashboard-${Date.now()}.xlsx`);
    res.send(buffer);
  } catch (error) {
    console.error('Error exportando dashboard a Excel:', error);
    res.status(500).json({
      success: false,
      message: 'Error exportando dashboard',
      error: error.message,
    });
  }
};

// ============================================
// EXPORTAR PRODUCTOS A PDF
// ============================================
const exportProductosPDF = async (req, res) => {
  try {
    const { empresa_id } = req.query;

    if (!empresa_id) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere empresa_id',
      });
    }

    // Obtener datos
    const reporte = await Report.getProductosReport(empresa_id);

    // Crear PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=productos-${Date.now()}.pdf`);

    doc.pipe(res);

    // Título
    doc.fontSize(18).text('Reporte de Productos', { align: 'center' });
    doc.moveDown(2);

    // Estadísticas
    doc.fontSize(14).text('Estadísticas Generales', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text(`Total Productos: ${reporte.estadisticas.total_productos}`);
    doc.text(`Productos Stock Bajo: ${reporte.estadisticas.productos_stock_bajo}`);
    doc.text(`Total Unidades: ${reporte.estadisticas.total_unidades}`);
    doc.text(
      `Valor Total: Bs ${parseFloat(reporte.estadisticas.valor_total_inventario).toFixed(2)}`
    );
    doc.text(
      `Precio Promedio: Bs ${parseFloat(reporte.estadisticas.precio_promedio_venta).toFixed(2)}`
    );
    doc.moveDown(2);

    // Tabla de productos (primeros 50)
    doc.fontSize(14).text('Productos', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(8);

    const productos = reporte.productos.slice(0, 50);
    let y = doc.y;

    // Encabezados
    doc.text('Código', 50, y, { width: 80, continued: true });
    doc.text('Nombre', 130, y, { width: 150, continued: true });
    doc.text('Stock', 280, y, { width: 60, continued: true, align: 'right' });
    doc.text('Precio', 340, y, { width: 80, continued: false, align: 'right' });

    y += 15;
    doc.moveTo(50, y).lineTo(550, y).stroke();
    y += 5;

    // Datos
    productos.forEach((p) => {
      if (y > 700) {
        doc.addPage();
        y = 50;
      }

      doc.text(p.codigo || '-', 50, y, { width: 80, continued: true });
      doc.text(p.nombre_producto.substring(0, 30), 130, y, { width: 150, continued: true });
      doc.text(p.stock.toString(), 280, y, { width: 60, continued: true, align: 'right' });
      doc.text(`Bs ${parseFloat(p.precio_venta).toFixed(2)}`, 340, y, {
        width: 80,
        continued: false,
        align: 'right',
      });

      y += 20;
    });

    if (reporte.productos.length > 50) {
      doc.moveDown();
      doc
        .fontSize(10)
        .text(`... y ${reporte.productos.length - 50} productos más`, { align: 'center' });
    }

    // Pie
    doc.moveDown(2);
    doc.fontSize(8).text(`Generado: ${new Date().toLocaleString('es-BO')}`, { align: 'center' });

    doc.end();
  } catch (error) {
    console.error('Error exportando productos a PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error exportando productos',
      error: error.message,
    });
  }
};

// ============================================
// EXPORTAR PRODUCTOS A EXCEL
// ============================================
const exportProductosExcel = async (req, res) => {
  try {
    const { empresa_id } = req.query;

    if (!empresa_id) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere empresa_id',
      });
    }

    // Obtener datos
    const reporte = await Report.getProductosReport(empresa_id);

    // Crear libro
    const wb = XLSX.utils.book_new();

    // Hoja de estadísticas
    const statsData = [
      ['Métrica', 'Valor'],
      ['Total Productos', reporte.estadisticas.total_productos],
      ['Stock Bajo', reporte.estadisticas.productos_stock_bajo],
      ['Total Unidades', reporte.estadisticas.total_unidades],
      ['Valor Total', parseFloat(reporte.estadisticas.valor_total_inventario).toFixed(2)],
      ['Precio Promedio', parseFloat(reporte.estadisticas.precio_promedio_venta).toFixed(2)],
      ['Total Vendidos', reporte.estadisticas.total_vendidos],
    ];
    const wsStats = XLSX.utils.aoa_to_sheet(statsData);
    XLSX.utils.book_append_sheet(wb, wsStats, 'Estadísticas');

    // Hoja de productos
    const productosData = reporte.productos.map((p) => ({
      Código: p.codigo,
      Nombre: p.nombre_producto,
      Descripción: p.descripcion,
      Stock: p.stock,
      'Precio Venta': parseFloat(p.precio_venta),
      'Precio Costo': parseFloat(p.precio_costo),
      'Valor Stock': parseFloat(p.valor_stock),
      Categoría: p.nombre_categoria,
      Marca: p.marca_nombre,
      Estado: p.estado_nombre,
      Vendidos: p.cantidad_vendidos,
    }));
    const wsProductos = XLSX.utils.json_to_sheet(productosData);
    XLSX.utils.book_append_sheet(wb, wsProductos, 'Productos');

    // Hoja por categoría
    if (reporte.por_categoria && reporte.por_categoria.length > 0) {
      const categoriaData = reporte.por_categoria.map((c) => ({
        Categoría: c.nombre_categoria,
        'Cantidad Productos': c.cantidad_productos,
        'Stock Total': c.total_stock,
        Valor: parseFloat(c.valor_categoria).toFixed(2),
      }));
      const wsCategoria = XLSX.utils.json_to_sheet(categoriaData);
      XLSX.utils.book_append_sheet(wb, wsCategoria, 'Por Categoría');
    }

    // Generar buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Enviar
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename=productos-${Date.now()}.xlsx`);
    res.send(buffer);
  } catch (error) {
    console.error('Error exportando productos a Excel:', error);
    res.status(500).json({
      success: false,
      message: 'Error exportando productos',
      error: error.message,
    });
  }
};

// ============================================
// EXPORTAR USUARIOS A EXCEL
// ============================================
const exportUsuariosExcel = async (req, res) => {
  try {
    const { empresa_id } = req.query;

    if (!empresa_id) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere empresa_id',
      });
    }

    // Obtener datos
    const reporte = await Report.getUsuariosReport(empresa_id);

    // Crear libro
    const wb = XLSX.utils.book_new();

    // Hoja de estadísticas
    const statsData = [
      ['Métrica', 'Valor'],
      ['Total Usuarios', reporte.estadisticas.total],
      ['Activos', reporte.estadisticas.activos],
      ['Inactivos', reporte.estadisticas.inactivos],
    ];
    const wsStats = XLSX.utils.aoa_to_sheet(statsData);
    XLSX.utils.book_append_sheet(wb, wsStats, 'Estadísticas');

    // Hoja de usuarios
    const usuariosData = reporte.usuarios.map((u) => ({
      UID: u.uid,
      Nombre: u.nombre_completo,
      Email: u.email,
      Estado: u.estado,
      Rol: u.rol_nombre,
      'Tipo Rol': u.tipo_rol,
      'Fecha Creación': u.fecha_creacion,
    }));
    const wsUsuarios = XLSX.utils.json_to_sheet(usuariosData);
    XLSX.utils.book_append_sheet(wb, wsUsuarios, 'Usuarios');

    // Generar buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Enviar
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename=usuarios-${Date.now()}.xlsx`);
    res.send(buffer);
  } catch (error) {
    console.error('Error exportando usuarios a Excel:', error);
    res.status(500).json({
      success: false,
      message: 'Error exportando usuarios',
      error: error.message,
    });
  }
};

module.exports = {
  exportDashboardPDF,
  exportDashboardExcel,
  exportProductosPDF,
  exportProductosExcel,
  exportUsuariosExcel,
};
