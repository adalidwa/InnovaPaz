const pool = require('../db');

class OrderModel {
  // Obtener todos los pedidos de una empresa CON DETALLES
  static async findByEmpresa(empresaId, filters = {}) {
    let query = `
      SELECT p.*, 
        COALESCE(c.nombre, cot.nombre_cliente_directo) as cliente_nombre,
        c.nit_ci as cliente_nit,
        ep.nombre as estado_nombre,
        cot.numero_cotizacion
      FROM pedidos p
      LEFT JOIN clientes c ON p.cliente_id = c.cliente_id
      LEFT JOIN estado_pedido ep ON p.estado_pedido_id = ep.estado_pedido_id
      LEFT JOIN cotizaciones cot ON p.cotizacion_id = cot.cotizacion_id
      WHERE p.empresa_id = $1
    `;

    const params = [empresaId];
    let paramCount = 1;

    if (filters.estadoId) {
      paramCount++;
      query += ` AND p.estado_pedido_id = $${paramCount}`;
      params.push(filters.estadoId);
    }

    query += ` ORDER BY p.fecha_pedido DESC`;

    const result = await pool.query(query, params);

    // Obtener detalles para cada pedido
    const pedidos = result.rows;
    for (const pedido of pedidos) {
      const detallesResult = await pool.query(
        `SELECT dp.*, 
          p.codigo as producto_codigo,
          p.nombre_producto as producto_nombre
        FROM detalle_pedido dp
        LEFT JOIN producto p ON dp.producto_id = p.producto_id
        WHERE dp.pedido_id = $1`,
        [pedido.pedido_id]
      );
      pedido.detalles = detallesResult.rows;
    }

    return pedidos;
  }

  // Obtener pedido por ID con detalles
  static async findByIdWithDetails(pedidoId, empresaId) {
    const pedidoResult = await pool.query(
      `SELECT p.*, 
        COALESCE(c.nombre, cot.nombre_cliente_directo) as cliente_nombre,
        COALESCE(c.email, cot.email_cliente_directo) as cliente_email,
        COALESCE(c.telefono, cot.telefono_cliente_directo) as cliente_telefono,
        c.nit_ci as cliente_nit,
        ep.nombre as estado_nombre,
        cot.numero_cotizacion
      FROM pedidos p
      LEFT JOIN clientes c ON p.cliente_id = c.cliente_id
      LEFT JOIN estado_pedido ep ON p.estado_pedido_id = ep.estado_pedido_id
      LEFT JOIN cotizaciones cot ON p.cotizacion_id = cot.cotizacion_id
      WHERE p.pedido_id = $1 AND p.empresa_id = $2`,
      [pedidoId, empresaId]
    );

    if (pedidoResult.rows.length === 0) return null;

    const pedido = pedidoResult.rows[0];

    // Obtener detalles del pedido
    const detallesResult = await pool.query(
      `SELECT dp.*, 
        p.codigo as producto_codigo,
        p.nombre_producto as producto_nombre
      FROM detalle_pedido dp
      LEFT JOIN producto p ON dp.producto_id = p.producto_id
      WHERE dp.pedido_id = $1`,
      [pedidoId]
    );

    pedido.detalles = detallesResult.rows;
    return pedido;
  }

  // Crear pedido con detalles
  static async create(pedidoData, detalles) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const {
        cliente_id,
        empresa_id,
        vendedor_id,
        cotizacion_id,
        fecha_entrega_estimada,
        subtotal,
        impuesto,
        total,
        estado_pedido_id,
        descuento,
        observaciones,
      } = pedidoData;

      // Generar número de pedido
      const numeroPedidoResult = await client.query(
        `SELECT COALESCE(MAX(CAST(SUBSTRING(numero_pedido FROM '[0-9]+') AS INTEGER)), 0) + 1 as next_num
         FROM pedidos WHERE empresa_id = $1`,
        [empresa_id]
      );
      const numeroPedido = `PED-${String(numeroPedidoResult.rows[0].next_num).padStart(6, '0')}`;

      // Insertar pedido
      const pedidoResult = await client.query(
        `INSERT INTO pedidos (
          numero_pedido, cliente_id, vendedor_id, empresa_id, cotizacion_id,
          fecha_pedido, fecha_entrega_estimada, subtotal, impuesto, total,
          estado_pedido_id, descuento, observaciones, completado
        ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6, $7, $8, $9, $10, $11, $12, false)
        RETURNING *`,
        [
          numeroPedido,
          cliente_id,
          vendedor_id,
          empresa_id,
          cotizacion_id,
          fecha_entrega_estimada,
          subtotal,
          impuesto || 0,
          total,
          estado_pedido_id || 1,
          descuento || 0,
          observaciones,
        ]
      );

      const pedido = pedidoResult.rows[0];

      // Insertar detalles de pedido
      for (const detalle of detalles) {
        await client.query(
          `INSERT INTO detalle_pedido (
            pedido_id, producto_id, cantidad, precio_unitario, subtotal, descuento
          ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            pedido.pedido_id,
            detalle.producto_id,
            detalle.cantidad,
            detalle.precio_unitario,
            detalle.subtotal,
            detalle.descuento || 0,
          ]
        );
      }

      await client.query('COMMIT');

      // Obtener pedido con detalles
      return await this.findByIdWithDetails(pedido.pedido_id, empresa_id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Actualizar estado de pedido
  static async updateStatus(pedidoId, empresaId, estadoPedidoId) {
    const result = await pool.query(
      `UPDATE pedidos 
       SET estado_pedido_id = $1,
           completado = CASE WHEN $1 = 3 THEN true ELSE false END
       WHERE pedido_id = $2 AND empresa_id = $3
       RETURNING *`,
      [estadoPedidoId, pedidoId, empresaId]
    );

    return result.rows[0];
  }

  // Obtener estadísticas
  static async getStats(empresaId) {
    const result = await pool.query(
      `SELECT 
        COUNT(*) FILTER (WHERE estado_pedido_id = 1) as pendientes,
        COUNT(*) FILTER (WHERE estado_pedido_id = 2) as en_proceso,
        COUNT(*) FILTER (WHERE estado_pedido_id = 3) as completados,
        COUNT(*) as total,
        COALESCE(SUM(total), 0) as total_monto
       FROM pedidos
       WHERE empresa_id = $1`,
      [empresaId]
    );

    return result.rows[0];
  }
}

module.exports = OrderModel;
