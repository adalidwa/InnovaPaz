const pool = require('../db');

class Report {
  // ============================================
  // CRUD DE REPORTES GUARDADOS
  // ============================================

  /**
   * Obtener todos los reportes de una empresa
   */
  static async findByEmpresa(empresaId, filters = {}) {
    let query = `
      SELECT 
        r.*,
        u.nombre_completo as creador_nombre,
        u.email as creador_email
      FROM reportes r
      LEFT JOIN usuarios u ON r.usuario_id = u.uid
      WHERE r.empresa_id = $1::uuid
    `;
    const params = [empresaId];
    let paramCount = 1;

    // Filtros adicionales
    if (filters.tipo_reporte) {
      paramCount++;
      query += ` AND r.tipo_reporte = $${paramCount}`;
      params.push(filters.tipo_reporte);
    }

    if (filters.categoria) {
      paramCount++;
      query += ` AND r.categoria = $${paramCount}`;
      params.push(filters.categoria);
    }

    if (filters.es_favorito) {
      query += ` AND r.es_favorito = true`;
    }

    if (filters.es_publico !== undefined) {
      query += ` AND r.es_publico = ${filters.es_publico}`;
    }

    if (filters.usuario_id) {
      paramCount++;
      query += ` AND r.usuario_id = $${paramCount}`;
      params.push(filters.usuario_id);
    }

    query += ` ORDER BY r.fecha_modificacion DESC`;

    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Obtener un reporte por ID
   */
  static async findById(reporteId) {
    const result = await pool.query(
      `SELECT 
        r.*,
        u.nombre_completo as creador_nombre,
        u.email as creador_email
      FROM reportes r
      LEFT JOIN usuarios u ON r.usuario_id = u.uid
      WHERE r.reporte_id = $1`,
      [reporteId]
    );
    return result.rows[0];
  }

  /**
   * Crear un nuevo reporte
   */
  static async create(data) {
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
    } = data;

    const result = await pool.query(
      `INSERT INTO reportes 
       (empresa_id, usuario_id, nombre_reporte, descripcion, tipo_reporte, categoria, 
        parametros, configuracion, es_favorito, es_publico, fecha_creacion, fecha_modificacion) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()) 
       RETURNING *`,
      [
        empresa_id,
        usuario_id,
        nombre_reporte,
        descripcion || null,
        tipo_reporte,
        categoria || null,
        JSON.stringify(parametros || {}),
        JSON.stringify(configuracion || {}),
        es_favorito || false,
        es_publico || false,
      ]
    );
    return result.rows[0];
  }

  /**
   * Actualizar un reporte existente
   */
  static async update(reporteId, data) {
    const fields = [];
    const values = [];
    let paramCount = 0;

    const allowedFields = [
      'nombre_reporte',
      'descripcion',
      'tipo_reporte',
      'categoria',
      'parametros',
      'configuracion',
      'es_favorito',
      'es_publico',
    ];

    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        paramCount++;
        fields.push(`${field} = $${paramCount}`);
        if (field === 'parametros' || field === 'configuracion') {
          values.push(JSON.stringify(data[field]));
        } else {
          values.push(data[field]);
        }
      }
    });

    if (fields.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    paramCount++;
    values.push(reporteId);

    const query = `
      UPDATE reportes 
      SET ${fields.join(', ')}
      WHERE reporte_id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Eliminar un reporte
   */
  static async delete(reporteId) {
    const result = await pool.query('DELETE FROM reportes WHERE reporte_id = $1 RETURNING *', [
      reporteId,
    ]);
    return result.rows[0];
  }

  /**
   * Marcar/Desmarcar como favorito
   */
  static async toggleFavorito(reporteId) {
    const result = await pool.query(
      'UPDATE reportes SET es_favorito = NOT es_favorito WHERE reporte_id = $1 RETURNING *',
      [reporteId]
    );
    return result.rows[0];
  }

  // ============================================
  // GENERACIÓN DE REPORTES DINÁMICOS
  // ============================================

  /**
   * Dashboard General - Métricas clave
   */
  static async getDashboardMetrics(empresaId, periodo = 'mes_actual') {
    const { fechaInicio, fechaFin } = this._calcularPeriodo(periodo);

    // Ejecutar múltiples consultas en paralelo
    const [usuarios, productos, invitaciones, roles] = await Promise.all([
      // Métricas de usuarios
      pool.query(
        `SELECT 
          COUNT(*) FILTER (WHERE estado = 'activo') as usuarios_activos,
          COUNT(*) FILTER (WHERE estado = 'inactivo') as usuarios_inactivos,
          COUNT(*) as total_usuarios,
          COUNT(*) FILTER (WHERE fecha_creacion >= $2 AND fecha_creacion <= $3) as usuarios_nuevos_periodo
        FROM usuarios 
        WHERE empresa_id = $1`,
        [empresaId, fechaInicio, fechaFin]
      ),

      // Métricas de productos
      pool.query(
        `SELECT 
          COUNT(*) as total_productos,
          COUNT(*) FILTER (WHERE stock < 10) as productos_stock_bajo,
          SUM(stock * precio_costo)::DECIMAL(10,2) as valor_inventario,
          AVG(stock)::DECIMAL(10,2) as promedio_stock
        FROM producto 
        WHERE empresa_id = $1 AND estado_id = 1`,
        [empresaId]
      ),

      // Métricas de invitaciones
      pool.query(
        `SELECT 
          COUNT(*) FILTER (WHERE estado = 'pendiente') as invitaciones_pendientes,
          COUNT(*) FILTER (WHERE estado = 'aceptada') as invitaciones_aceptadas,
          COUNT(*) FILTER (WHERE estado = 'rechazada') as invitaciones_rechazadas,
          COUNT(*) FILTER (WHERE fecha_expiracion < NOW() AND estado = 'pendiente') as invitaciones_expiradas
        FROM invitaciones 
        WHERE empresa_id = $1`,
        [empresaId]
      ),

      // Métricas de roles
      pool.query(
        `SELECT 
          COUNT(*) as total_roles,
          COUNT(*) FILTER (WHERE es_predeterminado = true) as roles_predeterminados,
          COUNT(*) FILTER (WHERE es_predeterminado = false) as roles_personalizados
        FROM roles 
        WHERE empresa_id = $1`,
        [empresaId]
      ),
    ]);

    return {
      periodo: {
        inicio: fechaInicio,
        fin: fechaFin,
        nombre: periodo,
      },
      usuarios: usuarios.rows[0],
      productos: productos.rows[0],
      invitaciones: invitaciones.rows[0],
      roles: roles.rows[0],
    };
  }

  /**
   * Reporte de Usuarios - Completo
   */
  static async getUsuariosReport(empresaId, filtros = {}) {
    let query = `
      SELECT 
        u.uid,
        u.nombre_completo,
        u.email,
        u.estado,
        u.fecha_creacion,
        r.nombre_rol as rol_nombre,
        CASE 
          WHEN u.rol_id IS NOT NULL THEN 'personalizado'
          ELSE 'sin_rol'
        END as tipo_rol
      FROM usuarios u
      LEFT JOIN roles r ON u.rol_id = r.rol_id
      WHERE u.empresa_id = $1
    `;
    const params = [empresaId];
    let paramCount = 1;

    if (filtros.estado) {
      paramCount++;
      query += ` AND u.estado = $${paramCount}`;
      params.push(filtros.estado);
    }

    if (filtros.rol_id) {
      paramCount++;
      query += ` AND u.rol_id = $${paramCount}`;
      params.push(filtros.rol_id);
    }

    if (filtros.fecha_desde) {
      paramCount++;
      query += ` AND u.fecha_creacion >= $${paramCount}`;
      params.push(filtros.fecha_desde);
    }

    if (filtros.fecha_hasta) {
      paramCount++;
      query += ` AND u.fecha_creacion <= $${paramCount}`;
      params.push(filtros.fecha_hasta);
    }

    query += ` ORDER BY u.fecha_creacion DESC`;

    const result = await pool.query(query, params);

    // Estadísticas adicionales
    const stats = await pool.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE estado = 'activo') as activos,
        COUNT(*) FILTER (WHERE estado = 'inactivo') as inactivos
      FROM usuarios 
      WHERE empresa_id = $1`,
      [empresaId]
    );

    return {
      usuarios: result.rows,
      estadisticas: stats.rows[0],
    };
  }

  /**
   * Reporte de Productos/Inventario
   */
  static async getProductosReport(empresaId, filtros = {}) {
    let query = `
      SELECT 
        p.producto_id,
        p.codigo,
        p.nombre_producto,
        p.descripcion,
        p.stock,
        p.precio_venta,
        p.precio_costo,
        p.cantidad_vendidos,
        (p.stock * p.precio_costo)::DECIMAL(10,2) as valor_stock,
        c.nombre_categoria,
        m.nombre as marca_nombre,
        ep.nombre as estado_nombre,
        p.fecha_creacion
      FROM producto p
      LEFT JOIN categorias c ON p.categoria_id = c.categoria_id
      LEFT JOIN marca m ON p.marca_id = m.marca_id
      LEFT JOIN estado_producto ep ON p.estado_id = ep.estado_id
      WHERE p.empresa_id = $1
    `;
    const params = [empresaId];
    let paramCount = 1;

    if (filtros.categoria_id) {
      paramCount++;
      query += ` AND p.categoria_id = $${paramCount}`;
      params.push(filtros.categoria_id);
    }

    if (filtros.marca_id) {
      paramCount++;
      query += ` AND p.marca_id = $${paramCount}`;
      params.push(filtros.marca_id);
    }

    if (filtros.estado_id) {
      paramCount++;
      query += ` AND p.estado_id = $${paramCount}`;
      params.push(filtros.estado_id);
    }

    if (filtros.stock_minimo) {
      paramCount++;
      query += ` AND p.stock < $${paramCount}`;
      params.push(filtros.stock_minimo);
    }

    if (filtros.ordenar_por) {
      const ordenPermitidos = ['stock', 'precio_venta', 'cantidad_vendidos', 'fecha_creacion'];
      if (ordenPermitidos.includes(filtros.ordenar_por)) {
        query += ` ORDER BY p.${filtros.ordenar_por} ${filtros.orden || 'DESC'}`;
      }
    } else {
      query += ` ORDER BY p.fecha_creacion DESC`;
    }

    const result = await pool.query(query, params);

    // Estadísticas de inventario
    const stats = await pool.query(
      `SELECT 
        COUNT(*) as total_productos,
        COUNT(*) FILTER (WHERE stock < $2) as productos_stock_bajo,
        SUM(stock)::INT as total_unidades,
        SUM(stock * precio_costo)::DECIMAL(10,2) as valor_total_inventario,
        AVG(precio_venta)::DECIMAL(10,2) as precio_promedio_venta,
        SUM(cantidad_vendidos)::INT as total_vendidos
      FROM producto 
      WHERE empresa_id = $1 AND estado_id = 1`,
      [empresaId, filtros.stock_minimo || 10]
    );

    // Productos por categoría
    const porCategoria = await pool.query(
      `SELECT 
        c.nombre_categoria,
        COUNT(p.producto_id) as cantidad_productos,
        SUM(p.stock)::INT as total_stock,
        SUM(p.stock * p.precio_costo)::DECIMAL(10,2) as valor_categoria
      FROM producto p
      LEFT JOIN categorias c ON p.categoria_id = c.categoria_id
      WHERE p.empresa_id = $1 AND p.estado_id = 1
      GROUP BY c.nombre_categoria
      ORDER BY cantidad_productos DESC`,
      [empresaId]
    );

    return {
      productos: result.rows,
      estadisticas: stats.rows[0],
      por_categoria: porCategoria.rows,
    };
  }

  /**
   * Reporte de Invitaciones
   */
  static async getInvitacionesReport(empresaId, filtros = {}) {
    let query = `
      SELECT 
        i.invitacion_id,
        i.email,
        i.estado,
        i.fecha_creacion,
        i.fecha_expiracion,
        i.fecha_aceptacion,
        r.nombre_rol,
        u.nombre_completo as invitado_por_nombre,
        CASE 
          WHEN i.fecha_expiracion < NOW() AND i.estado = 'pendiente' THEN true
          ELSE false
        END as esta_expirada
      FROM invitaciones i
      LEFT JOIN roles r ON i.rol_id = r.rol_id
      LEFT JOIN usuarios u ON i.invitado_por = u.uid
      WHERE i.empresa_id = $1
    `;
    const params = [empresaId];
    let paramCount = 1;

    if (filtros.estado) {
      paramCount++;
      query += ` AND i.estado = $${paramCount}`;
      params.push(filtros.estado);
    }

    if (filtros.fecha_desde) {
      paramCount++;
      query += ` AND i.fecha_creacion >= $${paramCount}`;
      params.push(filtros.fecha_desde);
    }

    if (filtros.fecha_hasta) {
      paramCount++;
      query += ` AND i.fecha_creacion <= $${paramCount}`;
      params.push(filtros.fecha_hasta);
    }

    query += ` ORDER BY i.fecha_creacion DESC`;

    const result = await pool.query(query, params);

    // Estadísticas de invitaciones
    const stats = await pool.query(
      `SELECT 
        COUNT(*) as total_invitaciones,
        COUNT(*) FILTER (WHERE estado = 'pendiente') as pendientes,
        COUNT(*) FILTER (WHERE estado = 'aceptada') as aceptadas,
        COUNT(*) FILTER (WHERE estado = 'rechazada') as rechazadas,
        COUNT(*) FILTER (WHERE fecha_expiracion < NOW() AND estado = 'pendiente') as expiradas,
        (COUNT(*) FILTER (WHERE estado = 'aceptada')::FLOAT / NULLIF(COUNT(*), 0) * 100)::DECIMAL(5,2) as tasa_aceptacion
      FROM invitaciones 
      WHERE empresa_id = $1`,
      [empresaId]
    );

    return {
      invitaciones: result.rows,
      estadisticas: stats.rows[0],
    };
  }

  /**
   * Reporte de Roles
   */
  static async getRolesReport(empresaId) {
    // Roles personalizados de la empresa
    const rolesPersonalizados = await pool.query(
      `SELECT 
        r.rol_id,
        r.nombre_rol,
        r.permisos,
        r.es_predeterminado,
        r.estado,
        r.fecha_creacion,
        COUNT(u.uid) as usuarios_asignados,
        rp.nombre_rol as plantilla_origen_nombre
      FROM roles r
      LEFT JOIN usuarios u ON u.rol_id = r.rol_id
      LEFT JOIN roles_plantilla rp ON r.plantilla_id_origen = rp.plantilla_id
      WHERE r.empresa_id = $1
      GROUP BY r.rol_id, rp.nombre_rol
      ORDER BY r.fecha_creacion DESC`,
      [empresaId]
    );

    return {
      roles_personalizados: rolesPersonalizados.rows,
      total_roles_personalizados: rolesPersonalizados.rows.length,
    };
  }

  // ============================================
  // HISTORIAL DE EJECUCIONES
  // ============================================

  /**
   * Registrar ejecución de reporte
   */
  static async registrarEjecucion(data) {
    const {
      reporte_id,
      usuario_id,
      parametros_utilizados,
      tiempo_ejecucion_ms,
      numero_registros,
      formato_exportacion,
      estado_ejecucion,
      mensaje_error,
    } = data;

    const result = await pool.query(
      `INSERT INTO reportes_historial 
       (reporte_id, usuario_id, parametros_utilizados, tiempo_ejecucion_ms, 
        numero_registros, formato_exportacion, estado_ejecucion, mensaje_error, fecha_ejecucion) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) 
       RETURNING *`,
      [
        reporte_id,
        usuario_id,
        JSON.stringify(parametros_utilizados || {}),
        tiempo_ejecucion_ms,
        numero_registros,
        formato_exportacion || null,
        estado_ejecucion || 'exitoso',
        mensaje_error || null,
      ]
    );
    return result.rows[0];
  }

  /**
   * Obtener historial de un reporte
   */
  static async getHistorial(reporteId, limite = 50) {
    const result = await pool.query(
      `SELECT 
        h.*,
        u.nombre_completo as usuario_nombre,
        u.email as usuario_email
      FROM reportes_historial h
      LEFT JOIN usuarios u ON h.usuario_id = u.uid
      WHERE h.reporte_id = $1
      ORDER BY h.fecha_ejecucion DESC
      LIMIT $2`,
      [reporteId, limite]
    );
    return result.rows;
  }

  // ============================================
  // UTILIDADES
  // ============================================

  /**
   * Calcular período de fechas
   */
  static _calcularPeriodo(periodo) {
    const ahora = new Date();
    let fechaInicio, fechaFin;

    switch (periodo) {
      case 'hoy':
        fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
        fechaFin = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 23, 59, 59);
        break;

      case 'semana_actual':
        const diaSemana = ahora.getDay();
        fechaInicio = new Date(ahora);
        fechaInicio.setDate(ahora.getDate() - diaSemana);
        fechaInicio.setHours(0, 0, 0, 0);
        fechaFin = new Date(ahora);
        fechaFin.setDate(fechaInicio.getDate() + 6);
        fechaFin.setHours(23, 59, 59);
        break;

      case 'mes_actual':
        fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        fechaFin = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59);
        break;

      case 'mes_anterior':
        fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
        fechaFin = new Date(ahora.getFullYear(), ahora.getMonth(), 0, 23, 59, 59);
        break;

      case 'trimestre_actual':
        const trimestreActual = Math.floor(ahora.getMonth() / 3);
        fechaInicio = new Date(ahora.getFullYear(), trimestreActual * 3, 1);
        fechaFin = new Date(ahora.getFullYear(), (trimestreActual + 1) * 3, 0, 23, 59, 59);
        break;

      case 'año_actual':
        fechaInicio = new Date(ahora.getFullYear(), 0, 1);
        fechaFin = new Date(ahora.getFullYear(), 11, 31, 23, 59, 59);
        break;

      case 'ultimos_7_dias':
        fechaInicio = new Date(ahora);
        fechaInicio.setDate(ahora.getDate() - 7);
        fechaInicio.setHours(0, 0, 0, 0);
        fechaFin = new Date(ahora);
        fechaFin.setHours(23, 59, 59);
        break;

      case 'ultimos_30_dias':
        fechaInicio = new Date(ahora);
        fechaInicio.setDate(ahora.getDate() - 30);
        fechaInicio.setHours(0, 0, 0, 0);
        fechaFin = new Date(ahora);
        fechaFin.setHours(23, 59, 59);
        break;

      default:
        fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        fechaFin = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59);
    }

    return { fechaInicio, fechaFin };
  }
}

module.exports = Report;
