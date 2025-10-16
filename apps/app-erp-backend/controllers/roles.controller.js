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

    const nuevoRol = await Role.create({
      empresa_id,
      nombre_rol,
      permisos: permisos || {},
      es_predeterminado: es_predeterminado || false,
      estado: estado || 'activo',
    });
    res.status(201).json(nuevoRol);
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
    const rol = await Role.findByIdAndDelete(req.params.rol_id);
    if (!rol) return res.status(404).json({ error: 'Rol no encontrado.' });
    res.json({ mensaje: 'Rol eliminado correctamente.' });
  } catch (err) {
    res.status(400).json({ error: 'Error al eliminar el rol.' });
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

module.exports = {
  getRolesByCompany,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  setDefaultRole,
};
