const express = require('express');
const router = express.Router();
const pool = require('../db');

// Obtener movimientos recientes de inventario
router.get('/movements', async (req, res) => {
  try {
    const { empresa_id, limit = 10 } = req.query;

    if (!empresa_id) {
      return res.status(400).json({
        success: false,
        message: 'empresa_id es requerido',
      });
    }

    const query = `
      SELECT 
        mi.movimiento_id,
        p.nombre_producto,
        tm.nombre as tipo_movimiento,
        tm.tipo as tipo,
        mi.cantidad,
        mi.fecha_movimiento,
        mi.motivo,
        mi.entidad_tipo
      FROM movimientos_inventario mi
      JOIN producto p ON mi.producto_id = p.producto_id
      JOIN tipo_movimiento tm ON mi.tipo_movimiento_id = tm.tipo_movimiento_id
      WHERE mi.empresa_id = $1
      ORDER BY mi.fecha_movimiento DESC
      LIMIT $2
    `;

    const result = await pool.query(query, [empresa_id, limit]);

    res.status(200).json({
      success: true,
      movements: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Error al obtener movimientos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener movimientos de inventario',
      error: error.message,
    });
  }
});

// Obtener productos críticos (stock bajo)
router.get('/critical-products', async (req, res) => {
  try {
    const { empresa_id } = req.query;

    if (!empresa_id) {
      return res.status(400).json({
        success: false,
        message: 'empresa_id es requerido',
      });
    }

    const query = `
      SELECT 
        p.producto_id,
        p.nombre_producto,
        p.stock,
        ap.stock_minimo,
        c.nombre_categoria as categoria,
        p.imagen
      FROM producto p
      LEFT JOIN aprovisionamiento ap ON p.producto_id = ap.producto_id
      LEFT JOIN categorias c ON p.categoria_id = c.categoria_id
      WHERE p.empresa_id = $1 
        AND p.stock <= COALESCE(ap.stock_minimo, 10)
        AND p.estado_id = 1
      ORDER BY (p.stock::float / COALESCE(ap.stock_minimo, 10)) ASC
    `;

    const result = await pool.query(query, [empresa_id]);

    res.status(200).json({
      success: true,
      criticalProducts: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Error al obtener productos críticos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos críticos',
      error: error.message,
    });
  }
});

module.exports = router;
