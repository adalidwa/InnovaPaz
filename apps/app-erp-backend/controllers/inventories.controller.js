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
  } = req.body;

  try {
    // Validar campos requeridos
    if (!nombre_producto || !precio_venta || !precio_costo || !empresa_id) {
      return res.status(400).json({
        success: false,
        message:
          'Los campos nombre_producto, precio_venta, precio_costo y empresa_id son requeridos',
      });
    }

    const result = await pool.query(
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

    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      product: result.rows[0],
    });
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
    // En lugar de eliminar, cambiar el estado a inactivo
    const result = await pool.query(
      'UPDATE producto SET estado_id = $1, fecha_modificacion = CURRENT_TIMESTAMP WHERE producto_id = $2 RETURNING *',
      [2, id] // Asumiendo que estado_id = 2 es "inactivo"
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

module.exports = {
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
};
