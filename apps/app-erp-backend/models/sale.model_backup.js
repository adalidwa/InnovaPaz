const pool = require('../db');

class SaleModel {
  // Obtener todas las ventas de una empresa
  static async findByEmpresa(empresaId, filters = {}) {
    let query = `
      SELECT v.*, 
        c.nombre as cliente_nombre,
        c.nit_ci as cliente_nit,
        ev.nombre as estado_nombre,
        mp.nombre as metodo_pago_nombre
      FROM ventas v
      LEFT JOIN clientes c ON v.cliente_id = c.cliente_id
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
    return result.rows;
  }

  // Obtener venta por ID con detalles
  static async findByIdWithDetails(ventaId, empresaId) {
    const ventaResult = await pool.query(
      `SELECT v.*, 
        c.nombre as cliente_nombre,
        c.email as cliente_email,
        c.telefono as cliente_telefono,
        c.nit_ci as cliente_nit,
        c.direccion as cliente_direccion,
        ev.nombre as estado_nombre,
        mp.nombre as metodo_pago_nombre
      FROM ventas v
      LEFT JOIN clientes c ON v.cliente_id = c.cliente_id
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
      WHERE dv.venta_id = $1`,
      [ventaId]
    );

    venta.detalles = detallesResult.rows;
    return venta;
  }

  // Crear venta con detalles
  static async create(ventaData, detalles) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

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

      // Generar número de venta
      const numeroVentaResult = await client.query(
        `SELECT COALESCE(MAX(CAST(SUBSTRING(numero_venta FROM '[0-9]+') AS INTEGER)), 0) + 1 as next_num
         FROM ventas WHERE empresa_id = $1`,
        [empresa_id]
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
          vendedor_id,
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

      // Insertar detalles de venta y actualizar stock
      for (const detalle of detalles) {
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

        // Actualizar stock del producto
        await client.query(
          `UPDATE producto 
           SET stock = stock - $1,
               cantidad_vendidos = cantidad_vendidos + $1
           WHERE producto_id = $2`,
          [detalle.cantidad, detalle.producto_id]
        );
      }

      // Actualizar última compra del cliente
      await client.query(
        `UPDATE clientes SET ultima_compra = CURRENT_DATE
         WHERE cliente_id = $1`,
        [cliente_id]
      );

      await client.query('COMMIT');

      // Retornar venta completa con detalles
      return await this.findByIdWithDetails(venta.venta_id, empresa_id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Actualizar estado de venta
  static async updateStatus(ventaId, empresaId, estadoVentaId) {
    const result = await pool.query(
      `UPDATE ventas SET estado_venta_id = $1
       WHERE venta_id = $2 AND empresa_id = $3
       RETURNING *`,
      [estadoVentaId, ventaId, empresaId]
    );
    return result.rows[0];
  }

  // Cancelar venta (devolver stock)
  static async cancel(ventaId, empresaId) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Obtener detalles de la venta
      const detallesResult = await client.query(`SELECT * FROM detalle_venta WHERE venta_id = $1`, [
        ventaId,
      ]);

      // Devolver stock
      for (const detalle of detallesResult.rows) {
        await client.query(
          `UPDATE producto 
           SET stock = stock + $1,
               cantidad_vendidos = cantidad_vendidos - $1
           WHERE producto_id = $2`,
          [detalle.cantidad, detalle.producto_id]
        );
      }

      // Actualizar estado de venta a cancelado (asumiendo estado_id = 3)
      const result = await client.query(
        `UPDATE ventas SET estado_venta_id = 3
         WHERE venta_id = $1 AND empresa_id = $2
         RETURNING *`,
        [ventaId, empresaId]
      );

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Obtener estadísticas de ventas
  static async getStats(empresaId, periodo = 'month') {
    let dateFilter = '';

    switch (periodo) {
      case 'today':
        dateFilter = 'AND DATE(v.fecha_venta) = CURRENT_DATE';
        break;
      case 'week':
        dateFilter = "AND v.fecha_venta >= CURRENT_DATE - INTERVAL '7 days'";
        break;
      case 'month':
        dateFilter = "AND v.fecha_venta >= CURRENT_DATE - INTERVAL '30 days'";
        break;
      case 'year':
        dateFilter = "AND v.fecha_venta >= CURRENT_DATE - INTERVAL '1 year'";
        break;
    }

    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_ventas,
        COALESCE(SUM(v.total), 0) as total_monto,
        COALESCE(AVG(v.total), 0) as promedio_venta
       FROM ventas v
       WHERE v.empresa_id = $1 
       AND v.estado_venta_id IN (1, 2) ${dateFilter}`,
      [empresaId]
    );

    return result.rows[0];
  }
}

module.exports = SaleModel;
