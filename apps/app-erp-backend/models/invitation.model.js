const pool = require('../db');
const crypto = require('crypto');

class Invitation {
  /**
   * Crear una nueva invitación
   */
  static async create(data) {
    const {
      empresa_id,
      email,
      rol_id,
      invitado_por,
      token,
      expira_en = 7, // días
    } = data;

    // Generar token si no se proporciona
    const invitationToken = token || crypto.randomBytes(32).toString('hex');

    // Calcular fecha de expiración
    const fechaExpiracion = new Date();
    fechaExpiracion.setDate(fechaExpiracion.getDate() + expira_en);

    const result = await pool.query(
      `INSERT INTO invitaciones 
       (empresa_id, email, rol_id, invitado_por, token, fecha_expiracion, estado, fecha_creacion) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) 
       RETURNING *`,
      [
        empresa_id,
        email.toLowerCase(),
        rol_id,
        invitado_por,
        invitationToken,
        fechaExpiracion,
        'pendiente',
      ]
    );

    return result.rows[0];
  }

  /**
   * Buscar invitación por token
   */
  static async findByToken(token) {
    const result = await pool.query('SELECT * FROM invitaciones WHERE token = $1', [token]);
    return result.rows[0];
  }

  /**
   * Buscar invitaciones por email
   */
  static async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM invitaciones WHERE email = $1 ORDER BY fecha_creacion DESC',
      [email.toLowerCase()]
    );
    return result.rows;
  }

  /**
   * Buscar invitaciones por empresa
   */
  static async findByEmpresa(empresaId) {
    const result = await pool.query(
      `SELECT i.*, 
              r.nombre_rol,
              u.nombre_completo as invitado_por_nombre,
              u.email as invitado_por_email
       FROM invitaciones i
       LEFT JOIN roles r ON i.rol_id = r.rol_id
       LEFT JOIN usuarios u ON i.invitado_por = u.uid
       WHERE i.empresa_id = $1
       ORDER BY i.fecha_creacion DESC`,
      [empresaId]
    );
    return result.rows;
  }

  /**
   * Actualizar estado de invitación
   */
  static async updateStatus(token, estado) {
    const result = await pool.query(
      'UPDATE invitaciones SET estado = $1, fecha_aceptacion = NOW() WHERE token = $2 RETURNING *',
      [estado, token]
    );
    return result.rows[0];
  }

  /**
   * Verificar si el token es válido
   */
  static async isTokenValid(token) {
    const invitation = await this.findByToken(token);

    if (!invitation) {
      return { valid: false, reason: 'Token no encontrado' };
    }

    if (invitation.estado !== 'pendiente') {
      return { valid: false, reason: 'Invitación ya utilizada', invitation };
    }

    const now = new Date();
    const expirationDate = new Date(invitation.fecha_expiracion);

    if (now > expirationDate) {
      return { valid: false, reason: 'Invitación expirada', invitation };
    }

    return { valid: true, invitation };
  }

  /**
   * Eliminar invitación
   */
  static async delete(invitacionId) {
    const result = await pool.query(
      'DELETE FROM invitaciones WHERE invitacion_id = $1 RETURNING *',
      [invitacionId]
    );
    return result.rows[0];
  }

  /**
   * Reenviar invitación (actualizar token y fecha de expiración)
   */
  static async resend(invitacionId) {
    const newToken = crypto.randomBytes(32).toString('hex');
    const fechaExpiracion = new Date();
    fechaExpiracion.setDate(fechaExpiracion.getDate() + 7);

    const result = await pool.query(
      `UPDATE invitaciones 
       SET token = $1, fecha_expiracion = $2, estado = 'pendiente' 
       WHERE invitacion_id = $3 
       RETURNING *`,
      [newToken, fechaExpiracion, invitacionId]
    );
    return result.rows[0];
  }
}

module.exports = Invitation;
