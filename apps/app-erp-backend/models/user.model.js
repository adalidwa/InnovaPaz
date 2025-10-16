const pool = require('../db');

class User {
  static async find(query = {}) {
    if (query.empresa_id) {
      const result = await pool.query('SELECT * FROM usuarios WHERE empresa_id = $1', [
        query.empresa_id,
      ]);
      return result.rows;
    }
    const result = await pool.query('SELECT * FROM usuarios');
    return result.rows;
  }

  static async findById(uid) {
    const result = await pool.query('SELECT * FROM usuarios WHERE uid = $1', [uid]);
    return result.rows[0];
  }

  static async findOne(query) {
    if (query.email) {
      const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [query.email]);
      return result.rows[0];
    }
    if (query.uid) {
      const result = await pool.query('SELECT * FROM usuarios WHERE uid = $1', [query.uid]);
      return result.rows[0];
    }
    return null;
  }

  static async create(data) {
    const { uid, empresa_id, rol_id, nombre_completo, email, estado, preferencias } = data;
    const result = await pool.query(
      'INSERT INTO usuarios (uid, empresa_id, rol_id, nombre_completo, email, estado, preferencias, fecha_creacion) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *',
      [uid, empresa_id, rol_id, nombre_completo, email, estado, JSON.stringify(preferencias || {})]
    );
    return result.rows[0];
  }

  static async findByIdAndUpdate(uid, data) {
    if (data.preferencias) {
      data.preferencias = JSON.stringify(data.preferencias);
    }
    const fields = Object.keys(data);
    const values = Object.values(data);
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');

    const query = `UPDATE usuarios SET ${setClause} WHERE uid = $${fields.length + 1} RETURNING *`;
    const queryValues = [...values, uid];

    const result = await pool.query(query, queryValues);
    return result.rows[0];
  }

  static async findOneAndDelete(query) {
    if (query.uid) {
      const result = await pool.query('DELETE FROM usuarios WHERE uid = $1 RETURNING *', [
        query.uid,
      ]);
      return result.rows[0];
    }
    return null;
  }
}

module.exports = User;
