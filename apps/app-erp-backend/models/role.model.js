const pool = require('../db');

class Role {
  static async find(query = {}) {
    const filters = [];
    const values = [];
    if (query.empresa_id) {
      values.push(query.empresa_id);
      filters.push(`empresa_id = $${values.length}`);
    }
    if (typeof query.es_predeterminado === 'boolean') {
      values.push(query.es_predeterminado);
      filters.push(`es_predeterminado = $${values.length}`);
    }
    let sql = 'SELECT * FROM roles';
    if (filters.length) {
      sql += ' WHERE ' + filters.join(' AND ');
    }
    // Mostrar primero los roles más recientes
    sql += ' ORDER BY fecha_creacion DESC';
    const result = await pool.query(sql, values);
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM roles WHERE rol_id = $1', [id]);
    return result.rows[0];
  }

  static async findByIdAndCompany(rol_id, empresa_id) {
    const result = await pool.query('SELECT * FROM roles WHERE rol_id = $1 AND empresa_id = $2', [
      rol_id,
      empresa_id,
    ]);
    return result.rows[0];
  }

  static async count(query = {}) {
    const filters = [];
    const values = [];
    if (query.empresa_id) {
      values.push(query.empresa_id);
      filters.push(`empresa_id = $${values.length}`);
    }
    if (typeof query.es_predeterminado === 'boolean') {
      values.push(query.es_predeterminado);
      filters.push(`es_predeterminado = $${values.length}`);
    }
    let sql = 'SELECT COUNT(*)::int AS count FROM roles';
    if (filters.length) {
      sql += ' WHERE ' + filters.join(' AND ');
    }
    const result = await pool.query(sql, values);
    return result.rows[0]?.count || 0;
  }

  static async create(data) {
    const { empresa_id, nombre_rol, permisos, es_predeterminado, estado, plantilla_id_origen } =
      data;
    const result = await pool.query(
      'INSERT INTO roles (empresa_id, nombre_rol, permisos, es_predeterminado, estado, plantilla_id_origen, fecha_creacion) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *',
      [
        empresa_id,
        nombre_rol,
        JSON.stringify(permisos || {}),
        es_predeterminado,
        estado,
        plantilla_id_origen || null,
      ]
    );
    return result.rows[0];
  }

  static async findByIdAndUpdate(id, data) {
    const fields = Object.keys(data);
    const values = Object.values(data);
    if (data.permisos) {
      const index = fields.indexOf('permisos');
      values[index] = JSON.stringify(values[index]);
    }
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');

    const query = `UPDATE roles SET ${setClause} WHERE rol_id = $${fields.length + 1} RETURNING *`;
    const queryValues = [...values, id];

    const result = await pool.query(query, queryValues);
    return result.rows[0];
  }

  static async findByIdAndDelete(id) {
    const result = await pool.query('DELETE FROM roles WHERE rol_id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  static async updateMany(filter, update) {
    if (filter.empresa_id && 'es_predeterminado' in update) {
      await pool.query('UPDATE roles SET es_predeterminado = $1 WHERE empresa_id = $2', [
        update.es_predeterminado,
        filter.empresa_id,
      ]);
    }
  }
}

module.exports = Role;
