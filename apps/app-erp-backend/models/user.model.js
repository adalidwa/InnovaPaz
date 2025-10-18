const pool = require('../db');

class User {
  static async find(query = {}) {
    if (query.empresa_id) {
      const result = await pool.query('SELECT * FROM usuarios WHERE empresa_id = $1', [
        query.empresa_id,
      ]);
      return result.rows;
    }
    if (query.email) {
      const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [query.email]);
      return result.rows;
    }
    const result = await pool.query('SELECT * FROM usuarios');
    return result.rows;
  }

  /**
   * Buscar usuario por ID y obtener información completa del rol
   */
  static async findById(uid) {
    const result = await pool.query('SELECT * FROM usuarios WHERE uid = $1', [uid]);
    return result.rows[0];
  }

  /**
   * Buscar usuario con información completa de rol (plantilla o personalizado)
   */
  static async findByIdWithRole(uid) {
    const result = await pool.query('SELECT * FROM obtener_usuario_con_rol($1)', [uid]);
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
    const {
      uid,
      empresa_id,
      rol_id,
      plantilla_rol_id,
      nombre_completo,
      email,
      estado,
      preferencias,
    } = data;

    const result = await pool.query(
      'INSERT INTO usuarios (uid, empresa_id, rol_id, plantilla_rol_id, nombre_completo, email, estado, preferencias, fecha_creacion) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING *',
      [
        uid,
        empresa_id,
        rol_id,
        plantilla_rol_id,
        nombre_completo,
        email,
        estado,
        JSON.stringify(preferencias || {}),
      ]
    );
    return result.rows[0];
  }

  /**
   * Crear usuario con rol de plantilla directamente
   */
  static async createWithPlantillaRole(data) {
    const { uid, empresa_id, plantilla_rol_id, nombre_completo, email, estado, preferencias } =
      data;

    const result = await pool.query(
      'INSERT INTO usuarios (uid, empresa_id, plantilla_rol_id, nombre_completo, email, estado, preferencias, fecha_creacion) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *',
      [
        uid,
        empresa_id,
        plantilla_rol_id,
        nombre_completo,
        email,
        estado,
        JSON.stringify(preferencias || {}),
      ]
    );
    return result.rows[0];
  }

  /**
   * Asignar rol de plantilla a usuario existente
   */
  static async assignPlantillaRole(uid, plantilla_rol_id) {
    const result = await pool.query(
      'UPDATE usuarios SET rol_id = NULL, plantilla_rol_id = $2 WHERE uid = $1 RETURNING *',
      [uid, plantilla_rol_id]
    );
    return result.rows[0];
  }

  /**
   * Asignar rol personalizado a usuario existente
   */
  static async assignCustomRole(uid, rol_id) {
    const result = await pool.query(
      'UPDATE usuarios SET plantilla_rol_id = NULL, rol_id = $2 WHERE uid = $1 RETURNING *',
      [uid, rol_id]
    );
    return result.rows[0];
  }

  /**
   * Contar usuarios por filtro
   */
  static async count(filter = {}) {
    let query = 'SELECT COUNT(*) as count FROM usuarios';
    const params = [];
    const conditions = [];

    if (filter.empresa_id) {
      conditions.push('empresa_id = $' + (params.length + 1));
      params.push(filter.empresa_id);
    }

    if (filter.rol_id) {
      conditions.push('rol_id = $' + (params.length + 1));
      params.push(filter.rol_id);
    }

    if (filter.plantilla_rol_id) {
      conditions.push('plantilla_rol_id = $' + (params.length + 1));
      params.push(filter.plantilla_rol_id);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count);
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
