const pool = require('../db');

class Company {
  static async find(query = {}) {
    if (query.plan_id) {
      const result = await pool.query('SELECT * FROM empresas WHERE plan_id = $1', [query.plan_id]);
      return result.rows;
    }
    const result = await pool.query('SELECT * FROM empresas');
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM empresas WHERE empresa_id = $1', [id]);
    return result.rows[0];
  }

  static async create(data) {
    const { nombre, tipo_empresa_id, plan_id, estado_suscripcion } = data;
    const result = await pool.query(
      'INSERT INTO empresas (nombre, tipo_empresa_id, plan_id, estado_suscripcion, fecha_creacion) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [nombre, tipo_empresa_id, plan_id, estado_suscripcion]
    );
    return result.rows[0];
  }

  static async findByIdAndUpdate(id, data) {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');

    const query = `UPDATE empresas SET ${setClause} WHERE empresa_id = $${fields.length + 1} RETURNING *`;
    const queryValues = [...values, id];

    const result = await pool.query(query, queryValues);
    return result.rows[0];
  }

  static async findByIdAndDelete(id) {
    const result = await pool.query('DELETE FROM empresas WHERE empresa_id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
}

module.exports = Company;
