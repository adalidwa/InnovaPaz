const Role = require('../models/role.model');

async function getRolesByCompany(req, res) {
  try {
    const roles = await Role.find({ empresa_id: req.params.empresa_id });
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los roles de la empresa.' });
  }
}

async function getRoleById(req, res) {
  try {
    const rol = await Role.findById(req.params.rol_id);
    if (!rol) return res.status(404).json({ error: 'Rol no encontrado.' });
    res.json(rol);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el rol.' });
  }
}

async function createRole(req, res) {
  try {
    const { empresa_id, nombre_rol, permisos, es_predeterminado, estado } = req.body;

    // ===== VALIDACIONES =====
    // Validar campos requeridos
    if (!empresa_id || !nombre_rol) {
      return res.status(400).json({ error: 'Los campos empresa_id y nombre_rol son requeridos.' });
    }

    // Validar longitud de nombre_rol
    if (nombre_rol.trim().length === 0) {
      return res.status(400).json({ error: 'El nombre del rol no puede estar vacío.' });
    }
    if (nombre_rol.length > 100) {
      return res.status(400).json({ error: 'El nombre del rol no puede exceder 100 caracteres.' });
    }

    // Validar que la empresa exista
    const Company = require('../models/company.model');
    const empresa = await Company.findById(empresa_id);
    if (!empresa) {
      return res.status(404).json({ error: `Empresa con ID ${empresa_id} no encontrada.` });
    }

    // Validar valores de estado
    const estadosValidos = ['activo', 'inactivo'];
    if (estado && !estadosValidos.includes(estado)) {
      return res.status(400).json({
        error: `Estado no válido. Valores permitidos: ${estadosValidos.join(', ')}`,
      });
    }

    // Validar permisos (debe ser objeto)
    if (permisos && typeof permisos !== 'object') {
      return res.status(400).json({ error: 'Los permisos deben ser un objeto JSON.' });
    }

    // ⚠️ VALIDACIÓN IMPORTANTE: Los roles personalizados (no predeterminados)
    // deben verificar el límite del plan a través del middleware
    // Los roles predeterminados solo se crean al registrar la empresa
    if (!es_predeterminado) {
      // Este endpoint solo debe usarse para roles personalizados
      // Los predeterminados se crean automáticamente en el registro
      const rolesPersonalizados = await Role.count({
        empresa_id,
        es_predeterminado: false,
      });

      // Obtener límite del plan
      const Plan = require('../models/plan.model');
      const plan = await Plan.findById(empresa.plan_id);
      const limiteRoles = plan?.limites?.roles || 2;

      // Si no es ilimitado, validar
      if (limiteRoles !== null && limiteRoles !== -1) {
        if (rolesPersonalizados >= limiteRoles) {
          return res.status(403).json({
            error: `Has alcanzado el límite de roles personalizados (${limiteRoles}) para tu plan.`,
            current: rolesPersonalizados,
            limit: limiteRoles,
            suggestion: 'Considera actualizar tu plan para crear más roles personalizados.',
          });
        }
      }
    }

    const nuevoRol = await Role.create({
      empresa_id,
      nombre_rol,
      permisos: permisos || {},
      es_predeterminado: es_predeterminado || false,
      estado: estado || 'activo',
    });

    res.status(201).json({
      rol: nuevoRol,
      mensaje: es_predeterminado
        ? 'Rol predeterminado creado exitosamente'
        : 'Rol personalizado creado exitosamente',
    });
  } catch (err) {
    console.error('Error al crear rol:', err);
    res.status(400).json({ error: 'Error al crear el rol.', details: err.message });
  }
}

async function updateRole(req, res) {
  try {
    const { nombre_rol, permisos, es_predeterminado, estado } = req.body;

    // ===== VALIDACIONES =====
    // Validar longitud de nombre_rol si se proporciona
    if (nombre_rol !== undefined) {
      if (nombre_rol.trim().length === 0) {
        return res.status(400).json({ error: 'El nombre del rol no puede estar vacío.' });
      }
      if (nombre_rol.length > 100) {
        return res
          .status(400)
          .json({ error: 'El nombre del rol no puede exceder 100 caracteres.' });
      }
    }

    // Validar valores de estado si se proporciona
    if (estado !== undefined) {
      const estadosValidos = ['activo', 'inactivo'];
      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({
          error: `Estado no válido. Valores permitidos: ${estadosValidos.join(', ')}`,
        });
      }
    }

    // Validar permisos (debe ser objeto)
    if (permisos !== undefined && typeof permisos !== 'object') {
      return res.status(400).json({ error: 'Los permisos deben ser un objeto JSON.' });
    }

    const updateData = {};
    if (nombre_rol !== undefined) updateData.nombre_rol = nombre_rol;
    if (permisos !== undefined) updateData.permisos = permisos;
    if (es_predeterminado !== undefined) updateData.es_predeterminado = es_predeterminado;
    if (estado !== undefined) updateData.estado = estado;

    const rolActualizado = await Role.findByIdAndUpdate(req.params.rol_id, updateData);
    if (!rolActualizado) return res.status(404).json({ error: 'Rol no encontrado.' });
    res.json(rolActualizado);
  } catch (err) {
    console.error('Error al actualizar rol:', err);
    res.status(400).json({ error: 'Error al actualizar el rol.', details: err.message });
  }
}

async function deleteRole(req, res) {
  try {
    // Buscar el rol primero para validar
    const rol = await Role.findById(req.params.rol_id);

    if (!rol) {
      return res.status(404).json({ error: 'Rol no encontrado.' });
    }

    // ⚠️ VALIDACIÓN CRÍTICA: No se pueden eliminar roles predeterminados
    if (rol.es_predeterminado) {
      return res.status(403).json({
        error: 'No se pueden eliminar roles predeterminados.',
        mensaje:
          'Los roles predeterminados son esenciales para el funcionamiento del sistema y solo pueden editarse.',
        rol_afectado: rol.nombre_rol,
        sugerencia: 'Puedes editar los permisos de este rol, pero no eliminarlo.',
      });
    }

    // Verificar si hay usuarios asignados a este rol
    const User = require('../models/user.model');
    const usuariosConRol = await User.count({ rol_id: req.params.rol_id });

    if (usuariosConRol > 0) {
      return res.status(400).json({
        error: 'No se puede eliminar el rol porque tiene usuarios asignados.',
        usuarios_afectados: usuariosConRol,
        sugerencia: 'Reasigna los usuarios a otro rol antes de eliminar este.',
      });
    }

    // Si pasa todas las validaciones, eliminar el rol
    await Role.findByIdAndDelete(req.params.rol_id);

    res.json({
      mensaje: 'Rol personalizado eliminado correctamente.',
      rol_eliminado: rol.nombre_rol,
    });
  } catch (err) {
    console.error('Error al eliminar rol:', err);
    res.status(400).json({ error: 'Error al eliminar el rol.', details: err.message });
  }
}

async function setDefaultRole(req, res) {
  try {
    const { companyId, rol_id } = req.body;
    await Role.updateMany({ empresa_id: companyId }, { es_predeterminado: false });
    const rol = await Role.findByIdAndUpdate(rol_id, { es_predeterminado: true });
    if (!rol) return res.status(404).json({ error: 'Rol no encontrado.' });
    res.json({ mensaje: 'Rol predeterminado actualizado.', rol });
  } catch (err) {
    res.status(400).json({ error: 'Error al establecer el rol predeterminado.' });
  }
}

/**
 * Buscar rol de Administrador por nombre (no por ID)
 * Útil para verificar permisos de administrador en cualquier empresa
 */
async function isAdministrador(empresaId, rolId) {
  try {
    const rol = await Role.findById(rolId);

    if (!rol || rol.empresa_id !== empresaId) {
      return false;
    }

    // Buscar por nombre, no por ID fijo
    return rol.nombre_rol === 'Administrador';
  } catch (err) {
    console.error('Error al verificar rol administrador:', err);
    return false;
  }
}

/**
 * Obtener el rol de Administrador de una empresa
 */
async function getAdministradorRole(req, res) {
  try {
    const { empresa_id } = req.params;

    // Buscar el rol Administrador por nombre (no por ID)
    const rolAdmin = await Role.findOne({
      empresa_id,
      nombre_rol: 'Administrador',
    });

    if (!rolAdmin) {
      return res.status(404).json({
        error: 'Rol de Administrador no encontrado para esta empresa.',
        sugerencia: 'Verifica que la empresa esté correctamente configurada.',
      });
    }

    res.json({
      rol: rolAdmin,
      mensaje: 'Rol de Administrador encontrado exitosamente',
    });
  } catch (err) {
    console.error('Error al obtener rol administrador:', err);
    res.status(500).json({ error: 'Error al obtener el rol de administrador.' });
  }
}

/**
 * Obtener estadísticas de roles de una empresa
 */
async function getRoleStats(req, res) {
  try {
    const { empresa_id } = req.params;

    const [rolesPredeterminados, rolesPersonalizados, totalRoles] = await Promise.all([
      Role.count({ empresa_id, es_predeterminado: true }),
      Role.count({ empresa_id, es_predeterminado: false }),
      Role.count({ empresa_id }),
    ]);

    // Obtener límite del plan
    const Company = require('../models/company.model');
    const Plan = require('../models/plan.model');
    const empresa = await Company.findById(empresa_id);
    const plan = await Plan.findById(empresa.plan_id);

    const limiteRoles = plan?.limites?.roles || 2;

    res.json({
      roles_predeterminados: rolesPredeterminados,
      roles_personalizados: rolesPersonalizados,
      total_roles: totalRoles,
      limite_personalizados: limiteRoles === null ? 'Ilimitado' : limiteRoles,
      disponibles:
        limiteRoles === null ? 'Ilimitado' : Math.max(0, limiteRoles - rolesPersonalizados),
      porcentaje_uso: limiteRoles === null ? 0 : (rolesPersonalizados / limiteRoles) * 100,
    });
  } catch (err) {
    console.error('Error al obtener estadísticas de roles:', err);
    res.status(500).json({ error: 'Error al obtener estadísticas de roles.' });
  }
}

module.exports = {
  getRolesByCompany,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  setDefaultRole,
  isAdministrador,
  getAdministradorRole,
  getRoleStats,
};
