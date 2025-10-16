const pool = require('../db');

class TypeCompany {
  static normalizeTypeValue(tipoEmpresa) {
    const value = tipoEmpresa.toLowerCase();
    if (['ferreteria', 'licoreria', 'minimarket'].includes(value)) {
      return value;
    }
    return value;
  }
  static async find() {
    const result = await pool.query('SELECT * FROM tipos_empresa');
    return result.rows;
  }

  static async create(data) {
    const { tipo_empresa } = data;
    const result = await pool.query(
      'INSERT INTO tipos_empresa (tipo_empresa, fecha_creacion) VALUES ($1, NOW()) RETURNING *',
      [tipo_empresa]
    );
    return result.rows[0];
  }
}

module.exports = TypeCompany;
