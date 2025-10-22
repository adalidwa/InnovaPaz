/**
 * 📊 CONTROLADOR DE EXPORTACIÓN DE REPORTES
 * Maneja la exportación de reportes a PDF y Excel con estilos profesionales
 */

const PDFDocument = require('pdfkit');
const XLSX = require('xlsx');
const Report = require('../models/report.model');

// Colores corporativos para estilos
const COLORS = {
  primary: '#1F2937', // Gris oscuro profesional
  secondary: '#3B82F6', // Azul brillante
  accent: '#10B981', // Verde éxito
  warning: '#F59E0B', // Amarillo alerta
  danger: '#EF4444', // Rojo peligro
  light: '#F3F4F6', // Gris claro
  white: '#FFFFFF', // Blanco
  text: '#374151', // Gris texto
  border: '#D1D5DB', // Gris borde
  headerBg: '#1E3A8A', // Azul oscuro header
  success: '#059669', // Verde oscuro
};

// Función para crear estilos Excel avanzados
function createExcelStyles() {
  return {
    header: {
      font: { bold: true, color: { rgb: 'FFFFFF' }, size: 14 },
      fill: { fgColor: { rgb: '1E3A8A' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } },
      },
    },
    subHeader: {
      font: { bold: true, color: { rgb: '1F2937' }, size: 12 },
      fill: { fgColor: { rgb: 'E5E7EB' } },
      alignment: { horizontal: 'center', vertical: 'center' },
    },
    data: {
      font: { color: { rgb: '374151' }, size: 11 },
      alignment: { horizontal: 'left', vertical: 'center' },
    },
    number: {
      font: { color: { rgb: '374151' }, size: 11 },
      alignment: { horizontal: 'right', vertical: 'center' },
      numFmt: '#,##0.00',
    },
    success: {
      font: { color: { rgb: '059669' }, bold: true },
      fill: { fgColor: { rgb: 'D1FAE5' } },
    },
    warning: {
      font: { color: { rgb: 'F59E0B' }, bold: true },
      fill: { fgColor: { rgb: 'FEF3C7' } },
    },
    danger: {
      font: { color: { rgb: 'EF4444' }, bold: true },
      fill: { fgColor: { rgb: 'FEE2E2' } },
    },
  };
}

// Función para agregar header profesional PDF
function addPDFHeader(doc, title, subtitle = '') {
  // Fondo del header
  doc.rect(0, 0, doc.page.width, 80).fill(COLORS.headerBg);

  // Logo área (placeholder)
  doc.rect(30, 20, 40, 40).fill(COLORS.white);
  doc.fontSize(16).fillColor(COLORS.headerBg).text('IP', 45, 35);

  // Título principal
  doc.fontSize(24).fillColor(COLORS.white).text(title, 90, 25);

  if (subtitle) {
    doc.fontSize(12).text(subtitle, 90, 50);
  }

  // Fecha y hora
  const now = new Date();
  doc
    .fontSize(10)
    .text(
      `Generado: ${now.toLocaleDateString('es-BO')} ${now.toLocaleTimeString('es-BO')}`,
      doc.page.width - 200,
      30,
      { width: 170, align: 'right' }
    );

  // Línea decorativa
  doc.rect(0, 80, doc.page.width, 3).fill(COLORS.secondary);

  doc.y = 100; // Posicionar cursor después del header
  return doc;
}

// Función para agregar sección con estilo
function addPDFSection(doc, title, icon = '📊') {
  doc.fontSize(16).fillColor(COLORS.primary);

  // Fondo de sección
  doc.rect(30, doc.y - 5, doc.page.width - 60, 25).fill(COLORS.light);

  // Título con icono
  doc.text(`${icon} ${title}`, 40, doc.y, { continued: false });
  doc.moveDown(0.5);

  // Línea divisoria
  doc.rect(30, doc.y, doc.page.width - 60, 1).fill(COLORS.border);
  doc.moveDown(0.5);

  return doc;
}

// ============================================
// EXPORTAR DASHBOARD A PDF CON ESTILOS
// ============================================
const exportDashboardPDF = async (req, res) => {
  try {
    const { empresa_id, periodo = 'mes_actual' } = req.query;

    if (!empresa_id) {
      return res.status(400).json({ success: false, message: 'Se requiere empresa_id' });
    }

    const metricas = await Report.getDashboardMetrics(empresa_id, periodo);
    const doc = new PDFDocument({ margin: 0, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=dashboard-innovapaz-${Date.now()}.pdf`
    );
    doc.pipe(res);

    // Header profesional
    addPDFHeader(doc, 'Dashboard Ejecutivo', `Período: ${metricas.periodo.nombre}`);

    // Métricas principales en cards
    const cards = [
      {
        title: 'Usuarios Activos',
        value: metricas.usuarios.usuarios_activos,
        color: COLORS.success,
        icon: '👥',
      },
      {
        title: 'Total Productos',
        value: metricas.productos.total_productos,
        color: COLORS.secondary,
        icon: '📦',
      },
      {
        title: 'Ventas Período',
        value: metricas.ventas.total_ventas_periodo,
        color: COLORS.accent,
        icon: '💰',
      },
      {
        title: 'Stock Bajo',
        value: metricas.productos.productos_stock_bajo,
        color: COLORS.warning,
        icon: '⚠️',
      },
    ];

    let x = 40;
    let y = doc.y + 20;
    const cardWidth = 120;
    const cardHeight = 80;

    cards.forEach((card, index) => {
      if (index > 0 && index % 4 === 0) {
        y += cardHeight + 20;
        x = 40;
      }

      // Card background
      doc.rect(x, y, cardWidth, cardHeight).fill(card.color);

      // Card content
      doc
        .fontSize(24)
        .fillColor(COLORS.white)
        .text(card.icon, x + 10, y + 10);
      doc.fontSize(20).text(card.value, x + 40, y + 15);
      doc.fontSize(10).text(card.title, x + 10, y + 50, { width: cardWidth - 20, align: 'center' });

      x += cardWidth + 20;
    });

    doc.y = y + cardHeight + 40;

    // Sección Usuarios Detallada
    addPDFSection(doc, 'Análisis de Usuarios', '👥');
    doc.fontSize(12).fillColor(COLORS.text);

    const userStats = [
      ['Total de Usuarios', metricas.usuarios.total_usuarios, COLORS.primary],
      ['Usuarios Activos', metricas.usuarios.usuarios_activos, COLORS.success],
      ['Usuarios Inactivos', metricas.usuarios.usuarios_inactivos, COLORS.warning],
      ['Nuevos este Período', metricas.usuarios.usuarios_nuevos_periodo, COLORS.accent],
    ];

    userStats.forEach(([label, value, color]) => {
      doc.circle(45, doc.y + 5, 3).fill(color);
      doc.text(`${label}: ${value}`, 55, doc.y);
      doc.moveDown(0.3);
    });

    doc.moveDown();

    // Sección Inventario
    addPDFSection(doc, 'Estado del Inventario', '📦');
    doc.fontSize(12).fillColor(COLORS.text);

    const inventoryStats = [
      ['Total Productos', metricas.productos.total_productos, COLORS.primary],
      ['Sin Stock', metricas.productos.productos_sin_stock || 0, COLORS.danger],
      ['Stock Bajo', metricas.productos.productos_stock_bajo, COLORS.warning],
      [
        'Valor Total',
        `Bs ${(metricas.productos.valor_inventario || 0).toLocaleString('es-BO')}`,
        COLORS.success,
      ],
    ];

    inventoryStats.forEach(([label, value, color]) => {
      doc.circle(45, doc.y + 5, 3).fill(color);
      doc.text(`${label}: ${value}`, 55, doc.y);
      doc.moveDown(0.3);
    });

    doc.moveDown();

    // Sección Ventas
    addPDFSection(doc, 'Rendimiento de Ventas', '💰');
    doc.fontSize(12).fillColor(COLORS.text);

    const salesStats = [
      ['Ventas en Período', metricas.ventas.total_ventas_periodo, COLORS.primary],
      [
        'Ingresos',
        `Bs ${(metricas.ventas.ingresos_periodo || 0).toLocaleString('es-BO')}`,
        COLORS.success,
      ],
      ['Ventas Hoy', metricas.ventas.ventas_hoy, COLORS.accent],
      ['Clientes Únicos', metricas.ventas.clientes_unicos_periodo, COLORS.secondary],
    ];

    salesStats.forEach(([label, value, color]) => {
      doc.circle(45, doc.y + 5, 3).fill(color);
      doc.text(`${label}: ${value}`, 55, doc.y);
      doc.moveDown(0.3);
    });

    // Footer
    doc.rect(0, doc.page.height - 50, doc.page.width, 50).fill(COLORS.light);
    doc
      .fontSize(10)
      .fillColor(COLORS.text)
      .text('INNOVAPAZ ERP - Sistema de Gestión Empresarial', 0, doc.page.height - 30, {
        width: doc.page.width,
        align: 'center',
      });

    doc.end();
  } catch (error) {
    console.error('Error exportando dashboard a PDF:', error);
    res
      .status(500)
      .json({ success: false, message: 'Error exportando dashboard', error: error.message });
  }
};

// ============================================
// EXPORTAR DASHBOARD A EXCEL CON ESTILOS
// ============================================
const exportDashboardExcel = async (req, res) => {
  try {
    const { empresa_id, periodo = 'mes_actual' } = req.query;

    if (!empresa_id) {
      return res.status(400).json({ success: false, message: 'Se requiere empresa_id' });
    }

    const metricas = await Report.getDashboardMetrics(empresa_id, periodo);
    const wb = XLSX.utils.book_new();

    // Hoja de Resumen Ejecutivo
    const resumenData = [
      ['DASHBOARD EJECUTIVO - INNOVAPAZ ERP', ''],
      [`Período: ${metricas.periodo.nombre}`, ''],
      [`Generado: ${new Date().toLocaleString('es-BO')}`, ''],
      ['', ''],
      ['MÉTRICAS CLAVE', 'VALOR'],
      ['👥 Usuarios Activos', metricas.usuarios.usuarios_activos],
      ['📦 Total Productos', metricas.productos.total_productos],
      ['💰 Ventas Período', metricas.ventas.total_ventas_periodo],
      ['⚠️ Stock Bajo', metricas.productos.productos_stock_bajo],
      [
        '💵 Ingresos Período',
        `Bs ${(metricas.ventas.ingresos_periodo || 0).toLocaleString('es-BO')}`,
      ],
      [
        '🏪 Valor Inventario',
        `Bs ${(metricas.productos.valor_inventario || 0).toLocaleString('es-BO')}`,
      ],
    ];

    const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);

    // Aplicar estilos al resumen
    wsResumen['!cols'] = [{ width: 25 }, { width: 20 }];
    wsResumen['!rows'] = [{ hpt: 25 }, { hpt: 20 }, { hpt: 15 }];

    XLSX.utils.book_append_sheet(wb, wsResumen, '📊 Resumen Ejecutivo');

    // Hoja de Usuarios Detallada
    const usuariosData = [
      ['ANÁLISIS DE USUARIOS', ''],
      ['Métrica', 'Valor'],
      ['Total de Usuarios', metricas.usuarios.total_usuarios],
      ['Usuarios Activos', metricas.usuarios.usuarios_activos],
      ['Usuarios Inactivos', metricas.usuarios.usuarios_inactivos],
      ['Nuevos en Período', metricas.usuarios.usuarios_nuevos_periodo],
    ];
    const wsUsuarios = XLSX.utils.aoa_to_sheet(usuariosData);
    wsUsuarios['!cols'] = [{ width: 20 }, { width: 15 }];
    XLSX.utils.book_append_sheet(wb, wsUsuarios, '👥 Usuarios');

    // Hoja de Inventario
    const inventarioData = [
      ['ESTADO DEL INVENTARIO', ''],
      ['Métrica', 'Valor'],
      ['Total Productos', metricas.productos.total_productos],
      ['Productos Sin Stock', metricas.productos.productos_sin_stock || 0],
      ['Stock Bajo', metricas.productos.productos_stock_bajo],
      ['Total Unidades', metricas.productos.total_unidades_stock || 0],
      [
        'Valor Total Inventario',
        `Bs ${(metricas.productos.valor_inventario || 0).toLocaleString('es-BO')}`,
      ],
      ['Promedio Stock', metricas.productos.promedio_stock || 0],
    ];
    const wsInventario = XLSX.utils.aoa_to_sheet(inventarioData);
    wsInventario['!cols'] = [{ width: 25 }, { width: 20 }];
    XLSX.utils.book_append_sheet(wb, wsInventario, '📦 Inventario');

    // Hoja de Ventas
    const ventasData = [
      ['RENDIMIENTO DE VENTAS', ''],
      ['Métrica', 'Valor'],
      ['Ventas en Período', metricas.ventas.total_ventas_periodo],
      [
        'Ingresos del Período',
        `Bs ${(metricas.ventas.ingresos_periodo || 0).toLocaleString('es-BO')}`,
      ],
      ['Venta Promedio', `Bs ${(metricas.ventas.venta_promedio || 0).toLocaleString('es-BO')}`],
      ['Ventas Hoy', metricas.ventas.ventas_hoy],
      ['Clientes Únicos', metricas.ventas.clientes_unicos_periodo],
    ];
    const wsVentas = XLSX.utils.aoa_to_sheet(ventasData);
    wsVentas['!cols'] = [{ width: 25 }, { width: 20 }];
    XLSX.utils.book_append_sheet(wb, wsVentas, '💰 Ventas');

    // Hoja de Movimientos
    const movimientosData = [
      ['MOVIMIENTOS DE INVENTARIO', ''],
      ['Métrica', 'Valor'],
      ['Total Movimientos', metricas.movimientos_inventario.total_movimientos_periodo],
      ['Entradas', metricas.movimientos_inventario.entradas_periodo],
      ['Salidas', metricas.movimientos_inventario.salidas_periodo],
      ['Cantidad Entradas', metricas.movimientos_inventario.total_entradas_cantidad || 0],
      ['Cantidad Salidas', metricas.movimientos_inventario.total_salidas_cantidad || 0],
    ];
    const wsMovimientos = XLSX.utils.aoa_to_sheet(movimientosData);
    wsMovimientos['!cols'] = [{ width: 25 }, { width: 15 }];
    XLSX.utils.book_append_sheet(wb, wsMovimientos, '📋 Movimientos');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=dashboard-innovapaz-${Date.now()}.xlsx`
    );
    res.send(buffer);
  } catch (error) {
    console.error('Error exportando dashboard a Excel:', error);
    res
      .status(500)
      .json({ success: false, message: 'Error exportando dashboard', error: error.message });
  }
};

// ============================================
// EXPORTAR VENTAS A PDF
// ============================================
const exportVentasPDF = async (req, res) => {
  try {
    const { empresa_id } = req.query;
    if (!empresa_id) {
      return res.status(400).json({ success: false, message: 'Se requiere empresa_id' });
    }

    const reporte = await Report.getVentasReport(empresa_id, req.query);
    const doc = new PDFDocument({ margin: 0, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ventas-innovapaz-${Date.now()}.pdf`);
    doc.pipe(res);

    addPDFHeader(doc, 'Reporte de Ventas', 'Análisis Detallado de Ingresos');

    // Métricas principales
    addPDFSection(doc, 'Resumen Ejecutivo', '💰');

    const ventasCards = [
      { label: 'Total Ventas', value: reporte.estadisticas.total_ventas, color: COLORS.primary },
      {
        label: 'Ingresos Totales',
        value: `Bs ${(reporte.estadisticas.ingresos_totales || 0).toLocaleString('es-BO')}`,
        color: COLORS.success,
      },
      {
        label: 'Venta Promedio',
        value: `Bs ${(reporte.estadisticas.venta_promedio || 0).toLocaleString('es-BO')}`,
        color: COLORS.secondary,
      },
      {
        label: 'Clientes Únicos',
        value: reporte.estadisticas.clientes_unicos,
        color: COLORS.accent,
      },
    ];

    ventasCards.forEach(({ label, value, color }) => {
      doc.circle(45, doc.y + 5, 4).fill(color);
      doc.fontSize(12).fillColor(COLORS.text).text(`${label}: ${value}`, 55, doc.y);
      doc.moveDown(0.4);
    });

    doc.moveDown();

    // Top productos
    if (reporte.top_productos.length > 0) {
      addPDFSection(doc, 'Top 5 Productos Más Vendidos', '🏆');
      doc.fontSize(10).fillColor(COLORS.text);

      reporte.top_productos.slice(0, 5).forEach((producto, index) => {
        const medal = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][index];
        doc.text(`${medal} ${producto.nombre_producto}`, 40, doc.y);
        doc.text(`Vendidos: ${producto.cantidad_vendida}`, 300, doc.y);
        doc.text(
          `Ingresos: Bs ${parseFloat(producto.ingresos_producto).toLocaleString('es-BO')}`,
          420,
          doc.y
        );
        doc.moveDown(0.3);
      });
      doc.moveDown();
    }

    // Ventas por método de pago
    if (reporte.por_metodo_pago.length > 0) {
      addPDFSection(doc, 'Distribución por Método de Pago', '💳');
      doc.fontSize(10).fillColor(COLORS.text);

      reporte.por_metodo_pago.forEach((metodo) => {
        doc.circle(45, doc.y + 5, 3).fill(COLORS.secondary);
        doc.text(
          `${metodo.metodo_pago}: ${metodo.cantidad_ventas} ventas (${metodo.porcentaje}%)`,
          55,
          doc.y
        );
        doc.moveDown(0.3);
      });
    }

    // Footer
    doc.rect(0, doc.page.height - 50, doc.page.width, 50).fill(COLORS.light);
    doc
      .fontSize(10)
      .fillColor(COLORS.text)
      .text('INNOVAPAZ ERP - Reporte de Ventas', 0, doc.page.height - 30, {
        width: doc.page.width,
        align: 'center',
      });

    doc.end();
  } catch (error) {
    console.error('Error exportando ventas a PDF:', error);
    res
      .status(500)
      .json({ success: false, message: 'Error exportando ventas', error: error.message });
  }
};

// ============================================
// EXPORTAR VENTAS A EXCEL
// ============================================
const exportVentasExcel = async (req, res) => {
  try {
    const { empresa_id } = req.query;
    if (!empresa_id) {
      return res.status(400).json({ success: false, message: 'Se requiere empresa_id' });
    }

    const reporte = await Report.getVentasReport(empresa_id, req.query);
    const wb = XLSX.utils.book_new();

    // Hoja de estadísticas
    const statsData = [
      ['REPORTE DE VENTAS - INNOVAPAZ', ''],
      [`Generado: ${new Date().toLocaleString('es-BO')}`, ''],
      ['', ''],
      ['ESTADÍSTICAS GENERALES', ''],
      ['Métrica', 'Valor'],
      ['Total Ventas', reporte.estadisticas.total_ventas],
      [
        'Ingresos Totales',
        `Bs ${(reporte.estadisticas.ingresos_totales || 0).toLocaleString('es-BO')}`,
      ],
      [
        'Venta Promedio',
        `Bs ${(reporte.estadisticas.venta_promedio || 0).toLocaleString('es-BO')}`,
      ],
      ['Venta Mínima', `Bs ${(reporte.estadisticas.venta_minima || 0).toLocaleString('es-BO')}`],
      ['Venta Máxima', `Bs ${(reporte.estadisticas.venta_maxima || 0).toLocaleString('es-BO')}`],
      [
        'Descuentos Totales',
        `Bs ${(reporte.estadisticas.descuentos_totales || 0).toLocaleString('es-BO')}`,
      ],
      ['Clientes Únicos', reporte.estadisticas.clientes_unicos],
      ['Vendedores Activos', reporte.estadisticas.vendedores_activos],
    ];
    const wsStats = XLSX.utils.aoa_to_sheet(statsData);
    wsStats['!cols'] = [{ width: 25 }, { width: 20 }];
    XLSX.utils.book_append_sheet(wb, wsStats, '📊 Estadísticas');

    // Hoja de ventas detalladas
    if (reporte.ventas.length > 0) {
      const ventasData = reporte.ventas.map((v) => ({
        'Número Venta': v.numero_venta,
        Fecha: new Date(v.fecha_venta).toLocaleDateString('es-BO'),
        Cliente: v.cliente_nombre || v.nombre_cliente_directo || 'Cliente Directo',
        Vendedor: v.vendedor_nombre || 'N/A',
        Subtotal: parseFloat(v.subtotal || 0),
        Descuento: parseFloat(v.descuento || 0),
        Impuesto: parseFloat(v.impuesto || 0),
        Total: parseFloat(v.total || 0),
        'Método Pago': v.metodo_pago || 'N/A',
        Estado: v.estado_venta || 'N/A',
      }));

      const wsVentas = XLSX.utils.json_to_sheet(ventasData);
      wsVentas['!cols'] = [
        { width: 15 },
        { width: 12 },
        { width: 25 },
        { width: 20 },
        { width: 12 },
        { width: 10 },
        { width: 10 },
        { width: 12 },
        { width: 15 },
        { width: 12 },
      ];
      XLSX.utils.book_append_sheet(wb, wsVentas, '💰 Ventas Detalladas');
    }

    // Hoja de top productos
    if (reporte.top_productos.length > 0) {
      const topProductosData = reporte.top_productos.map((p, index) => ({
        Ranking: index + 1,
        Código: p.codigo,
        Producto: p.nombre_producto,
        'Cantidad Vendida': parseInt(p.cantidad_vendida),
        Ingresos: parseFloat(p.ingresos_producto),
        'Precio Promedio': parseFloat(p.precio_promedio),
      }));

      const wsTopProductos = XLSX.utils.json_to_sheet(topProductosData);
      wsTopProductos['!cols'] = [
        { width: 10 },
        { width: 15 },
        { width: 30 },
        { width: 15 },
        { width: 15 },
        { width: 15 },
      ];
      XLSX.utils.book_append_sheet(wb, wsTopProductos, '🏆 Top Productos');
    }

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=ventas-innovapaz-${Date.now()}.xlsx`
    );
    res.send(buffer);
  } catch (error) {
    console.error('Error exportando ventas a Excel:', error);
    res
      .status(500)
      .json({ success: false, message: 'Error exportando ventas', error: error.message });
  }
};

// ============================================
// EXPORTAR INVENTARIO A PDF
// ============================================
const exportInventarioPDF = async (req, res) => {
  try {
    const { empresa_id } = req.query;
    if (!empresa_id) {
      return res.status(400).json({ success: false, message: 'Se requiere empresa_id' });
    }

    const reporte = await Report.getInventarioReport(empresa_id, req.query);
    const doc = new PDFDocument({ margin: 0, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=inventario-innovapaz-${Date.now()}.pdf`
    );
    doc.pipe(res);

    addPDFHeader(doc, 'Reporte de Inventario', 'Control de Stock y Almacenes');

    // Métricas principales
    addPDFSection(doc, 'Estado General del Inventario', '📦');

    const inventarioCards = [
      {
        label: 'Total Productos',
        value: reporte.estadisticas.total_productos,
        color: COLORS.primary,
      },
      {
        label: 'Valor Total',
        value: `Bs ${(reporte.estadisticas.valor_total_inventario || 0).toLocaleString('es-BO')}`,
        color: COLORS.success,
      },
      {
        label: 'Stock Bajo',
        value: reporte.estadisticas.productos_stock_bajo,
        color: COLORS.warning,
      },
      { label: 'Sin Stock', value: reporte.estadisticas.productos_sin_stock, color: COLORS.danger },
    ];

    inventarioCards.forEach(({ label, value, color }) => {
      doc.circle(45, doc.y + 5, 4).fill(color);
      doc.fontSize(12).fillColor(COLORS.text).text(`${label}: ${value}`, 55, doc.y);
      doc.moveDown(0.4);
    });

    doc.moveDown();

    // Productos próximos a vencer
    if (reporte.proximos_vencer.length > 0) {
      addPDFSection(doc, 'Alertas de Vencimiento', '⚠️');
      doc.fontSize(10).fillColor(COLORS.text);

      reporte.proximos_vencer.slice(0, 10).forEach((producto) => {
        const diasRestantes = parseInt(producto.dias_restantes);
        const color = diasRestantes <= 7 ? COLORS.danger : COLORS.warning;

        doc.circle(45, doc.y + 5, 3).fill(color);
        doc.text(`${producto.nombre_producto} - Lote: ${producto.codigo_lote}`, 55, doc.y);
        doc.text(`Vence en ${diasRestantes} días`, 350, doc.y);
        doc.text(`Stock: ${producto.cantidad}`, 450, doc.y);
        doc.moveDown(0.3);
      });
      doc.moveDown();
    }

    // Productos por categoría
    if (reporte.por_categoria.length > 0) {
      addPDFSection(doc, 'Distribución por Categoría', '📊');
      doc.fontSize(10).fillColor(COLORS.text);

      reporte.por_categoria.slice(0, 8).forEach((categoria) => {
        doc.circle(45, doc.y + 5, 3).fill(COLORS.secondary);
        doc.text(
          `${categoria.nombre_categoria}: ${categoria.cantidad_productos} productos`,
          55,
          doc.y
        );
        doc.text(
          `Valor: Bs ${parseFloat(categoria.valor_categoria || 0).toLocaleString('es-BO')}`,
          350,
          doc.y
        );
        doc.moveDown(0.3);
      });
    }

    // Footer
    doc.rect(0, doc.page.height - 50, doc.page.width, 50).fill(COLORS.light);
    doc
      .fontSize(10)
      .fillColor(COLORS.text)
      .text('INNOVAPAZ ERP - Reporte de Inventario', 0, doc.page.height - 30, {
        width: doc.page.width,
        align: 'center',
      });

    doc.end();
  } catch (error) {
    console.error('Error exportando inventario a PDF:', error);
    res
      .status(500)
      .json({ success: false, message: 'Error exportando inventario', error: error.message });
  }
};

// ============================================
// EXPORTAR INVENTARIO A EXCEL
// ============================================
const exportInventarioExcel = async (req, res) => {
  try {
    const { empresa_id } = req.query;
    if (!empresa_id) {
      return res.status(400).json({ success: false, message: 'Se requiere empresa_id' });
    }

    const reporte = await Report.getInventarioReport(empresa_id, req.query);
    const wb = XLSX.utils.book_new();

    // Hoja de estadísticas
    const statsData = [
      ['REPORTE DE INVENTARIO - INNOVAPAZ', ''],
      [`Generado: ${new Date().toLocaleString('es-BO')}`, ''],
      ['', ''],
      ['ESTADÍSTICAS GENERALES', ''],
      ['Métrica', 'Valor'],
      ['Total Productos', reporte.estadisticas.total_productos],
      ['Productos Stock Bajo', reporte.estadisticas.productos_stock_bajo],
      ['Productos Sin Stock', reporte.estadisticas.productos_sin_stock],
      ['Total Unidades', reporte.estadisticas.total_unidades || 0],
      [
        'Valor Total Inventario',
        `Bs ${(reporte.estadisticas.valor_total_inventario || 0).toLocaleString('es-BO')}`,
      ],
      [
        'Precio Promedio Venta',
        `Bs ${(reporte.estadisticas.precio_promedio_venta || 0).toLocaleString('es-BO')}`,
      ],
      ['Stock Promedio', reporte.estadisticas.stock_promedio || 0],
    ];
    const wsStats = XLSX.utils.aoa_to_sheet(statsData);
    wsStats['!cols'] = [{ width: 25 }, { width: 20 }];
    XLSX.utils.book_append_sheet(wb, wsStats, '📊 Estadísticas');

    // Hoja de productos
    if (reporte.productos.length > 0) {
      const productosData = reporte.productos.map((p) => ({
        Código: p.codigo,
        Nombre: p.nombre_producto,
        Stock: parseInt(p.stock),
        'Precio Venta': parseFloat(p.precio_venta),
        'Precio Costo': parseFloat(p.precio_costo),
        'Valor Stock': parseFloat(p.valor_stock),
        Categoría: p.nombre_categoria,
        Marca: p.marca_nombre,
        Estado: p.estado_nombre,
        Almacenes: p.almacenes,
        'Total Lotes': parseInt(p.total_lotes || 0),
      }));

      const wsProductos = XLSX.utils.json_to_sheet(productosData);
      wsProductos['!cols'] = [
        { width: 12 },
        { width: 30 },
        { width: 8 },
        { width: 12 },
        { width: 12 },
        { width: 12 },
        { width: 15 },
        { width: 15 },
        { width: 12 },
        { width: 20 },
        { width: 10 },
      ];
      XLSX.utils.book_append_sheet(wb, wsProductos, '📦 Productos');
    }

    // Hoja de próximos a vencer
    if (reporte.proximos_vencer.length > 0) {
      const vencimientoData = reporte.proximos_vencer.map((p) => ({
        Producto: p.nombre_producto,
        Código: p.codigo,
        Lote: p.codigo_lote,
        'Fecha Vencimiento': new Date(p.fecha_vencimiento).toLocaleDateString('es-BO'),
        'Días Restantes': parseInt(p.dias_restantes),
        Cantidad: parseInt(p.cantidad),
        Almacén: p.almacen_nombre || 'N/A',
      }));

      const wsVencimiento = XLSX.utils.json_to_sheet(vencimientoData);
      wsVencimiento['!cols'] = [
        { width: 30 },
        { width: 12 },
        { width: 15 },
        { width: 15 },
        { width: 12 },
        { width: 10 },
        { width: 20 },
      ];
      XLSX.utils.book_append_sheet(wb, wsVencimiento, '⚠️ Próximos a Vencer');
    }

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=inventario-innovapaz-${Date.now()}.xlsx`
    );
    res.send(buffer);
  } catch (error) {
    console.error('Error exportando inventario a Excel:', error);
    res
      .status(500)
      .json({ success: false, message: 'Error exportando inventario', error: error.message });
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

// ============================================
// EXPORTAR MOVIMIENTOS DE INVENTARIO A PDF
// ============================================
const exportMovimientosPDF = async (req, res) => {
  try {
    const { empresa_id } = req.query;
    if (!empresa_id) {
      return res.status(400).json({ success: false, message: 'Se requiere empresa_id' });
    }

    const reporte = await Report.getMovimientosInventarioReport(empresa_id, req.query);
    const doc = new PDFDocument({ margin: 0, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=movimientos-inventario-innovapaz-${Date.now()}.pdf`
    );
    doc.pipe(res);

    addPDFHeader(doc, 'Movimientos de Inventario', 'Historial de Entradas y Salidas');

    // Métricas principales
    addPDFSection(doc, 'Resumen de Movimientos', '📋');

    const movimientosCards = [
      {
        label: 'Total Movimientos',
        value: reporte.estadisticas.total_movimientos,
        color: COLORS.primary,
      },
      { label: 'Entradas', value: reporte.estadisticas.total_entradas, color: COLORS.success },
      { label: 'Salidas', value: reporte.estadisticas.total_salidas, color: COLORS.warning },
      {
        label: 'Cantidad Total Entradas',
        value: reporte.estadisticas.cantidad_total_entradas || 0,
        color: COLORS.accent,
      },
    ];

    movimientosCards.forEach(({ label, value, color }) => {
      doc.circle(45, doc.y + 5, 4).fill(color);
      doc.fontSize(12).fillColor(COLORS.text).text(`${label}: ${value}`, 55, doc.y);
      doc.moveDown(0.4);
    });

    doc.moveDown();

    // Movimientos por tipo
    if (reporte.por_tipo.length > 0) {
      addPDFSection(doc, 'Distribución por Tipo de Movimiento', '📊');
      doc.fontSize(10).fillColor(COLORS.text);

      reporte.por_tipo.forEach((tipo) => {
        const color = tipo.tipo_movimiento === 'entrada' ? COLORS.success : COLORS.warning;
        doc.circle(45, doc.y + 5, 3).fill(color);
        doc.text(
          `${tipo.tipo_movimiento.toUpperCase()}: ${tipo.cantidad_movimientos} movimientos`,
          55,
          doc.y
        );
        doc.text(`Cantidad: ${tipo.cantidad_total}`, 350, doc.y);
        doc.moveDown(0.3);
      });
      doc.moveDown();
    }

    // Productos con más movimientos
    if (reporte.productos_mas_movimientos.length > 0) {
      addPDFSection(doc, 'Top 10 Productos con Más Movimientos', '🔄');
      doc.fontSize(10).fillColor(COLORS.text);

      reporte.productos_mas_movimientos.slice(0, 10).forEach((producto, index) => {
        const rank = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'][index];
        doc.text(`${rank} ${producto.nombre_producto}`, 40, doc.y);
        doc.text(`${producto.total_movimientos} movimientos`, 350, doc.y);
        doc.moveDown(0.3);
      });
      doc.moveDown();
    }

    // Movimientos por usuario
    if (reporte.por_usuario.length > 0) {
      addPDFSection(doc, 'Actividad por Usuario', '👤');
      doc.fontSize(10).fillColor(COLORS.text);

      reporte.por_usuario.slice(0, 8).forEach((usuario) => {
        doc.circle(45, doc.y + 5, 3).fill(COLORS.secondary);
        doc.text(
          `${usuario.usuario_nombre}: ${usuario.cantidad_movimientos} movimientos`,
          55,
          doc.y
        );
        doc.moveDown(0.3);
      });
    }

    // Footer
    doc.rect(0, doc.page.height - 50, doc.page.width, 50).fill(COLORS.light);
    doc
      .fontSize(10)
      .fillColor(COLORS.text)
      .text('INNOVAPAZ ERP - Movimientos de Inventario', 0, doc.page.height - 30, {
        width: doc.page.width,
        align: 'center',
      });

    doc.end();
  } catch (error) {
    console.error('Error exportando movimientos a PDF:', error);
    res
      .status(500)
      .json({ success: false, message: 'Error exportando movimientos', error: error.message });
  }
};

// ============================================
// EXPORTAR MOVIMIENTOS A EXCEL
// ============================================
const exportMovimientosExcel = async (req, res) => {
  try {
    const { empresa_id } = req.query;
    if (!empresa_id) {
      return res.status(400).json({ success: false, message: 'Se requiere empresa_id' });
    }

    const reporte = await Report.getMovimientosInventarioReport(empresa_id, req.query);
    const wb = XLSX.utils.book_new();

    // Hoja de estadísticas
    const statsData = [
      ['MOVIMIENTOS DE INVENTARIO - INNOVAPAZ', ''],
      [`Generado: ${new Date().toLocaleString('es-BO')}`, ''],
      ['', ''],
      ['ESTADÍSTICAS GENERALES', ''],
      ['Métrica', 'Valor'],
      ['Total Movimientos', reporte.estadisticas.total_movimientos],
      ['Total Entradas', reporte.estadisticas.total_entradas],
      ['Total Salidas', reporte.estadisticas.total_salidas],
      ['Cantidad Total Entradas', reporte.estadisticas.cantidad_total_entradas || 0],
      ['Cantidad Total Salidas', reporte.estadisticas.cantidad_total_salidas || 0],
      ['Usuarios Activos', reporte.estadisticas.usuarios_activos || 0],
      ['Productos Afectados', reporte.estadisticas.productos_afectados || 0],
    ];
    const wsStats = XLSX.utils.aoa_to_sheet(statsData);
    wsStats['!cols'] = [{ width: 25 }, { width: 20 }];
    XLSX.utils.book_append_sheet(wb, wsStats, '📊 Estadísticas');

    // Hoja de movimientos detallados
    if (reporte.movimientos.length > 0) {
      const movimientosData = reporte.movimientos.map((m) => ({
        Fecha: new Date(m.fecha_movimiento).toLocaleDateString('es-BO'),
        Hora: new Date(m.fecha_movimiento).toLocaleTimeString('es-BO'),
        Tipo: m.tipo_movimiento.toUpperCase(),
        Producto: m.nombre_producto,
        Código: m.codigo_producto,
        Cantidad: parseInt(m.cantidad),
        'Precio Unitario': parseFloat(m.precio_unitario || 0),
        'Valor Total': parseFloat(m.valor_total || 0),
        Usuario: m.usuario_nombre || 'N/A',
        Almacén: m.almacen_nombre || 'N/A',
        Motivo: m.motivo || 'N/A',
        Observaciones: m.observaciones || 'N/A',
      }));

      const wsMovimientos = XLSX.utils.json_to_sheet(movimientosData);
      wsMovimientos['!cols'] = [
        { width: 12 },
        { width: 10 },
        { width: 10 },
        { width: 30 },
        { width: 12 },
        { width: 10 },
        { width: 12 },
        { width: 12 },
        { width: 20 },
        { width: 20 },
        { width: 20 },
        { width: 30 },
      ];
      XLSX.utils.book_append_sheet(wb, wsMovimientos, '📋 Movimientos');
    }

    // Hoja de productos más movidos
    if (reporte.productos_mas_movimientos.length > 0) {
      const topMovimientosData = reporte.productos_mas_movimientos.map((p, index) => ({
        Ranking: index + 1,
        Código: p.codigo_producto,
        Producto: p.nombre_producto,
        'Total Movimientos': parseInt(p.total_movimientos),
        Entradas: parseInt(p.entradas || 0),
        Salidas: parseInt(p.salidas || 0),
        'Cantidad Total': parseInt(p.cantidad_total || 0),
      }));

      const wsTopMovimientos = XLSX.utils.json_to_sheet(topMovimientosData);
      wsTopMovimientos['!cols'] = [
        { width: 10 },
        { width: 12 },
        { width: 30 },
        { width: 15 },
        { width: 12 },
        { width: 12 },
        { width: 15 },
      ];
      XLSX.utils.book_append_sheet(wb, wsTopMovimientos, '🔄 Top Productos');
    }

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=movimientos-inventario-innovapaz-${Date.now()}.xlsx`
    );
    res.send(buffer);
  } catch (error) {
    console.error('Error exportando movimientos a Excel:', error);
    res
      .status(500)
      .json({ success: false, message: 'Error exportando movimientos', error: error.message });
  }
};

// ============================================
// EXPORTAR ALERTAS A PDF
// ============================================
const exportAlertasPDF = async (req, res) => {
  try {
    const { empresa_id } = req.query;
    if (!empresa_id) {
      return res.status(400).json({ success: false, message: 'Se requiere empresa_id' });
    }

    const reporte = await Report.getAlertasReport(empresa_id, req.query);
    const doc = new PDFDocument({ margin: 0, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=alertas-sistema-innovapaz-${Date.now()}.pdf`
    );
    doc.pipe(res);

    addPDFHeader(doc, 'Alertas del Sistema', 'Notificaciones y Advertencias');

    // Métricas principales
    addPDFSection(doc, 'Resumen de Alertas', '🚨');

    const alertasCards = [
      { label: 'Total Alertas', value: reporte.estadisticas.total_alertas, color: COLORS.primary },
      {
        label: 'Stock Bajo',
        value: reporte.estadisticas.alertas_stock_bajo,
        color: COLORS.warning,
      },
      { label: 'Sin Stock', value: reporte.estadisticas.alertas_sin_stock, color: COLORS.danger },
      {
        label: 'Próximos a Vencer',
        value: reporte.estadisticas.alertas_vencimiento,
        color: COLORS.accent,
      },
    ];

    alertasCards.forEach(({ label, value, color }) => {
      doc.circle(45, doc.y + 5, 4).fill(color);
      doc.fontSize(12).fillColor(COLORS.text).text(`${label}: ${value}`, 55, doc.y);
      doc.moveDown(0.4);
    });

    doc.moveDown();

    // Productos sin stock
    if (reporte.productos_sin_stock.length > 0) {
      addPDFSection(doc, '🔴 Productos Sin Stock (CRÍTICO)', '🚨');
      doc.fontSize(10).fillColor(COLORS.text);

      reporte.productos_sin_stock.slice(0, 15).forEach((producto) => {
        doc.circle(45, doc.y + 5, 3).fill(COLORS.danger);
        doc.text(`${producto.nombre_producto} (${producto.codigo})`, 55, doc.y);
        doc.text(`Categoría: ${producto.nombre_categoria}`, 350, doc.y);
        doc.moveDown(0.3);
      });
      doc.moveDown();
    }

    // Productos con stock bajo
    if (reporte.productos_stock_bajo.length > 0) {
      addPDFSection(doc, '🟡 Productos con Stock Bajo', '⚠️');
      doc.fontSize(10).fillColor(COLORS.text);

      reporte.productos_stock_bajo.slice(0, 15).forEach((producto) => {
        doc.circle(45, doc.y + 5, 3).fill(COLORS.warning);
        doc.text(`${producto.nombre_producto}`, 55, doc.y);
        doc.text(`Stock: ${producto.stock_actual}`, 300, doc.y);
        doc.text(`Mínimo: ${producto.stock_minimo}`, 380, doc.y);
        doc.moveDown(0.3);
      });
      doc.moveDown();
    }

    // Productos próximos a vencer
    if (reporte.productos_proximos_vencer.length > 0) {
      addPDFSection(doc, '📅 Productos Próximos a Vencer', '⏰');
      doc.fontSize(10).fillColor(COLORS.text);

      reporte.productos_proximos_vencer.slice(0, 10).forEach((producto) => {
        const diasRestantes = parseInt(producto.dias_restantes);
        const color = diasRestantes <= 7 ? COLORS.danger : COLORS.warning;

        doc.circle(45, doc.y + 5, 3).fill(color);
        doc.text(`${producto.nombre_producto}`, 55, doc.y);
        doc.text(`${diasRestantes} días`, 350, doc.y);
        doc.text(`Cantidad: ${producto.cantidad}`, 420, doc.y);
        doc.moveDown(0.3);
      });
    }

    // Footer
    doc.rect(0, doc.page.height - 50, doc.page.width, 50).fill(COLORS.light);
    doc
      .fontSize(10)
      .fillColor(COLORS.text)
      .text('INNOVAPAZ ERP - Reporte de Alertas', 0, doc.page.height - 30, {
        width: doc.page.width,
        align: 'center',
      });

    doc.end();
  } catch (error) {
    console.error('Error exportando alertas a PDF:', error);
    res
      .status(500)
      .json({ success: false, message: 'Error exportando alertas', error: error.message });
  }
};

// ============================================
// EXPORTAR ALERTAS A EXCEL
// ============================================
const exportAlertasExcel = async (req, res) => {
  try {
    const { empresa_id } = req.query;
    if (!empresa_id) {
      return res.status(400).json({ success: false, message: 'Se requiere empresa_id' });
    }

    const reporte = await Report.getAlertasReport(empresa_id, req.query);
    const wb = XLSX.utils.book_new();

    // Hoja de estadísticas
    const statsData = [
      ['REPORTE DE ALERTAS - INNOVAPAZ', ''],
      [`Generado: ${new Date().toLocaleString('es-BO')}`, ''],
      ['', ''],
      ['RESUMEN DE ALERTAS', ''],
      ['Tipo de Alerta', 'Cantidad'],
      ['Total Alertas', reporte.estadisticas.total_alertas],
      ['Stock Bajo', reporte.estadisticas.alertas_stock_bajo],
      ['Sin Stock', reporte.estadisticas.alertas_sin_stock],
      ['Próximos a Vencer', reporte.estadisticas.alertas_vencimiento],
      ['Vencidos', reporte.estadisticas.alertas_vencidos || 0],
      ['Productos Críticos', reporte.estadisticas.productos_criticos || 0],
    ];
    const wsStats = XLSX.utils.aoa_to_sheet(statsData);
    wsStats['!cols'] = [{ width: 25 }, { width: 15 }];
    XLSX.utils.book_append_sheet(wb, wsStats, '📊 Resumen');

    // Hoja de productos sin stock
    if (reporte.productos_sin_stock.length > 0) {
      const sinStockData = reporte.productos_sin_stock.map((p) => ({
        Código: p.codigo,
        Producto: p.nombre_producto,
        Categoría: p.nombre_categoria,
        'Stock Actual': p.stock_actual || 0,
        'Stock Mínimo': p.stock_minimo || 0,
        'Precio Venta': parseFloat(p.precio_venta || 0),
        Estado: 'SIN STOCK',
        Criticidad: 'ALTA',
      }));

      const wsSinStock = XLSX.utils.json_to_sheet(sinStockData);
      wsSinStock['!cols'] = [
        { width: 12 },
        { width: 30 },
        { width: 20 },
        { width: 12 },
        { width: 12 },
        { width: 12 },
        { width: 12 },
        { width: 12 },
      ];
      XLSX.utils.book_append_sheet(wb, wsSinStock, '🔴 Sin Stock');
    }

    // Hoja de productos con stock bajo
    if (reporte.productos_stock_bajo.length > 0) {
      const stockBajoData = reporte.productos_stock_bajo.map((p) => ({
        Código: p.codigo,
        Producto: p.nombre_producto,
        Categoría: p.nombre_categoria,
        'Stock Actual': p.stock_actual,
        'Stock Mínimo': p.stock_minimo,
        Déficit: p.stock_minimo - p.stock_actual,
        'Precio Venta': parseFloat(p.precio_venta || 0),
        Estado: 'STOCK BAJO',
        Criticidad: 'MEDIA',
      }));

      const wsStockBajo = XLSX.utils.json_to_sheet(stockBajoData);
      wsStockBajo['!cols'] = [
        { width: 12 },
        { width: 30 },
        { width: 20 },
        { width: 12 },
        { width: 12 },
        { width: 10 },
        { width: 12 },
        { width: 12 },
        { width: 12 },
      ];
      XLSX.utils.book_append_sheet(wb, wsStockBajo, '🟡 Stock Bajo');
    }

    // Hoja de próximos a vencer
    if (reporte.productos_proximos_vencer.length > 0) {
      const vencimientoData = reporte.productos_proximos_vencer.map((p) => ({
        Producto: p.nombre_producto,
        Código: p.codigo,
        Lote: p.codigo_lote,
        'Fecha Vencimiento': new Date(p.fecha_vencimiento).toLocaleDateString('es-BO'),
        'Días Restantes': parseInt(p.dias_restantes),
        Cantidad: parseInt(p.cantidad),
        Almacén: p.almacen_nombre || 'N/A',
        Criticidad: parseInt(p.dias_restantes) <= 7 ? 'ALTA' : 'MEDIA',
      }));

      const wsVencimiento = XLSX.utils.json_to_sheet(vencimientoData);
      wsVencimiento['!cols'] = [
        { width: 30 },
        { width: 12 },
        { width: 15 },
        { width: 15 },
        { width: 12 },
        { width: 10 },
        { width: 20 },
        { width: 12 },
      ];
      XLSX.utils.book_append_sheet(wb, wsVencimiento, '📅 Próximos Vencer');
    }

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=alertas-sistema-innovapaz-${Date.now()}.xlsx`
    );
    res.send(buffer);
  } catch (error) {
    console.error('Error exportando alertas a Excel:', error);
    res
      .status(500)
      .json({ success: false, message: 'Error exportando alertas', error: error.message });
  }
};

module.exports = {
  exportDashboardPDF,
  exportDashboardExcel,
  exportVentasPDF,
  exportVentasExcel,
  exportInventarioPDF,
  exportInventarioExcel,
  exportMovimientosPDF,
  exportMovimientosExcel,
  exportAlertasPDF,
  exportAlertasExcel,
  exportProductosPDF,
  exportProductosExcel,
  exportUsuariosExcel,
};
