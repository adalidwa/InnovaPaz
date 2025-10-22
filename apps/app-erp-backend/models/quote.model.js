const pool = require('../db');

class QuoteModel {
  // Obtener todas las cotizaciones de una empresa
  static async findAll(empresaId) {
    const result = await pool.query(
      `SELECT 
        c.cotizacion_id,
        c.numero_cotizacion,
        c.fecha_cotizacion,
        c.fecha_validez,
        c.subtotal,
        c.impuesto,
        c.descuento,
        c.total,
        c.observaciones,
        c.convertida_pedido,
        c.nombre_cliente_directo,
        c.email_cliente_directo,
        c.telefono_cliente_directo,
        ec.nombre AS estado,
        COALESCE(cl.nombre, c.nombre_cliente_directo) AS cliente_nombre,
        COUNT(dc.detalle_cotizacion_id) AS total_items
       FROM cotizaciones c
       LEFT JOIN estado_cotizacion ec ON c.estado_cotizacion_id = ec.estado_cotizacion_id
       LEFT JOIN clientes cl ON c.cliente_id = cl.cliente_id AND cl.empresa_id = $1
       LEFT JOIN detalle_cotizacion dc ON c.cotizacion_id = dc.cotizacion_id
       WHERE c.empresa_id = $1
       GROUP BY c.cotizacion_id, ec.nombre, cl.nombre
       ORDER BY c.fecha_cotizacion DESC`,
      [empresaId]
    );
    return result.rows;
  }

  // Obtener cotización por ID
  static async findById(cotizacionId, empresaId) {
    const result = await pool.query(
      `SELECT 
        c.*,
        ec.nombre AS estado,
        COALESCE(cl.nombre, c.nombre_cliente_directo) AS cliente_nombre,
        COALESCE(cl.email, c.email_cliente_directo) AS cliente_email,
        COALESCE(cl.telefono, c.telefono_cliente_directo) AS cliente_telefono
       FROM cotizaciones c
       LEFT JOIN estado_cotizacion ec ON c.estado_cotizacion_id = ec.estado_cotizacion_id
       LEFT JOIN clientes cl ON c.cliente_id = cl.cliente_id AND cl.empresa_id = $2
       WHERE c.cotizacion_id = $1 AND c.empresa_id = $2`,
      [cotizacionId, empresaId]
    );
    return result.rows[0];
  }

  // Obtener detalles de una cotización con validación de empresa
  static async findDetails(cotizacionId, empresaId = null) {
    let query = `
      SELECT 
        dc.*,
        p.nombre_producto AS producto_nombre,
        p.codigo AS producto_codigo
       FROM detalle_cotizacion dc
       INNER JOIN producto p ON dc.producto_id = p.producto_id
       WHERE dc.cotizacion_id = $1`;

    const params = [cotizacionId];

    // Si se proporciona empresa_id, validar que los productos pertenezcan a esa empresa
    if (empresaId) {
      query += ` AND p.empresa_id = $2`;
      params.push(empresaId);
    }

    const result = await pool.query(query, params);
    return result.rows;
  }

  // Crear nueva cotización con validación de productos
  static async create(quoteData, empresaId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Validar que todos los productos pertenezcan a la empresa
      if (quoteData.productos && quoteData.productos.length > 0) {
        const productIds = quoteData.productos.map((p) => p.producto_id);
        const validationResult = await client.query(
          `SELECT producto_id FROM producto WHERE producto_id = ANY($1) AND empresa_id = $2`,
          [productIds, empresaId]
        );

        if (validationResult.rows.length !== productIds.length) {
          throw new Error('Algunos productos no pertenecen a esta empresa');
        }
      }

      // Validar que el cliente pertenezca a la empresa (si existe cliente_id)
      if (quoteData.cliente_id) {
        const clientValidation = await client.query(
          `SELECT cliente_id FROM clientes WHERE cliente_id = $1 AND empresa_id = $2`,
          [quoteData.cliente_id, empresaId]
        );

        if (clientValidation.rows.length === 0) {
          throw new Error('El cliente no pertenece a esta empresa');
        }
      }

      // Insertar cotización
      const quoteResult = await client.query(
        `INSERT INTO cotizaciones (
          numero_cotizacion, cliente_id, vendedor_id, empresa_id,
          fecha_cotizacion, fecha_validez, subtotal, impuesto, descuento, total,
          estado_cotizacion_id, observaciones,
          nombre_cliente_directo, email_cliente_directo, telefono_cliente_directo
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *`,
        [
          quoteData.numero_cotizacion,
          quoteData.cliente_id || null,
          quoteData.vendedor_id || null,
          empresaId,
          quoteData.fecha_cotizacion || new Date(),
          quoteData.fecha_validez,
          quoteData.subtotal,
          quoteData.impuesto || 0,
          quoteData.descuento || 0,
          quoteData.total,
          quoteData.estado_cotizacion_id || 1, // Por defecto: Pendiente
          quoteData.observaciones || null,
          quoteData.nombre_cliente_directo || null,
          quoteData.email_cliente_directo || null,
          quoteData.telefono_cliente_directo || null,
        ]
      );

      const cotizacionId = quoteResult.rows[0].cotizacion_id;

      // Insertar detalles
      if (quoteData.productos && quoteData.productos.length > 0) {
        for (const producto of quoteData.productos) {
          await client.query(
            `INSERT INTO detalle_cotizacion (
              cotizacion_id, producto_id, cantidad, precio_unitario, subtotal, descuento
            ) VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              cotizacionId,
              producto.producto_id,
              producto.cantidad,
              producto.precio_unitario,
              producto.subtotal,
              producto.descuento || 0,
            ]
          );
        }
      }

      await client.query('COMMIT');
      return quoteResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Actualizar cotización
  static async update(cotizacionId, quoteData, empresaId) {
    const result = await pool.query(
      `UPDATE cotizaciones SET
        fecha_validez = COALESCE($1, fecha_validez),
        subtotal = COALESCE($2, subtotal),
        impuesto = COALESCE($3, impuesto),
        descuento = COALESCE($4, descuento),
        total = COALESCE($5, total),
        estado_cotizacion_id = COALESCE($6, estado_cotizacion_id),
        observaciones = COALESCE($7, observaciones),
        nombre_cliente_directo = COALESCE($8, nombre_cliente_directo),
        email_cliente_directo = COALESCE($9, email_cliente_directo),
        telefono_cliente_directo = COALESCE($10, telefono_cliente_directo)
       WHERE cotizacion_id = $11 AND empresa_id = $12
       RETURNING *`,
      [
        quoteData.fecha_validez,
        quoteData.subtotal,
        quoteData.impuesto,
        quoteData.descuento,
        quoteData.total,
        quoteData.estado_cotizacion_id,
        quoteData.observaciones,
        quoteData.nombre_cliente_directo,
        quoteData.email_cliente_directo,
        quoteData.telefono_cliente_directo,
        cotizacionId,
        empresaId,
      ]
    );
    return result.rows[0];
  }

  // Actualizar estado de cotizacion
  static async updateStatus(cotizacionId, estadoId, empresaId) {
    const result = await pool.query(
      `UPDATE cotizaciones SET estado_cotizacion_id = $1
       WHERE cotizacion_id = $2 AND empresa_id = $3
       RETURNING *`,
      [estadoId, cotizacionId, empresaId]
    );
    return result.rows[0];
  }

  // Marcar cotización como convertida a pedido y crear el pedido
  static async markAsConverted(cotizacionId, empresaId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Obtener datos de la cotización
      const quoteResult = await client.query(
        `SELECT * FROM cotizaciones WHERE cotizacion_id = $1 AND empresa_id = $2`,
        [cotizacionId, empresaId]
      );

      if (quoteResult.rows.length === 0) {
        throw new Error('Cotización no encontrada');
      }

      const quote = quoteResult.rows[0];

      // 2. Verificar si ya está convertida
      if (quote.convertida_pedido) {
        throw new Error('La cotización ya ha sido convertida a pedido');
      }

      // 3. Obtener detalles de la cotización (solo productos de la empresa)
      const detailsResult = await client.query(
        `SELECT dc.* FROM detalle_cotizacion dc
         INNER JOIN producto p ON dc.producto_id = p.producto_id
         WHERE dc.cotizacion_id = $1 AND p.empresa_id = $2`,
        [cotizacionId, empresaId]
      );

      // 4. Generar número de pedido
      // 4. Generar número de pedido basado en el último número
      const lastOrderResult = await client.query(
        `SELECT numero_pedido FROM pedidos ORDER BY pedido_id DESC LIMIT 1`
      );

      let numeroPedido;
      if (lastOrderResult.rows.length === 0) {
        numeroPedido = `PED-${new Date().getFullYear()}-001`;
      } else {
        const lastNumber = lastOrderResult.rows[0].numero_pedido;
        const match = lastNumber.match(/PED-(\d{4})-(\d{3})/);

        if (match) {
          const year = new Date().getFullYear();
          const lastYear = parseInt(match[1]);
          const lastSeq = parseInt(match[2]);

          if (year === lastYear) {
            numeroPedido = `PED-${year}-${String(lastSeq + 1).padStart(3, '0')}`;
          } else {
            numeroPedido = `PED-${year}-001`;
          }
        } else {
          numeroPedido = `PED-${new Date().getFullYear()}-001`;
        }
      }

      // 5. Obtener el estado "Pendiente" (id = 1)
      const estadoPendienteId = 1;

      // 6. Crear el pedido
      const orderResult = await client.query(
        `INSERT INTO pedidos (
          numero_pedido, cliente_id, vendedor_id, empresa_id, cotizacion_id,
          fecha_pedido, subtotal, impuesto, descuento, total,
          estado_pedido_id, observaciones, completado
        ) VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7, $8, $9, $10, $11, false)
        RETURNING *`,
        [
          numeroPedido,
          quote.cliente_id,
          quote.vendedor_id,
          quote.empresa_id,
          quote.cotizacion_id,
          quote.subtotal,
          quote.impuesto,
          quote.descuento,
          quote.total,
          estadoPendienteId,
          quote.observaciones,
        ]
      );

      const pedidoId = orderResult.rows[0].pedido_id;

      // 7. Crear detalles del pedido
      for (const detail of detailsResult.rows) {
        await client.query(
          `INSERT INTO detalle_pedido (
            pedido_id, producto_id, cantidad, precio_unitario, subtotal
          ) VALUES ($1, $2, $3, $4, $5)`,
          [pedidoId, detail.producto_id, detail.cantidad, detail.precio_unitario, detail.subtotal]
        );
      }

      // 8. Marcar la cotización como convertida
      await client.query(
        `UPDATE cotizaciones SET convertida_pedido = true, estado_cotizacion_id = 4
         WHERE cotizacion_id = $1`,
        [cotizacionId]
      );

      await client.query('COMMIT');

      return orderResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Eliminar cotización
  static async delete(cotizacionId, empresaId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Eliminar detalles
      await client.query('DELETE FROM detalle_cotizacion WHERE cotizacion_id = $1', [cotizacionId]);

      // Eliminar cotización
      const result = await client.query(
        'DELETE FROM cotizaciones WHERE cotizacion_id = $1 AND empresa_id = $2 RETURNING *',
        [cotizacionId, empresaId]
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

  // Generar número de cotización automático
  static async generateQuoteNumber(empresaId) {
    // Buscar el último número globalmente para evitar conflictos con la constraint UNIQUE
    const result = await pool.query(
      `SELECT numero_cotizacion 
       FROM cotizaciones 
       ORDER BY cotizacion_id DESC 
       LIMIT 1`
    );

    if (result.rows.length === 0) {
      return `COT-${new Date().getFullYear()}-001`;
    }

    const lastNumber = result.rows[0].numero_cotizacion;
    const match = lastNumber.match(/COT-(\d{4})-(\d{3})/);

    if (match) {
      const year = new Date().getFullYear();
      const lastYear = parseInt(match[1]);
      const lastSeq = parseInt(match[2]);

      if (year === lastYear) {
        return `COT-${year}-${String(lastSeq + 1).padStart(3, '0')}`;
      } else {
        return `COT-${year}-001`;
      }
    }

    return `COT-${new Date().getFullYear()}-001`;
  }
}

module.exports = QuoteModel;
