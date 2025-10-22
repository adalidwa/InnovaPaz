const Report = require('../models/report.model');

// ============================================
// CRUD DE REPORTES GUARDADOS
// ============================================

/**
 * Obtener todos los reportes de una empresa
 */
const getReportes = async (req, res, next) => {
  try {
    const { empresa_id } = req.query;
    const filtros = {
      tipo_reporte: req.query.tipo_reporte,
      categoria: req.query.categoria,
      es_favorito: req.query.es_favorito === 'true',
      es_publico: req.query.es_publico,
      usuario_id: req.query.usuario_id,
    };

    if (!empresa_id) {
      return res.status(400).json({
        success: false,
        message: 'El parámetro empresa_id es requerido',
      });
    }

    const reportes = await Report.findByEmpresa(empresa_id, filtros);

    res.json({
      success: true,
      count: reportes.length,
      reportes,
    });
  } catch (error) {
    console.error('Error al obtener reportes:', error);
    next(error);
  }
};

/**
 * Obtener un reporte por ID
 */
const getReporte = async (req, res, next) => {
  try {
    const { id } = req.params;

    const reporte = await Report.findById(id);

    if (!reporte) {
      return res.status(404).json({
        success: false,
        message: 'Reporte no encontrado',
      });
    }

    res.json({
      success: true,
      reporte,
    });
  } catch (error) {
    console.error('Error al obtener reporte:', error);
    next(error);
  }
};

/**
 * Crear un nuevo reporte
 */
const createReporte = async (req, res, next) => {
  try {
    const {
      empresa_id,
      usuario_id,
      nombre_reporte,
      descripcion,
      tipo_reporte,
      categoria,
      parametros,
      configuracion,
      es_favorito,
      es_publico,
    } = req.body;

    if (!empresa_id || !nombre_reporte || !tipo_reporte) {
      return res.status(400).json({
        success: false,
        message: 'Los campos empresa_id, nombre_reporte y tipo_reporte son requeridos',
      });
    }

    const nuevoReporte = await Report.create({
      empresa_id,
      usuario_id,
      nombre_reporte,
      descripcion,
      tipo_reporte,
      categoria,
      parametros,
      configuracion,
      es_favorito,
      es_publico,
    });

    res.status(201).json({
      success: true,
      message: 'Reporte creado exitosamente',
      reporte: nuevoReporte,
    });
  } catch (error) {
    console.error('Error al crear reporte:', error);
    next(error);
  }
};

/**
 * Actualizar un reporte
 */
const updateReporte = async (req, res, next) => {
  try {
    const { id } = req.params;
    const datosActualizar = req.body;

    const reporteActualizado = await Report.update(id, datosActualizar);

    if (!reporteActualizado) {
      return res.status(404).json({
        success: false,
        message: 'Reporte no encontrado',
      });
    }

    res.json({
      success: true,
      message: 'Reporte actualizado exitosamente',
      reporte: reporteActualizado,
    });
  } catch (error) {
    console.error('Error al actualizar reporte:', error);
    next(error);
  }
};

/**
 * Eliminar un reporte
 */
const deleteReporte = async (req, res, next) => {
  try {
    const { id } = req.params;

    const reporteEliminado = await Report.delete(id);

    if (!reporteEliminado) {
      return res.status(404).json({
        success: false,
        message: 'Reporte no encontrado',
      });
    }

    res.json({
      success: true,
      message: 'Reporte eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar reporte:', error);
    next(error);
  }
};

/**
 * Marcar/Desmarcar reporte como favorito
 */
const toggleFavorito = async (req, res, next) => {
  try {
    const { id } = req.params;

    const reporte = await Report.toggleFavorito(id);

    if (!reporte) {
      return res.status(404).json({
        success: false,
        message: 'Reporte no encontrado',
      });
    }

    res.json({
      success: true,
      message: reporte.es_favorito
        ? 'Reporte marcado como favorito'
        : 'Reporte desmarcado como favorito',
      reporte,
    });
  } catch (error) {
    console.error('Error al actualizar favorito:', error);
    next(error);
  }
};

// ============================================
// GENERACIÓN DE REPORTES DINÁMICOS
// ============================================

/**
 * Dashboard General con métricas clave
 */
const getDashboard = async (req, res, next) => {
  try {
    const { empresa_id, periodo } = req.query;

    if (!empresa_id) {
      return res.status(400).json({
        success: false,
        message: 'El parámetro empresa_id es requerido',
      });
    }

    const startTime = Date.now();

    const metricas = await Report.getDashboardMetrics(empresa_id, periodo || 'mes_actual');

    const tiempoEjecucion = Date.now() - startTime;

    res.json({
      success: true,
      metricas,
      tiempo_ejecucion_ms: tiempoEjecucion,
    });
  } catch (error) {
    console.error('Error al generar dashboard:', error);
    next(error);
  }
};

/**
 * Reporte de Usuarios
 */
const getReporteUsuarios = async (req, res, next) => {
  try {
    const { empresa_id } = req.query;

    if (!empresa_id) {
      return res.status(400).json({
        success: false,
        message: 'El parámetro empresa_id es requerido',
      });
    }

    const filtros = {
      estado: req.query.estado,
      rol_id: req.query.rol_id,
      fecha_desde: req.query.fecha_desde,
      fecha_hasta: req.query.fecha_hasta,
    };

    const startTime = Date.now();

    const reporte = await Report.getUsuariosReport(empresa_id, filtros);

    const tiempoEjecucion = Date.now() - startTime;

    // Registrar ejecución si hay un reporte_id asociado
    if (req.query.reporte_id && req.query.usuario_id) {
      await Report.registrarEjecucion({
        reporte_id: req.query.reporte_id,
        usuario_id: req.query.usuario_id,
        parametros_utilizados: { empresa_id, ...filtros },
        tiempo_ejecucion_ms: tiempoEjecucion,
        numero_registros: reporte.usuarios.length,
        estado_ejecucion: 'exitoso',
      });
    }

    res.json({
      success: true,
      tipo_reporte: 'usuarios',
      ...reporte,
      tiempo_ejecucion_ms: tiempoEjecucion,
    });
  } catch (error) {
    console.error('Error al generar reporte de usuarios:', error);
    next(error);
  }
};

/**
 * Reporte de Productos/Inventario
 */
const getReporteProductos = async (req, res, next) => {
  try {
    const { empresa_id } = req.query;

    if (!empresa_id) {
      return res.status(400).json({
        success: false,
        message: 'El parámetro empresa_id es requerido',
      });
    }

    const filtros = {
      categoria_id: req.query.categoria_id,
      marca_id: req.query.marca_id,
      estado_id: req.query.estado_id,
      stock_minimo: req.query.stock_minimo,
      ordenar_por: req.query.ordenar_por,
      orden: req.query.orden,
    };

    const startTime = Date.now();

    const reporte = await Report.getProductosReport(empresa_id, filtros);

    const tiempoEjecucion = Date.now() - startTime;

    // Registrar ejecución si hay un reporte_id asociado
    if (req.query.reporte_id && req.query.usuario_id) {
      await Report.registrarEjecucion({
        reporte_id: req.query.reporte_id,
        usuario_id: req.query.usuario_id,
        parametros_utilizados: { empresa_id, ...filtros },
        tiempo_ejecucion_ms: tiempoEjecucion,
        numero_registros: reporte.productos.length,
        estado_ejecucion: 'exitoso',
      });
    }

    res.json({
      success: true,
      tipo_reporte: 'productos',
      ...reporte,
      tiempo_ejecucion_ms: tiempoEjecucion,
    });
  } catch (error) {
    console.error('Error al generar reporte de productos:', error);
    next(error);
  }
};

/**
 * Reporte de Stock Bajo (Alerta)
 */
const getReporteStockBajo = async (req, res, next) => {
  try {
    const { empresa_id, stock_minimo = 10 } = req.query;

    if (!empresa_id) {
      return res.status(400).json({
        success: false,
        message: 'El parámetro empresa_id es requerido',
      });
    }

    const filtros = {
      stock_minimo: parseInt(stock_minimo),
      ordenar_por: 'stock',
      orden: 'ASC',
    };

    const reporte = await Report.getProductosReport(empresa_id, filtros);

    res.json({
      success: true,
      tipo_reporte: 'stock_bajo',
      alerta: reporte.productos.length > 0,
      cantidad_productos_criticos: reporte.productos.length,
      productos: reporte.productos,
      estadisticas: reporte.estadisticas,
    });
  } catch (error) {
    console.error('Error al generar reporte de stock bajo:', error);
    next(error);
  }
};

/**
 * Reporte de Invitaciones
 */
const getReporteInvitaciones = async (req, res, next) => {
  try {
    const { empresa_id } = req.query;

    if (!empresa_id) {
      return res.status(400).json({
        success: false,
        message: 'El parámetro empresa_id es requerido',
      });
    }

    const filtros = {
      estado: req.query.estado,
      fecha_desde: req.query.fecha_desde,
      fecha_hasta: req.query.fecha_hasta,
    };

    const startTime = Date.now();

    const reporte = await Report.getInvitacionesReport(empresa_id, filtros);

    const tiempoEjecucion = Date.now() - startTime;

    // Registrar ejecución si hay un reporte_id asociado
    if (req.query.reporte_id && req.query.usuario_id) {
      await Report.registrarEjecucion({
        reporte_id: req.query.reporte_id,
        usuario_id: req.query.usuario_id,
        parametros_utilizados: { empresa_id, ...filtros },
        tiempo_ejecucion_ms: tiempoEjecucion,
        numero_registros: reporte.invitaciones.length,
        estado_ejecucion: 'exitoso',
      });
    }

    res.json({
      success: true,
      tipo_reporte: 'invitaciones',
      ...reporte,
      tiempo_ejecucion_ms: tiempoEjecucion,
    });
  } catch (error) {
    console.error('Error al generar reporte de invitaciones:', error);
    next(error);
  }
};

/**
 * Reporte de Roles
 */
const getReporteRoles = async (req, res, next) => {
  try {
    const { empresa_id } = req.query;

    if (!empresa_id) {
      return res.status(400).json({
        success: false,
        message: 'El parámetro empresa_id es requerido',
      });
    }

    const startTime = Date.now();

    const reporte = await Report.getRolesReport(empresa_id);

    const tiempoEjecucion = Date.now() - startTime;

    // Registrar ejecución si hay un reporte_id asociado
    if (req.query.reporte_id && req.query.usuario_id) {
      await Report.registrarEjecucion({
        reporte_id: req.query.reporte_id,
        usuario_id: req.query.usuario_id,
        parametros_utilizados: { empresa_id },
        tiempo_ejecucion_ms: tiempoEjecucion,
        numero_registros: reporte.roles_personalizados.length,
        estado_ejecucion: 'exitoso',
      });
    }

    res.json({
      success: true,
      tipo_reporte: 'roles',
      ...reporte,
      tiempo_ejecucion_ms: tiempoEjecucion,
    });
  } catch (error) {
    console.error('Error al generar reporte de roles:', error);
    next(error);
  }
};

/**
 * Reporte de Ventas
 */
const getReporteVentas = async (req, res, next) => {
  try {
    const { empresa_id } = req.query;

    if (!empresa_id) {
      return res.status(400).json({
        success: false,
        message: 'El parámetro empresa_id es requerido',
      });
    }

    const filtros = {
      fecha_desde: req.query.fecha_desde,
      fecha_hasta: req.query.fecha_hasta,
      cliente_id: req.query.cliente_id,
      vendedor_id: req.query.vendedor_id,
      metodo_pago_id: req.query.metodo_pago_id,
      estado_venta_id: req.query.estado_venta_id,
      monto_minimo: req.query.monto_minimo,
      monto_maximo: req.query.monto_maximo,
    };

    const startTime = Date.now();

    const reporte = await Report.getVentasReport(empresa_id, filtros);

    const tiempoEjecucion = Date.now() - startTime;

    // Registrar ejecución si hay un reporte_id asociado
    if (req.query.reporte_id && req.query.usuario_id) {
      await Report.registrarEjecucion({
        reporte_id: req.query.reporte_id,
        usuario_id: req.query.usuario_id,
        parametros_utilizados: { empresa_id, ...filtros },
        tiempo_ejecucion_ms: tiempoEjecucion,
        numero_registros: reporte.ventas.length,
        estado_ejecucion: 'exitoso',
      });
    }

    res.json({
      success: true,
      tipo_reporte: 'ventas',
      ...reporte,
      tiempo_ejecucion_ms: tiempoEjecucion,
    });
  } catch (error) {
    console.error('Error al generar reporte de ventas:', error);
    next(error);
  }
};

/**
 * Reporte de Inventario
 */
const getReporteInventario = async (req, res, next) => {
  try {
    const { empresa_id } = req.query;

    if (!empresa_id) {
      return res.status(400).json({
        success: false,
        message: 'El parámetro empresa_id es requerido',
      });
    }

    const filtros = {
      categoria_id: req.query.categoria_id,
      marca_id: req.query.marca_id,
      estado_id: req.query.estado_id,
      stock_minimo: req.query.stock_minimo,
      almacen_id: req.query.almacen_id,
    };

    const startTime = Date.now();

    const reporte = await Report.getInventarioReport(empresa_id, filtros);

    const tiempoEjecucion = Date.now() - startTime;

    // Registrar ejecución si hay un reporte_id asociado
    if (req.query.reporte_id && req.query.usuario_id) {
      await Report.registrarEjecucion({
        reporte_id: req.query.reporte_id,
        usuario_id: req.query.usuario_id,
        parametros_utilizados: { empresa_id, ...filtros },
        tiempo_ejecucion_ms: tiempoEjecucion,
        numero_registros: reporte.productos.length,
        estado_ejecucion: 'exitoso',
      });
    }

    res.json({
      success: true,
      tipo_reporte: 'inventario',
      ...reporte,
      tiempo_ejecucion_ms: tiempoEjecucion,
    });
  } catch (error) {
    console.error('Error al generar reporte de inventario:', error);
    next(error);
  }
};

/**
 * Reporte de Movimientos de Inventario
 */
const getReporteMovimientosInventario = async (req, res, next) => {
  try {
    const { empresa_id } = req.query;

    if (!empresa_id) {
      return res.status(400).json({
        success: false,
        message: 'El parámetro empresa_id es requerido',
      });
    }

    const filtros = {
      fecha_desde: req.query.fecha_desde,
      fecha_hasta: req.query.fecha_hasta,
      producto_id: req.query.producto_id,
      tipo_movimiento_id: req.query.tipo_movimiento_id,
      almacen_id: req.query.almacen_id,
      entidad_tipo: req.query.entidad_tipo,
    };

    const startTime = Date.now();

    const reporte = await Report.getMovimientosInventarioReport(empresa_id, filtros);

    const tiempoEjecucion = Date.now() - startTime;

    // Registrar ejecución si hay un reporte_id asociado
    if (req.query.reporte_id && req.query.usuario_id) {
      await Report.registrarEjecucion({
        reporte_id: req.query.reporte_id,
        usuario_id: req.query.usuario_id,
        parametros_utilizados: { empresa_id, ...filtros },
        tiempo_ejecucion_ms: tiempoEjecucion,
        numero_registros: reporte.movimientos.length,
        estado_ejecucion: 'exitoso',
      });
    }

    res.json({
      success: true,
      tipo_reporte: 'movimientos_inventario',
      ...reporte,
      tiempo_ejecucion_ms: tiempoEjecucion,
    });
  } catch (error) {
    console.error('Error al generar reporte de movimientos de inventario:', error);
    next(error);
  }
};

/**
 * Reporte de Alertas - Stock bajo y productos próximos a vencer
 */
const getReporteAlertas = async (req, res, next) => {
  try {
    const { empresa_id, stock_minimo = 10 } = req.query;

    if (!empresa_id) {
      return res.status(400).json({
        success: false,
        message: 'El parámetro empresa_id es requerido',
      });
    }

    const startTime = Date.now();

    // Obtener productos con stock bajo
    const stockBajo = await Report.getInventarioReport(empresa_id, {
      stock_minimo: parseInt(stock_minimo),
    });

    // Productos próximos a vencer (ya incluido en el reporte de inventario)
    const proximosVencer = stockBajo.proximos_vencer;

    const tiempoEjecucion = Date.now() - startTime;

    // Calcular niveles de alerta
    const alertas = {
      stock_critico: stockBajo.productos.filter((p) => p.stock === 0),
      stock_bajo: stockBajo.productos.filter(
        (p) => p.stock > 0 && p.stock < parseInt(stock_minimo)
      ),
      proximos_vencer: proximosVencer.filter((p) => p.dias_restantes <= 7),
      vencimiento_medio: proximosVencer.filter(
        (p) => p.dias_restantes > 7 && p.dias_restantes <= 30
      ),
    };

    const resumenAlertas = {
      total_alertas:
        alertas.stock_critico.length +
        alertas.stock_bajo.length +
        alertas.proximos_vencer.length +
        alertas.vencimiento_medio.length,
      stock_critico_count: alertas.stock_critico.length,
      stock_bajo_count: alertas.stock_bajo.length,
      proximos_vencer_count: alertas.proximos_vencer.length,
      vencimiento_medio_count: alertas.vencimiento_medio.length,
    };

    res.json({
      success: true,
      tipo_reporte: 'alertas',
      resumen: resumenAlertas,
      alertas,
      tiempo_ejecucion_ms: tiempoEjecucion,
    });
  } catch (error) {
    console.error('Error al generar reporte de alertas:', error);
    next(error);
  }
};

// ============================================
// HISTORIAL DE REPORTES
// ============================================

/**
 * Obtener historial de ejecuciones de un reporte
 */
const getHistorialReporte = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limite = 50 } = req.query;

    const historial = await Report.getHistorial(id, parseInt(limite));

    res.json({
      success: true,
      count: historial.length,
      historial,
    });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    next(error);
  }
};

// ============================================
// EXPORTACIÓN DE REPORTES
// ============================================

/**
 * Exportar reporte (placeholder para futuras implementaciones)
 */
const exportarReporte = async (req, res, next) => {
  try {
    const { tipo_reporte, formato = 'json' } = req.body;

    // TODO: Implementar exportación a PDF, Excel, CSV
    // Por ahora solo retorna JSON

    res.json({
      success: true,
      message: 'Funcionalidad de exportación en desarrollo',
      formato_soportado: formato === 'json',
      formatos_disponibles: ['json'],
      formatos_proximos: ['pdf', 'excel', 'csv'],
    });
  } catch (error) {
    console.error('Error al exportar reporte:', error);
    next(error);
  }
};

module.exports = {
  // CRUD de reportes guardados
  getReportes,
  getReporte,
  createReporte,
  updateReporte,
  deleteReporte,
  toggleFavorito,

  // Generación de reportes dinámicos
  getDashboard,
  getReporteUsuarios,
  getReporteProductos,
  getReporteStockBajo,
  getReporteInvitaciones,
  getReporteRoles,

  // Nuevos reportes actualizados
  getReporteVentas,
  getReporteInventario,
  getReporteMovimientosInventario,
  getReporteAlertas,

  // Historial y exportación
  getHistorialReporte,
  exportarReporte,
};
