const pool = require('../db');

class SaleModel {
  // Obtener todas las ventas de una empresa CON DETALLES
  static async findByEmpresa(empresaId, filters = {}) {
    let query = `
      SELECT v.*, 
        COALESCE(c.nombre, v.nombre_cliente_directo) as cliente_nombre,
        c.nit_ci as cliente_nit,
        ev.nombre as estado_nombre,
        mp.nombre as metodo_pago_nombre
      FROM ventas v
      LEFT JOIN clientes c ON v.cliente_id = c.cliente_id AND c.empresa_id = $1
      LEFT JOIN estado_venta ev ON v.estado_venta_id = ev.estado_venta_id
      LEFT JOIN metodo_pago mp ON v.metodo_pago_id = mp.metodo_pago_id
      WHERE v.empresa_id = $1
    `;

    const params = [empresaId];
    let paramCount = 1;

    if (filters.fechaInicio && filters.fechaFin) {
      paramCount++;
      query += ` AND v.fecha_venta BETWEEN $${paramCount} AND $${paramCount + 1}`;
      params.push(filters.fechaInicio, filters.fechaFin);
      paramCount++;
    }

    if (filters.clienteId) {
      paramCount++;
      query += ` AND v.cliente_id = $${paramCount}`;
      params.push(filters.clienteId);
    }

    if (filters.estadoId) {
      paramCount++;
      query += ` AND v.estado_venta_id = $${paramCount}`;
      params.push(filters.estadoId);
    }

    query += ` ORDER BY v.fecha_venta DESC, v.hora_venta DESC`;

    const result = await pool.query(query, params);

    // Obtener detalles para cada venta
    const ventas = result.rows;
    for (const venta of ventas) {
      const detallesResult = await pool.query(
        `SELECT dv.*, 
          p.codigo as producto_codigo,
          p.nombre_producto as producto_nombre,
          p.imagen as producto_imagen
        FROM detalle_venta dv
        LEFT JOIN producto p ON dv.producto_id = p.producto_id
        WHERE dv.venta_id = $1 AND p.empresa_id = $2`,
        [venta.venta_id, empresaId]
      );
      venta.detalles = detallesResult.rows;
    }

    return ventas;
  }

  // Obtener venta por ID con detalles
  static async findByIdWithDetails(ventaId, empresaId) {
    const ventaResult = await pool.query(
      `SELECT v.*, 
        COALESCE(c.nombre, v.nombre_cliente_directo) as cliente_nombre,
        COALESCE(c.email, v.email_cliente_directo) as cliente_email,
        COALESCE(c.telefono, v.telefono_cliente_directo) as cliente_telefono,
        c.nit_ci as cliente_nit,
        c.direccion as cliente_direccion,
        ev.nombre as estado_nombre,
        mp.nombre as metodo_pago_nombre
      FROM ventas v
      LEFT JOIN clientes c ON v.cliente_id = c.cliente_id AND c.empresa_id = $2
      LEFT JOIN estado_venta ev ON v.estado_venta_id = ev.estado_venta_id
      LEFT JOIN metodo_pago mp ON v.metodo_pago_id = mp.metodo_pago_id
      WHERE v.venta_id = $1 AND v.empresa_id = $2`,
      [ventaId, empresaId]
    );

    if (ventaResult.rows.length === 0) return null;

    const venta = ventaResult.rows[0];

    // Obtener detalles de la venta
    const detallesResult = await pool.query(
      `SELECT dv.*, 
        p.codigo as producto_codigo,
        p.nombre_producto as producto_nombre,
        p.imagen as producto_imagen
      FROM detalle_venta dv
      LEFT JOIN producto p ON dv.producto_id = p.producto_id
      WHERE dv.venta_id = $1 AND p.empresa_id = $2`,
      [ventaId, empresaId]
    );

    venta.detalles = detallesResult.rows;
    return venta;
  }

  // Crear venta con detalles
  static async create(ventaData, detalles) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Extraer variables primero antes de usarlas
      const {
        cliente_id,
        empresa_id,
        vendedor_id,
        subtotal,
        impuesto,
        total,
        metodo_pago_id,
        estado_venta_id,
        descuento,
        observaciones,
        numero_factura,
      } = ventaData;

      // Validar que todos los productos pertenezcan a la empresa
      if (detalles && detalles.length > 0) {
        const productIds = detalles.map((d) => d.producto_id);
        const validationResult = await client.query(
          `SELECT producto_id FROM producto WHERE producto_id = ANY($1) AND empresa_id = $2`,
          [productIds, empresa_id]
        );

        if (validationResult.rows.length !== productIds.length) {
          throw new Error('Algunos productos no pertenecen a esta empresa');
        }
      }

      // Validar que el cliente pertenezca a la empresa
      if (cliente_id) {
        const clientValidation = await client.query(
          `SELECT cliente_id FROM clientes WHERE cliente_id = $1 AND empresa_id = $2`,
          [cliente_id, empresa_id]
        );

        if (clientValidation.rows.length === 0) {
          throw new Error('El cliente no pertenece a esta empresa');
        }
      }

      // Validar disponibilidad de stock para cada producto
      for (const detalle of detalles) {
        const stockCheck = await client.query(
          `SELECT stock, nombre_producto FROM producto WHERE producto_id = $1 AND empresa_id = $2`,
          [detalle.producto_id, empresa_id]
        );

        if (stockCheck.rows.length === 0) {
          throw new Error(`Producto con ID ${detalle.producto_id} no encontrado`);
        }

        const producto = stockCheck.rows[0];
        const stockActual = producto.stock || 0;

        if (stockActual < detalle.cantidad) {
          throw new Error(
            `Stock insuficiente para ${producto.nombre_producto}. Stock disponible: ${stockActual}, cantidad solicitada: ${detalle.cantidad}`
          );
        }
      }

      // Generar número de venta único globalmente
      const numeroVentaResult = await client.query(
        `SELECT COALESCE(MAX(CAST(SUBSTRING(numero_venta FROM 'V-([0-9]+)') AS INTEGER)), 0) + 1 as next_num
         FROM ventas`
      );
      const numeroVenta = `V-${String(numeroVentaResult.rows[0].next_num).padStart(6, '0')}`;

      // Insertar venta
      const ventaResult = await client.query(
        `INSERT INTO ventas (
          numero_venta, cliente_id, vendedor_id, empresa_id,
          fecha_venta, hora_venta, subtotal, impuesto, total,
          metodo_pago_id, estado_venta_id, descuento, observaciones, numero_factura
        ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIME, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *`,
        [
          numeroVenta,
          cliente_id,
          vendedor_id || null,
          empresa_id,
          subtotal,
          impuesto || 0,
          total,
          metodo_pago_id,
          estado_venta_id || 1,
          descuento || 0,
          observaciones,
          numero_factura,
        ]
      );

      const venta = ventaResult.rows[0];

      // Insertar detalles de venta y descontar stock
      for (const detalle of detalles) {
        // Insertar detalle de venta
        await client.query(
          `INSERT INTO detalle_venta (
            venta_id, producto_id, cantidad, precio_unitario, subtotal, descuento
          ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            venta.venta_id,
            detalle.producto_id,
            detalle.cantidad,
            detalle.precio_unitario,
            detalle.subtotal,
            detalle.descuento || 0,
          ]
        );

        // Descontar stock del producto
        await client.query(
          `UPDATE producto 
           SET stock = stock - $1 
           WHERE producto_id = $2 AND empresa_id = $3`,
          [detalle.cantidad, detalle.producto_id, empresa_id]
        );

        console.log(
          `✅ Stock actualizado: Producto ID ${detalle.producto_id}, cantidad descontada: ${detalle.cantidad}`
        );
      }

      await client.query('COMMIT');
      console.log(`✅ Venta ${numeroVenta} creada exitosamente con descuento de stock`);

      // Obtener venta con detalles
      return await this.findByIdWithDetails(venta.venta_id, empresa_id);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error al crear venta:', error.message);
      console.error('📋 Stack:', error.stack);
      console.error('📋 Datos recibidos:', {
        empresa_id: ventaData.empresa_id,
        cliente_id: ventaData.cliente_id,
        vendedor_id: ventaData.vendedor_id,
        productos: detalles.map((d) => ({ producto_id: d.producto_id, cantidad: d.cantidad })),
      });
      throw error;
    } finally {
      client.release();
    }
  }

  // Actualizar estado de venta
  static async updateStatus(ventaId, empresaId, estadoVentaId) {
    const result = await pool.query(
      `UPDATE ventas 
       SET estado_venta_id = $1 
       WHERE venta_id = $2 AND empresa_id = $3
       RETURNING *`,
      [estadoVentaId, ventaId, empresaId]
    );

    return result.rows[0];
  }

  // Cancelar venta
  static async cancel(ventaId, empresaId) {
    return await this.updateStatus(ventaId, empresaId, 3); // 3 = Cancelada
  }

  // Obtener estadísticas
  static async getStats(empresaId, periodo = 'month') {
    let fechaInicio;
    const fechaFin = new Date();

    switch (periodo) {
      case 'today':
        fechaInicio = new Date();
        fechaInicio.setHours(0, 0, 0, 0);
        break;
      case 'week':
        fechaInicio = new Date();
        fechaInicio.setDate(fechaFin.getDate() - 7);
        break;
      case 'month':
        fechaInicio = new Date();
        fechaInicio.setMonth(fechaFin.getMonth() - 1);
        break;
      case 'year':
        fechaInicio = new Date();
        fechaInicio.setFullYear(fechaFin.getFullYear() - 1);
        break;
      default:
        fechaInicio = new Date();
        fechaInicio.setMonth(fechaFin.getMonth() - 1);
    }

    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_ventas,
        COALESCE(SUM(total), 0) as total_monto,
        COALESCE(AVG(total), 0) as promedio_venta
       FROM ventas
       WHERE empresa_id = $1
       AND fecha_venta BETWEEN $2 AND $3
       AND estado_venta_id = 1`,
      [empresaId, fechaInicio, fechaFin]
    );

    return result.rows[0];
  }
}

module.exports = SaleModel;
