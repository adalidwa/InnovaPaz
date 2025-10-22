const pool = require('../db');

class TypeCompany {
  static normalizeTypeValue(tipoEmpresa) {
    const value = tipoEmpresa.trim();
    if (['Ferreteria', 'Licoreria', 'Minimarket'].includes(value)) {
      return value;
    }
    return value;
  }

  static async find() {
    const result = await pool.query('SELECT * FROM tipos_empresa');
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM tipos_empresa WHERE tipo_id = $1', [id]);
    return result.rows[0];
  }

  static async create(data) {
    const { tipo_empresa } = data;
    const result = await pool.query(
      'INSERT INTO tipos_empresa (tipo_empresa, fecha_creacion) VALUES ($1, NOW()) RETURNING *',
      [tipo_empresa]
    );
    return result.rows[0];
  }

  static async findByIdAndUpdate(id, data) {
    const { tipo_empresa } = data;
    const result = await pool.query(
      'UPDATE tipos_empresa SET tipo_empresa = $1 WHERE tipo_id = $2 RETURNING *',
      [tipo_empresa, id]
    );
    return result.rows[0];
  }

  static async findByIdAndDelete(id) {
    const result = await pool.query('DELETE FROM tipos_empresa WHERE tipo_id = $1 RETURNING *', [
      id,
    ]);
    return result.rows[0];
  }
}

module.exports = TypeCompany;
