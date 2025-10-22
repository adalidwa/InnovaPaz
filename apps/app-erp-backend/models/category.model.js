const pool = require('../db');

class CategoryModel {
  // Obtener todas las categorías (son globales, no por empresa)
  static async findAll() {
    const result = await pool.query(
      `SELECT * FROM categorias_cliente 
       ORDER BY estado DESC, nombre ASC`
    );
    return result.rows;
  }

  // Crear categoría
  static async create(categoryData) {
    const { nombre, descuento_porcentaje, descripcion } = categoryData;

    const result = await pool.query(
      `INSERT INTO categorias_cliente (nombre, descuento_porcentaje, descripcion, estado)
       VALUES ($1, $2, $3, 'activo')
       RETURNING *`,
      [nombre, descuento_porcentaje || 0, descripcion]
    );
    return result.rows[0];
  }

  // Actualizar categoría
  static async update(categoryId, categoryData) {
    const { nombre, descuento_porcentaje, descripcion } = categoryData;

    const result = await pool.query(
      `UPDATE categorias_cliente SET
        nombre = COALESCE($1, nombre),
        descuento_porcentaje = COALESCE($2, descuento_porcentaje),
        descripcion = COALESCE($3, descripcion)
       WHERE categoria_cliente_id = $4
       RETURNING *`,
      [nombre, descuento_porcentaje, descripcion, categoryId]
    );
    return result.rows[0];
  }

  // Desactivar categoría
  static async deactivate(categoryId) {
    const result = await pool.query(
      `UPDATE categorias_cliente SET estado = 'inactivo'
       WHERE categoria_cliente_id = $1
       RETURNING *`,
      [categoryId]
    );
    return result.rows[0];
  }

  // Activar categoría
  static async activate(categoryId) {
    const result = await pool.query(
      `UPDATE categorias_cliente SET estado = 'activo'
       WHERE categoria_cliente_id = $1
       RETURNING *`,
      [categoryId]
    );
    return result.rows[0];
  }
}

module.exports = CategoryModel;
