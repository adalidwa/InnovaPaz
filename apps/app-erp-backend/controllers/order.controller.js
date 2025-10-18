const OrderModel = require('../models/order.model');

class OrderController {
  // Obtener todos los pedidos de una empresa
  static async getOrders(req, res) {
    try {
      const { empresaId } = req.params;
      const { estadoId } = req.query;

      const filters = {};
      if (estadoId) filters.estadoId = parseInt(estadoId);

      const pedidos = await OrderModel.findByEmpresa(empresaId, filters);

      // Mapear al formato esperado por el frontend
      const pedidosFormateados = pedidos.map((p) => ({
        id: p.pedido_id,
        numero: p.numero_pedido,
        clientName: p.cliente_nombre,
        clientNit: p.cliente_nit,
        fecha: p.fecha_pedido,
        fechaEntrega: p.fecha_entrega_estimada,
        cotizacion: p.numero_cotizacion,
        subtotal: parseFloat(p.subtotal),
        impuesto: parseFloat(p.impuesto),
        descuento: parseFloat(p.descuento),
        total: parseFloat(p.total),
        estado: p.estado_nombre,
        estadoId: p.estado_pedido_id,
        completado: p.completado,
        observaciones: p.observaciones,
        productos: p.detalles.map((d) => ({
          id: d.producto_id,
          nombre: d.producto_nombre,
          codigo: d.producto_codigo,
          cantidad: d.cantidad,
          precio: parseFloat(d.precio_unitario),
          subtotal: parseFloat(d.subtotal),
          descuento: parseFloat(d.descuento),
        })),
      }));

      res.json(pedidosFormateados);
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
      res.status(500).json({ message: 'Error al obtener los pedidos', error: error.message });
    }
  }

  // Obtener un pedido por ID
  static async getOrderById(req, res) {
    try {
      const { empresaId, pedidoId } = req.params;

      const pedido = await OrderModel.findByIdWithDetails(parseInt(pedidoId), empresaId);

      if (!pedido) {
        return res.status(404).json({ message: 'Pedido no encontrado' });
      }

      const pedidoFormateado = {
        id: pedido.pedido_id,
        numero: pedido.numero_pedido,
        clientName: pedido.cliente_nombre,
        clientEmail: pedido.cliente_email,
        clientPhone: pedido.cliente_telefono,
        clientNit: pedido.cliente_nit,
        fecha: pedido.fecha_pedido,
        fechaEntrega: pedido.fecha_entrega_estimada,
        cotizacion: pedido.numero_cotizacion,
        subtotal: parseFloat(pedido.subtotal),
        impuesto: parseFloat(pedido.impuesto),
        descuento: parseFloat(pedido.descuento),
        total: parseFloat(pedido.total),
        estado: pedido.estado_nombre,
        estadoId: pedido.estado_pedido_id,
        completado: pedido.completado,
        observaciones: pedido.observaciones,
        productos: pedido.detalles.map((d) => ({
          id: d.producto_id,
          nombre: d.producto_nombre,
          codigo: d.producto_codigo,
          cantidad: d.cantidad,
          precio: parseFloat(d.precio_unitario),
          subtotal: parseFloat(d.subtotal),
          descuento: parseFloat(d.descuento),
        })),
      };

      res.json(pedidoFormateado);
    } catch (error) {
      console.error('Error al obtener pedido:', error);
      res.status(500).json({ message: 'Error al obtener el pedido', error: error.message });
    }
  }

  // Crear un nuevo pedido
  static async createOrder(req, res) {
    try {
      const { empresaId } = req.params;
      const { cliente_id, cotizacion_id, fecha_entrega_estimada, productos, observaciones } =
        req.body;

      // Validaciones
      if (!cliente_id || !productos || productos.length === 0) {
        return res.status(400).json({ message: 'Datos incompletos' });
      }

      // Calcular totales
      const subtotal = productos.reduce((sum, p) => sum + p.subtotal, 0);
      const descuento = productos.reduce((sum, p) => sum + (p.descuento || 0), 0);
      const impuesto = 0; // Puedes agregar cálculo de impuesto si es necesario
      const total = subtotal - descuento + impuesto;

      const pedidoData = {
        cliente_id,
        empresa_id: empresaId,
        vendedor_id: req.user?.vendedor_id || 3, // TODO: Obtener del usuario autenticado
        cotizacion_id: cotizacion_id || null,
        fecha_entrega_estimada: fecha_entrega_estimada || null,
        subtotal,
        impuesto,
        total,
        estado_pedido_id: 1, // Pendiente
        descuento,
        observaciones: observaciones || null,
      };

      const detalles = productos.map((p) => ({
        producto_id: p.producto_id,
        cantidad: p.cantidad,
        precio_unitario: p.precio_unitario,
        subtotal: p.subtotal,
        descuento: p.descuento || 0,
      }));

      const nuevoPedido = await OrderModel.create(pedidoData, detalles);

      res.status(201).json({
        message: 'Pedido creado exitosamente',
        pedido: {
          id: nuevoPedido.pedido_id,
          numero: nuevoPedido.numero_pedido,
        },
      });
    } catch (error) {
      console.error('Error al crear pedido:', error);
      res.status(500).json({ message: 'Error al crear el pedido', error: error.message });
    }
  }

  // Actualizar estado de pedido
  static async updateOrderStatus(req, res) {
    try {
      const { empresaId, pedidoId } = req.params;
      const { estadoId } = req.body;

      if (!estadoId) {
        return res.status(400).json({ message: 'Estado requerido' });
      }

      const estadoIdInt = parseInt(estadoId);
      const pedidoIdInt = parseInt(pedidoId);

      // Obtener el pedido con detalles antes de actualizar
      const pedidoActual = await OrderModel.findByIdWithDetails(pedidoIdInt, empresaId);

      if (!pedidoActual) {
        return res.status(404).json({ message: 'Pedido no encontrado' });
      }

      // Verificar si ya está completado
      if (pedidoActual.estado_pedido_id === 3) {
        return res.status(400).json({
          message: 'Este pedido ya está completado y no se puede modificar',
        });
      }

      // Actualizar estado del pedido
      const pedidoActualizado = await OrderModel.updateStatus(pedidoIdInt, empresaId, estadoIdInt);

      // Si el nuevo estado es "Completado" (id=3), crear la venta
      if (estadoIdInt === 3) {
        const pool = require('../db');
        const client = await pool.connect();

        try {
          await client.query('BEGIN');

          // Verificar si ya existe una venta para este pedido
          const existingVenta = await client.query(
            'SELECT venta_id FROM ventas WHERE pedido_id = $1',
            [pedidoIdInt]
          );

          if (existingVenta.rows.length === 0) {
            // Generar número de venta
            const countResult = await client.query(
              'SELECT COUNT(*) as total FROM ventas WHERE empresa_id = $1',
              [empresaId]
            );
            const numeroVenta = `VENTA-${new Date().getFullYear()}-${String(parseInt(countResult.rows[0].total) + 1).padStart(3, '0')}`;

            // Obtener datos de la cotización para cliente directo
            const cotizacionResult = await client.query(
              'SELECT nombre_cliente_directo, email_cliente_directo, telefono_cliente_directo FROM cotizaciones WHERE cotizacion_id = $1',
              [pedidoActual.cotizacion_id]
            );
            const cotizacion = cotizacionResult.rows[0] || {};

            // Crear venta
            const ventaResult = await client.query(
              `
              INSERT INTO ventas (
                numero_venta, cliente_id, vendedor_id, empresa_id, 
                cotizacion_id, pedido_id, fecha_venta, hora_venta,
                subtotal, impuesto, descuento, total,
                metodo_pago_id, estado_venta_id, observaciones,
                nombre_cliente_directo, email_cliente_directo, telefono_cliente_directo
              ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()::time, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
              RETURNING venta_id`,
              [
                numeroVenta,
                pedidoActual.cliente_id,
                pedidoActual.vendedor_id,
                empresaId,
                pedidoActual.cotizacion_id,
                pedidoIdInt,
                pedidoActual.subtotal,
                pedidoActual.impuesto,
                pedidoActual.descuento,
                pedidoActual.total,
                1, // Método de pago por defecto (ajustar según necesidad)
                1, // Estado de venta "Pagada" o similar (ajustar según necesidad)
                pedidoActual.observaciones,
                cotizacion.nombre_cliente_directo,
                cotizacion.email_cliente_directo,
                cotizacion.telefono_cliente_directo,
              ]
            );

            const ventaId = ventaResult.rows[0].venta_id;

            // Obtener detalles del pedido
            const detallesResult = await client.query(
              'SELECT * FROM detalle_pedido WHERE pedido_id = $1',
              [pedidoIdInt]
            );

            // Crear detalles de venta
            for (const detalle of detallesResult.rows) {
              await client.query(
                `
                INSERT INTO detalle_venta (
                  venta_id, producto_id, cantidad, precio_unitario, subtotal, descuento
                ) VALUES ($1, $2, $3, $4, $5, $6)`,
                [
                  ventaId,
                  detalle.producto_id,
                  detalle.cantidad,
                  detalle.precio_unitario,
                  detalle.subtotal,
                  0, // descuento por línea (ajustar si es necesario)
                ]
              );
            }

            // Marcar pedido como completado
            await client.query('UPDATE pedidos SET completado = true WHERE pedido_id = $1', [
              pedidoIdInt,
            ]);

            console.log(
              `✅ Venta ${numeroVenta} creada automáticamente para pedido ${pedidoActual.numero_pedido}`
            );
          }

          await client.query('COMMIT');
        } catch (error) {
          await client.query('ROLLBACK');
          console.error('Error al crear venta:', error);
          throw error;
        } finally {
          client.release();
        }
      }

      res.json({
        message:
          estadoIdInt === 3
            ? 'Pedido completado y venta registrada en el historial exitosamente'
            : 'Estado del pedido actualizado exitosamente',
        pedido: pedidoActualizado,
      });
    } catch (error) {
      console.error('Error al actualizar estado del pedido:', error);
      res
        .status(500)
        .json({ message: 'Error al actualizar el estado del pedido', error: error.message });
    }
  }

  // Obtener estadísticas de pedidos
  static async getStats(req, res) {
    try {
      const { empresaId } = req.params;

      const stats = await OrderModel.getStats(empresaId);

      res.json({
        pendientes: parseInt(stats.pendientes),
        enProceso: parseInt(stats.en_proceso),
        completados: parseInt(stats.completados),
        total: parseInt(stats.total),
        totalMonto: parseFloat(stats.total_monto),
      });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
    }
  }
}

module.exports = OrderController;
