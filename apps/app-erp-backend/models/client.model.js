const pool = require('../db');

class ClientModel {
  // Obtener todos los clientes de una empresa
  static async findByEmpresa(empresaId) {
    const result = await pool.query(
      `SELECT c.*, cc.nombre as categoria_nombre
       FROM clientes c
       LEFT JOIN categorias_cliente cc ON c.categoria_cliente_id = cc.categoria_cliente_id
       WHERE c.empresa_id = $1 AND c.estado = 'activo'
       ORDER BY c.fecha_registro DESC`,
      [empresaId]
    );
    return result.rows;
  }

  // Obtener cliente por ID
  static async findById(clienteId, empresaId) {
    const result = await pool.query(
      `SELECT c.*, cc.nombre as categoria_nombre
       FROM clientes c
       LEFT JOIN categorias_cliente cc ON c.categoria_cliente_id = cc.categoria_cliente_id
       WHERE c.cliente_id = $1 AND c.empresa_id = $2`,
      [clienteId, empresaId]
    );
    return result.rows[0];
  }

  // Buscar clientes
  static async search(empresaId, searchTerm) {
    const result = await pool.query(
      `SELECT c.*, cc.nombre as categoria_nombre
       FROM clientes c
       LEFT JOIN categorias_cliente cc ON c.categoria_cliente_id = cc.categoria_cliente_id
       WHERE c.empresa_id = $1 
       AND c.estado = 'activo'
       AND (
         c.nombre ILIKE $2 OR 
         c.email ILIKE $2 OR 
         c.nit_ci ILIKE $2 OR 
         c.telefono ILIKE $2
       )
       ORDER BY c.nombre`,
      [empresaId, `%${searchTerm}%`]
    );
    return result.rows;
  }

  // Crear cliente
  static async create(clientData) {
    const {
      nombre,
      email,
      telefono,
      nit_ci,
      direccion,
      categoria_cliente_id,
      empresa_id,
      tipo_cliente,
      limite_credito,
      deuda_actual,
    } = clientData;

    const result = await pool.query(
      `INSERT INTO clientes (
        nombre, email, telefono, nit_ci, direccion, 
        categoria_cliente_id, empresa_id, tipo_cliente, 
        limite_credito, deuda_actual, fecha_registro, estado
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, 'activo')
      RETURNING *`,
      [
        nombre,
        email,
        telefono,
        nit_ci,
        direccion,
        categoria_cliente_id,
        empresa_id,
        tipo_cliente || 'regular',
        limite_credito || 0,
        deuda_actual || 0,
      ]
    );
    return result.rows[0];
  }

  // Actualizar cliente
  static async update(clienteId, empresaId, clientData) {
    const {
      nombre,
      email,
      telefono,
      nit_ci,
      direccion,
      categoria_cliente_id,
      tipo_cliente,
      limite_credito,
      deuda_actual,
    } = clientData;

    const result = await pool.query(
      `UPDATE clientes SET
        nombre = COALESCE($1, nombre),
        email = COALESCE($2, email),
        telefono = COALESCE($3, telefono),
        nit_ci = COALESCE($4, nit_ci),
        direccion = COALESCE($5, direccion),
        categoria_cliente_id = COALESCE($6, categoria_cliente_id),
        tipo_cliente = COALESCE($7, tipo_cliente),
        limite_credito = COALESCE($8, limite_credito),
        deuda_actual = COALESCE($9, deuda_actual)
      WHERE cliente_id = $10 AND empresa_id = $11
      RETURNING *`,
      [
        nombre,
        email,
        telefono,
        nit_ci,
        direccion,
        categoria_cliente_id,
        tipo_cliente,
        limite_credito,
        deuda_actual,
        clienteId,
        empresaId,
      ]
    );
    return result.rows[0];
  }

  // Eliminar cliente (soft delete)
  static async delete(clienteId, empresaId) {
    const result = await pool.query(
      `UPDATE clientes SET estado = 'inactivo'
       WHERE cliente_id = $1 AND empresa_id = $2
       RETURNING *`,
      [clienteId, empresaId]
    );
    return result.rows[0];
  }

  // Actualizar última compra
  static async updateLastPurchase(clienteId) {
    await pool.query(
      `UPDATE clientes SET ultima_compra = CURRENT_DATE
       WHERE cliente_id = $1`,
      [clienteId]
    );
  }

  // Actualizar deuda
  static async updateDebt(clienteId, amount) {
    await pool.query(
      `UPDATE clientes SET deuda_actual = deuda_actual + $1
       WHERE cliente_id = $2`,
      [amount, clienteId]
    );
  }

  // Obtener todos los clientes (incluye inactivos)
  static async findAllByEmpresa(empresaId, searchTerm = null) {
    let query = `
      SELECT c.*, cc.nombre as categoria_nombre
      FROM clientes c
      LEFT JOIN categorias_cliente cc ON c.categoria_cliente_id = cc.categoria_cliente_id
      WHERE c.empresa_id = $1
    `;

    const params = [empresaId];

    if (searchTerm) {
      query += ` AND (
        c.nombre ILIKE $2 OR 
        c.email ILIKE $2 OR 
        c.nit_ci ILIKE $2 OR 
        c.telefono ILIKE $2
      )`;
      params.push(`%${searchTerm}%`);
    }

    query += ` ORDER BY c.estado DESC, c.fecha_registro DESC`;

    const result = await pool.query(query, params);
    return result.rows;
  }

  // Activar cliente
  static async activate(clienteId, empresaId) {
    const result = await pool.query(
      `UPDATE clientes SET estado = 'activo'
       WHERE cliente_id = $1 AND empresa_id = $2
       RETURNING *`,
      [clienteId, empresaId]
    );
    return result.rows[0];
  }
}

module.exports = ClientModel;
