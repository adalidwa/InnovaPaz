const pool = require('../db');

class RolePlantilla {
  /**
   * Obtiene todas las plantillas de roles para un tipo de empresa específico
   */
  static async findByTipoEmpresa(tipo_empresa_id, limite_plan = null) {
    let query = `
      SELECT rp.*, te.tipo_empresa
      FROM roles_plantilla rp
      JOIN tipos_empresa te ON rp.tipo_empresa_id = te.tipo_id
      WHERE rp.tipo_empresa_id = $1
      ORDER BY rp.orden_visualizacion
    `;

    const params = [tipo_empresa_id];

    if (limite_plan && limite_plan > 0) {
      query += ` LIMIT $2`;
      params.push(limite_plan);
    }

    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Obtiene una plantilla específica por ID
   */
  static async findById(plantilla_id) {
    const result = await pool.query(
      `
      SELECT rp.*, te.tipo_empresa
      FROM roles_plantilla rp
      JOIN tipos_empresa te ON rp.tipo_empresa_id = te.tipo_id
      WHERE rp.plantilla_id = $1
    `,
      [plantilla_id]
    );
    return result.rows[0];
  }

  /**
   * Obtiene todas las plantillas de roles
   */
  static async findAll() {
    const result = await pool.query(`
      SELECT rp.*, te.tipo_empresa
      FROM roles_plantilla rp
      JOIN tipos_empresa te ON rp.tipo_empresa_id = te.tipo_id
      ORDER BY te.tipo_empresa, rp.orden_visualizacion
    `);
    return result.rows;
  }

  /**
   * Busca una plantilla por nombre y tipo de empresa
   */
  static async findByNombreYTipo(nombre_rol, tipo_empresa_id) {
    const result = await pool.query(
      `
      SELECT * FROM roles_plantilla 
      WHERE nombre_rol = $1 AND tipo_empresa_id = $2
    `,
      [nombre_rol, tipo_empresa_id]
    );
    return result.rows[0];
  }

  /**
   * Obtiene roles disponibles para una empresa (plantillas + personalizados)
   * usando la función de base de datos
   */
  static async getRolesDisponiblesEmpresa(empresa_id, limite_plan = null) {
    const result = await pool.query(
      `
      SELECT * FROM obtener_roles_disponibles_empresa($1, $2)
    `,
      [empresa_id, limite_plan]
    );
    return result.rows;
  }

  /**
   * Crea un rol personalizado basado en una plantilla
   */
  static async crearRolDesdePlantilla(empresa_id, plantilla_id, nombre_personalizado = null) {
    const plantilla = await this.findById(plantilla_id);
    if (!plantilla) {
      throw new Error('Plantilla de rol no encontrada');
    }

    const nombreRol = nombre_personalizado || plantilla.nombre_rol;

    const result = await pool.query(
      `
      INSERT INTO roles (empresa_id, nombre_rol, permisos, es_predeterminado, estado, plantilla_id_origen, fecha_creacion)
      VALUES ($1, $2, $3, false, 'activo', $4, NOW())
      RETURNING *
    `,
      [empresa_id, nombreRol, JSON.stringify(plantilla.permisos), plantilla_id]
    );

    return result.rows[0];
  }
}

module.exports = RolePlantilla;
