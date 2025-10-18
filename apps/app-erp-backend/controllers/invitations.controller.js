const Invitation = require('../models/invitation.model');
const User = require('../models/user.model');
const Company = require('../models/company.model');
const Role = require('../models/role.model');
const { sendInvitationEmail, sendWelcomeEmail } = require('../utils/emailService');

/**
 * Crear y enviar una invitación
 */
async function createInvitation(req, res) {
  try {
    const { email, rol_id } = req.body;
    const empresaId = req.user?.empresa_id;
    const invitadoPorUid = req.user?.uid; // Usar uid en lugar de usuario_id

    // Validaciones
    if (!email || !rol_id) {
      return res.status(400).json({
        error: 'Email y rol_id son requeridos',
      });
    }

    if (!empresaId || !invitadoPorUid) {
      return res.status(401).json({
        error: 'Usuario no autenticado correctamente',
      });
    }

    // Verificar que el email no esté registrado
    const existingUsers = await User.find({ email: email.toLowerCase() });
    if (existingUsers.length > 0) {
      return res.status(400).json({
        error: 'Este email ya está registrado en el sistema',
      });
    }

    // Verificar que no haya una invitación pendiente
    const existingInvitations = await Invitation.findByEmail(email);
    const pendingInvitation = existingInvitations.find(
      (inv) => inv.estado === 'pendiente' && inv.empresa_id === empresaId
    );

    if (pendingInvitation) {
      return res.status(400).json({
        error: 'Ya existe una invitación pendiente para este email',
        invitacion_id: pendingInvitation.invitacion_id,
      });
    }

    // Obtener información de la empresa y rol
    const [empresa, rol, invitadoPor] = await Promise.all([
      Company.findById(empresaId),
      Role.findById(rol_id),
      User.findById(invitadoPorUid), // Usar uid
    ]);

    if (!empresa) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }

    if (!rol) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }

    // Crear invitación
    const invitation = await Invitation.create({
      empresa_id: empresaId,
      email: email.toLowerCase(),
      rol_id,
      invitado_por: invitadoPorUid, // Usar uid
      expira_en: 7, // 7 días
    });

    console.log('✅ Invitación creada:', invitation.invitacion_id);

    // Enviar correo de invitación
    try {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5175';

      const emailResult = await sendInvitationEmail(email, {
        token: invitation.token,
        empresaNombre: empresa.nombre,
        rolNombre: rol.nombre_rol,
        invitadoPor: invitadoPor?.nombre_completo || 'Administrador', // Usar nombre_completo
        frontendUrl,
      });

      console.log('📧 Correo enviado:', emailResult);

      res.status(201).json({
        mensaje: 'Invitación creada y enviada exitosamente',
        invitacion: {
          invitacion_id: invitation.invitacion_id,
          email: invitation.email,
          rol: rol.nombre_rol,
          fecha_expiracion: invitation.fecha_expiracion,
          estado: invitation.estado,
        },
        email_preview: emailResult.preview, // Solo para desarrollo con MailDev
      });
    } catch (emailError) {
      console.error('❌ Error al enviar correo:', emailError);

      // La invitación se creó pero el correo falló
      res.status(201).json({
        mensaje: 'Invitación creada pero no se pudo enviar el correo',
        invitacion: {
          invitacion_id: invitation.invitacion_id,
          email: invitation.email,
          rol: rol.nombre_rol,
          fecha_expiracion: invitation.fecha_expiracion,
          estado: invitation.estado,
        },
        advertencia: 'El correo no se pudo enviar. Verifica la configuración SMTP.',
        error_email: emailError.message,
      });
    }
  } catch (error) {
    console.error('Error en createInvitation:', error);
    res.status(500).json({
      error: 'Error al crear la invitación',
      details: error.message,
    });
  }
}

/**
 * Verificar token de invitación
 */
async function verifyInvitation(req, res) {
  try {
    const { token } = req.params;

    const validation = await Invitation.isTokenValid(token);

    if (!validation.valid) {
      return res.status(400).json({
        valid: false,
        error: validation.reason,
      });
    }

    const invitation = validation.invitation;

    // Obtener información adicional
    const [empresa, rol] = await Promise.all([
      Company.findById(invitation.empresa_id),
      Role.findById(invitation.rol_id),
    ]);

    res.json({
      valid: true,
      invitacion: {
        invitacion_id: invitation.invitacion_id,
        email: invitation.email,
        empresa: {
          empresa_id: empresa.empresa_id,
          nombre: empresa.nombre,
        },
        rol: {
          rol_id: rol.rol_id,
          nombre_rol: rol.nombre_rol,
        },
        fecha_expiracion: invitation.fecha_expiracion,
      },
    });
  } catch (error) {
    console.error('Error en verifyInvitation:', error);
    res.status(500).json({
      error: 'Error al verificar la invitación',
      details: error.message,
    });
  }
}

/**
 * Aceptar invitación y crear usuario
 */
async function acceptInvitation(req, res) {
  try {
    const { token, nombre, password } = req.body;

    // Validaciones
    if (!token || !nombre || !password) {
      return res.status(400).json({
        error: 'Token, nombre y password son requeridos',
      });
    }

    // Verificar token
    const validation = await Invitation.isTokenValid(token);

    if (!validation.valid) {
      return res.status(400).json({
        error: validation.reason,
      });
    }

    const invitation = validation.invitation;

    // Verificar que el usuario no exista
    const existingUsers = await User.find({ email: invitation.email });
    if (existingUsers.length > 0) {
      return res.status(400).json({
        error: 'Este email ya está registrado',
      });
    }

    // Primero crear usuario en Firebase
    const { firebaseAuth } = require('../utils/firebaseAdmin');
    const firebaseUser = await firebaseAuth.createUser(invitation.email, password, nombre);

    if (!firebaseUser.success) {
      return res.status(400).json({
        error: 'Error al crear usuario en Firebase',
        details: firebaseUser.error,
      });
    }

    console.log('✅ Usuario creado en Firebase:', firebaseUser.uid);

    // Crear registro en base de datos con el uid de Firebase
    const newUser = await User.create({
      uid: firebaseUser.uid,
      nombre_completo: nombre,
      email: invitation.email,
      empresa_id: invitation.empresa_id,
      rol_id: invitation.rol_id,
      estado: 'activo',
    });

    console.log('✅ Usuario creado en base de datos desde invitación:', newUser.uid);

    // Actualizar estado de invitación
    await Invitation.updateStatus(token, 'aceptada');

    // Obtener información completa para el correo
    const [empresa, rol] = await Promise.all([
      Company.findById(invitation.empresa_id),
      Role.findById(invitation.rol_id),
    ]);

    // Enviar correo de bienvenida
    try {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5175';

      await sendWelcomeEmail(invitation.email, {
        nombre,
        empresaNombre: empresa.nombre,
        rolNombre: rol.nombre_rol,
        frontendUrl,
      });
    } catch (emailError) {
      console.warn('⚠️ No se pudo enviar correo de bienvenida:', emailError.message);
    }

    res.status(201).json({
      mensaje: 'Invitación aceptada y usuario creado exitosamente',
      usuario: {
        uid: newUser.uid,
        nombre_completo: newUser.nombre_completo,
        email: newUser.email,
        empresa_id: newUser.empresa_id,
        rol_id: newUser.rol_id,
      },
    });
  } catch (error) {
    console.error('Error en acceptInvitation:', error);
    res.status(500).json({
      error: 'Error al aceptar la invitación',
      details: error.message,
    });
  }
}

/**
 * Listar invitaciones de la empresa
 */
async function getInvitationsByCompany(req, res) {
  try {
    const empresaId = req.user?.empresa_id;

    if (!empresaId) {
      return res.status(401).json({
        error: 'Usuario no autenticado',
      });
    }

    const invitations = await Invitation.findByEmpresa(empresaId);

    res.json({
      total: invitations.length,
      invitaciones: invitations.map((inv) => ({
        invitacion_id: inv.invitacion_id,
        email: inv.email,
        rol: inv.nombre_rol,
        invitado_por: inv.invitado_por_nombre,
        estado: inv.estado,
        fecha_creacion: inv.fecha_creacion,
        fecha_expiracion: inv.fecha_expiracion,
        fecha_aceptacion: inv.fecha_aceptacion,
      })),
    });
  } catch (error) {
    console.error('Error en getInvitationsByCompany:', error);
    res.status(500).json({
      error: 'Error al obtener invitaciones',
      details: error.message,
    });
  }
}

/**
 * Reenviar invitación
 */
async function resendInvitation(req, res) {
  try {
    const { invitacion_id } = req.params;
    const empresaId = req.user?.empresa_id;

    const pool = require('../db');

    // Buscar invitación
    const invitation = await Invitation.findByToken(
      (await pool.query('SELECT token FROM invitaciones WHERE invitacion_id = $1', [invitacion_id]))
        .rows[0]?.token
    );

    if (!invitation) {
      return res.status(404).json({ error: 'Invitación no encontrada' });
    }

    if (invitation.empresa_id !== empresaId) {
      return res.status(403).json({ error: 'No tienes permiso para esta acción' });
    }

    // Reenviar
    const updatedInvitation = await Invitation.resend(invitacion_id);

    // Obtener información para el correo
    const [empresa, rol, invitadoPor] = await Promise.all([
      Company.findById(invitation.empresa_id),
      Role.findById(invitation.rol_id),
      User.findById(invitation.invitado_por),
    ]);

    // Enviar correo nuevamente
    try {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5175';

      await sendInvitationEmail(invitation.email, {
        token: updatedInvitation.token,
        empresaNombre: empresa.nombre,
        rolNombre: rol.nombre_rol,
        invitadoPor: invitadoPor?.nombre_completo || 'Administrador',
        frontendUrl,
      });

      res.json({
        mensaje: 'Invitación reenviada exitosamente',
        invitacion: {
          invitacion_id: updatedInvitation.invitacion_id,
          fecha_expiracion: updatedInvitation.fecha_expiracion,
        },
      });
    } catch (emailError) {
      res.status(500).json({
        error: 'Error al reenviar el correo',
        details: emailError.message,
      });
    }
  } catch (error) {
    console.error('Error en resendInvitation:', error);
    res.status(500).json({
      error: 'Error al reenviar invitación',
      details: error.message,
    });
  }
}

/**
 * Cancelar invitación
 */
async function cancelInvitation(req, res) {
  try {
    const { invitacion_id } = req.params;
    const empresaId = req.user?.empresa_id;

    const pool = require('../db');
    const result = await pool.query('SELECT * FROM invitaciones WHERE invitacion_id = $1', [
      invitacion_id,
    ]);

    const invitation = result.rows[0];

    if (!invitation) {
      return res.status(404).json({ error: 'Invitación no encontrada' });
    }

    if (invitation.empresa_id !== empresaId) {
      return res.status(403).json({ error: 'No tienes permiso para esta acción' });
    }

    await Invitation.delete(invitacion_id);

    res.json({
      mensaje: 'Invitación cancelada exitosamente',
    });
  } catch (error) {
    console.error('Error en cancelInvitation:', error);
    res.status(500).json({
      error: 'Error al cancelar invitación',
      details: error.message,
    });
  }
}

module.exports = {
  createInvitation,
  verifyInvitation,
  acceptInvitation,
  getInvitationsByCompany,
  resendInvitation,
  cancelInvitation,
};
