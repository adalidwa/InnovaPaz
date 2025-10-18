const pool = require('../db');

const createProduct = async (req, res, next) => {
  const {
    codigo,
    nombre_producto,
    descripcion,
    imagen,
    precio_venta,
    precio_costo,
    stock,
    categoria_id,
    empresa_id,
    marca_id,
    estado_id,
    dynamicAttributes,
  } = req.body;

  try {
    if (!nombre_producto || !precio_venta || !precio_costo || !empresa_id) {
      return res.status(400).json({
        success: false,
        message:
          'Los campos nombre_producto, precio_venta, precio_costo y empresa_id son requeridos',
      });
    }

    // Iniciar transacción para insertar producto y atributos
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Insertar producto
      const productResult = await client.query(
        `INSERT INTO producto 
         (codigo, nombre_producto, descripcion, imagen, precio_venta, precio_costo, stock, cantidad_vendidos, categoria_id, empresa_id, marca_id, estado_id, fecha_creacion, fecha_modificacion) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
         RETURNING *`,
        [
          codigo || null,
          nombre_producto,
          descripcion || null,
          imagen || null,
          precio_venta,
          precio_costo,
          stock || 0,
          0, // cantidad_vendidos inicia en 0
          categoria_id || null,
          empresa_id,
          marca_id || null,
          estado_id || 1, // Estado activo por defecto
        ]
      );

      const newProduct = productResult.rows[0];

      // Insertar atributos dinámicos si existen
      if (dynamicAttributes && Object.keys(dynamicAttributes).length > 0) {
        for (const [attributeId, value] of Object.entries(dynamicAttributes)) {
          if (value !== null && value !== undefined && value !== '') {
            await client.query(
              'INSERT INTO atributos_productos (producto_id, atributo_id, valor) VALUES ($1, $2, $3)',
              [newProduct.producto_id, parseInt(attributeId), value.toString()]
            );
          }
        }
      }

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Producto creado exitosamente',
        product: newProduct,
      });
    } catch (transactionError) {
      await client.query('ROLLBACK');
      throw transactionError;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error al crear producto:', error);
    next(error);
  }
};

const getAllProducts = async (req, res, next) => {
  try {
    const { empresa_id } = req.query;

    let query = `
      SELECT 
        p.*,
        c.nombre_categoria,
        m.nombre as marca_nombre,
        ep.nombre as estado_nombre
      FROM producto p
      LEFT JOIN categorias c ON p.categoria_id = c.categoria_id
      LEFT JOIN marca m ON p.marca_id = m.marca_id
      LEFT JOIN estado_producto ep ON p.estado_id = ep.estado_id
    `;

    let params = [];

    if (empresa_id) {
      query += ' WHERE p.empresa_id = $1';
      params.push(empresa_id);
    }

    query += ' ORDER BY p.fecha_creacion DESC';

    const allProducts = await pool.query(query, params);
    res.json({
      success: true,
      products: allProducts.rows,
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    next(error);
  }
};

const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { empresa_id } = req.query;

    if (!empresa_id) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere empresa_id',
      });
    }

    const result = await pool.query(
      `
      SELECT 
        p.*,
        c.nombre_categoria,
        m.nombre as marca_nombre,
        ep.nombre as estado_nombre
      FROM producto p
      LEFT JOIN categorias c ON p.categoria_id = c.categoria_id
      LEFT JOIN marca m ON p.marca_id = m.marca_id
      LEFT JOIN estado_producto ep ON p.estado_id = ep.estado_id
      WHERE p.producto_id = $1
    `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
      });
    }

    res.json({
      success: true,
      product: result.rows[0],
    });
  } catch (error) {
    console.error('Error al obtener producto:', error);
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      codigo,
      nombre_producto,
      descripcion,
      imagen,
      precio_venta,
      precio_costo,
      stock,
      categoria_id,
      marca_id,
      estado_id,
    } = req.body;

    const result = await pool.query(
      `UPDATE producto 
       SET codigo = $1, nombre_producto = $2, descripcion = $3, imagen = $4, 
           precio_venta = $5, precio_costo = $6, stock = $7, categoria_id = $8, 
           marca_id = $9, estado_id = $10, fecha_modificacion = CURRENT_TIMESTAMP
       WHERE producto_id = $11 
       RETURNING *`,
      [
        codigo,
        nombre_producto,
        descripcion,
        imagen,
        precio_venta,
        precio_costo,
        stock,
        categoria_id,
        marca_id,
        estado_id,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
      });
    }

    res.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      product: result.rows[0],
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'UPDATE producto SET estado_id = $1, fecha_modificacion = CURRENT_TIMESTAMP WHERE producto_id = $2 RETURNING *',
      [2, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
      });
    }

    res.json({
      success: true,
      message: 'Producto desactivado exitosamente',
      product: result.rows[0],
    });
  } catch (error) {
    console.error('Error al desactivar producto:', error);
    next(error);
  }
};

// Buscar productos (por código, nombre, categoría)
const searchProducts = async (req, res, next) => {
  try {
    const { empresa_id, query, category } = req.query;

    if (!empresa_id) {
      return res.status(400).json({
        success: false,
        message: 'empresa_id es requerido',
      });
    }

    let sqlQuery = `
      SELECT 
        p.*,
        c.nombre_categoria,
        m.nombre as marca_nombre,
        ep.nombre as estado_nombre
      FROM producto p
      LEFT JOIN categorias c ON p.categoria_id = c.categoria_id
      LEFT JOIN marca m ON p.marca_id = m.marca_id
      LEFT JOIN estado_producto ep ON p.estado_id = ep.estado_id
      WHERE p.empresa_id = $1
    `;

    const params = [empresa_id];
    let paramCount = 1;

    if (query) {
      paramCount++;
      sqlQuery += ` AND (
        p.nombre_producto ILIKE $${paramCount} OR 
        p.codigo ILIKE $${paramCount} OR
        c.nombre_categoria ILIKE $${paramCount}
      )`;
      params.push(`%${query}%`);
    }

    if (category && category !== 'all') {
      paramCount++;
      sqlQuery += ` AND p.categoria_id = $${paramCount}`;
      params.push(category);
    }

    sqlQuery += ' ORDER BY p.nombre_producto';

    const result = await pool.query(sqlQuery, params);

    res.json({
      success: true,
      products: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Error al buscar productos:', error);
    next(error);
  }
};

// Buscar producto por código exacto
const getProductByCode = async (req, res, next) => {
  try {
    const { code } = req.params;
    const { empresa_id } = req.query;

    if (!empresa_id) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere empresa_id',
      });
    }

    const result = await pool.query(
      `SELECT 
        p.*,
        c.nombre_categoria,
        m.nombre as marca_nombre,
        ep.nombre as estado_nombre
      FROM producto p
      LEFT JOIN categorias c ON p.categoria_id = c.categoria_id
      LEFT JOIN marca m ON p.marca_id = m.marca_id
      LEFT JOIN estado_producto ep ON p.estado_id = ep.estado_id
      WHERE p.codigo = $1 AND p.empresa_id = $2`,
      [code, empresa_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
      });
    }

    res.json({
      success: true,
      product: result.rows[0],
    });
  } catch (error) {
    console.error('Error al buscar producto por código:', error);
    next(error);
  }
};

// ============================================
// FUNCIONES PARA EL DASHBOARD
// ============================================

// Obtener movimientos recientes de inventario
const getRecentMovements = async (req, res, next) => {
  try {
    const { empresaId } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    const result = await pool.query(
      `SELECT 
        mi.movimiento_id,
        mi.cantidad,
        mi.fecha_movimiento,
        mi.motivo,
        mi.tipo_movimiento,
        p.nombre_producto,
        CASE 
          WHEN mi.cliente_id IS NOT NULL THEN 'Cliente'
          WHEN mi.proveedor_id IS NOT NULL THEN 'Proveedor'
          ELSE 'Interno'
        END as entidad_tipo
      FROM movimientos_inventario mi
      INNER JOIN producto p ON mi.producto_id = p.producto_id
      WHERE p.empresa_id = $1
      ORDER BY mi.fecha_movimiento DESC
      LIMIT $2`,
      [empresaId, limit]
    );

    res.json({
      success: true,
      movimientos: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Error al obtener movimientos recientes:', error);
    next(error);
  }
};

// Obtener productos críticos (stock bajo)
const getCriticalProducts = async (req, res, next) => {
  try {
    const { empresaId } = req.params;

    const result = await pool.query(
      `SELECT DISTINCT
        p.producto_id,
        p.nombre_producto,
        p.stock,
        a.stock_minimo,
        c.nombre_categoria as categoria,
        p.imagen
      FROM producto p
      INNER JOIN aprovisionamiento a ON p.producto_id = a.producto_id
      LEFT JOIN categorias c ON p.categoria_id = c.categoria_id
      WHERE p.empresa_id = $1 
        AND p.stock <= a.stock_minimo
        AND p.estado_id = 1
      ORDER BY (p.stock::float / NULLIF(a.stock_minimo, 0)) ASC`,
      [empresaId]
    );

    res.json({
      success: true,
      productos_criticos: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Error al obtener productos críticos:', error);
    next(error);
  }
};

// Obtener métricas del dashboard
const getDashboardMetrics = async (req, res, next) => {
  try {
    const { empresaId } = req.params;

    // Obtener todas las métricas en paralelo
    const [
      totalProductos,
      productosCriticos,
      productosBajoStock,
      movimientosHoy,
      entradasSemana,
      salidasSemana,
      valorInventario,
    ] = await Promise.all([
      // Total de productos
      pool.query('SELECT COUNT(*) as total FROM producto WHERE empresa_id = $1 AND estado_id = 1', [
        empresaId,
      ]),

      // Productos críticos
      pool.query(
        `SELECT COUNT(DISTINCT p.producto_id) as total 
         FROM producto p 
         INNER JOIN aprovisionamiento a ON p.producto_id = a.producto_id 
         WHERE p.empresa_id = $1 AND p.stock <= a.stock_minimo AND p.estado_id = 1`,
        [empresaId]
      ),

      // Productos con stock bajo (entre mínimo y mínimo * 1.5)
      pool.query(
        `SELECT COUNT(DISTINCT p.producto_id) as total 
         FROM producto p 
         INNER JOIN aprovisionamiento a ON p.producto_id = a.producto_id 
         WHERE p.empresa_id = $1 
           AND p.stock > a.stock_minimo 
           AND p.stock <= (a.stock_minimo * 1.5) 
           AND p.estado_id = 1`,
        [empresaId]
      ),

      // Movimientos de hoy
      pool.query(
        `SELECT COUNT(*) as total 
         FROM movimientos_inventario mi 
         INNER JOIN producto p ON mi.producto_id = p.producto_id 
         WHERE p.empresa_id = $1 AND DATE(mi.fecha_movimiento) = CURRENT_DATE`,
        [empresaId]
      ),

      // Entradas de la semana
      pool.query(
        `SELECT COALESCE(SUM(mi.cantidad), 0) as total 
         FROM movimientos_inventario mi 
         INNER JOIN producto p ON mi.producto_id = p.producto_id 
         WHERE p.empresa_id = $1 
           AND mi.tipo_movimiento = 'entrada' 
           AND mi.fecha_movimiento >= CURRENT_DATE - INTERVAL '7 days'`,
        [empresaId]
      ),

      // Salidas de la semana
      pool.query(
        `SELECT COALESCE(SUM(mi.cantidad), 0) as total 
         FROM movimientos_inventario mi 
         INNER JOIN producto p ON mi.producto_id = p.producto_id 
         WHERE p.empresa_id = $1 
           AND mi.tipo_movimiento = 'salida' 
           AND mi.fecha_movimiento >= CURRENT_DATE - INTERVAL '7 days'`,
        [empresaId]
      ),

      // Valor total del inventario
      pool.query(
        `SELECT COALESCE(SUM(p.precio_costo::numeric * p.stock), 0) as total 
         FROM producto p 
         WHERE p.empresa_id = $1 AND p.estado_id = 1`,
        [empresaId]
      ),
    ]);

    const metricas = {
      total_productos: parseInt(totalProductos.rows[0].total),
      productos_criticos: parseInt(productosCriticos.rows[0].total),
      productos_bajo_stock: parseInt(productosBajoStock.rows[0].total),
      movimientos_hoy: parseInt(movimientosHoy.rows[0].total),
      entradas_semana: parseInt(entradasSemana.rows[0].total),
      salidas_semana: parseInt(salidasSemana.rows[0].total),
      valor_inventario_total: parseFloat(valorInventario.rows[0].total),
    };

    res.json({
      success: true,
      metricas,
    });
  } catch (error) {
    console.error('Error al obtener métricas del dashboard:', error);
    next(error);
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductByCode,
  // Dashboard functions
  getRecentMovements,
  getCriticalProducts,
  getDashboardMetrics,
};
