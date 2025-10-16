const pool = require('../db');

class Plan {
  static async find() {
    const result = await pool.query('SELECT * FROM planes');
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM planes WHERE plan_id = $1', [id]);
    return result.rows[0];
  }

  static async create(data) {
    const { nombre_plan, precio_mensual, limites } = data;
    const result = await pool.query(
      'INSERT INTO planes (nombre_plan, precio_mensual, limites, fecha_creacion) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [nombre_plan, precio_mensual, JSON.stringify(limites || {})]
    );
    return result.rows[0];
  }

  static async findByIdAndUpdate(id, data) {
    const { nombre_plan, precio_mensual, limites } = data;
    const result = await pool.query(
      'UPDATE planes SET nombre_plan = $1, precio_mensual = $2, limites = $3 WHERE plan_id = $4 RETURNING *',
      [nombre_plan, precio_mensual, JSON.stringify(limites || {}), id]
    );
    return result.rows[0];
  }

  static async findByIdAndDelete(id) {
    const result = await pool.query('DELETE FROM planes WHERE plan_id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
}

module.exports = Plan;
