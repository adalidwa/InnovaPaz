const Role = require('../models/role.model');

// Obtiene todos los roles de una empresa
async function getRolesByCompany(req, res) {
  try {
    const roles = await Role.find({ empresa_id: req.params.empresa_id });
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los roles de la empresa.' });
  }
}

// Obtiene un rol por su ID
async function getRoleById(req, res) {
  try {
    const rol = await Role.findById(req.params.rol_id);
    if (!rol) return res.status(404).json({ error: 'Rol no encontrado.' });
    res.json(rol);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el rol.' });
  }
}

// Crea un nuevo rol
async function createRole(req, res) {
  try {
    const { empresa_id, nombre_rol, permisos, es_predeterminado, estado } = req.body;
    const nuevoRol = await Role.create({
      empresa_id,
      nombre_rol,
      permisos,
      es_predeterminado,
      estado,
    });
    res.status(201).json(nuevoRol);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear el rol.' });
  }
}

// Actualiza un rol
async function updateRole(req, res) {
  try {
    const { nombre_rol, permisos, es_predeterminado, estado } = req.body;
    const rolActualizado = await Role.findByIdAndUpdate(req.params.rol_id, {
      nombre_rol,
      permisos,
      es_predeterminado,
      estado,
    });
    if (!rolActualizado) return res.status(404).json({ error: 'Rol no encontrado.' });
    res.json(rolActualizado);
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar el rol.' });
  }
}

// Elimina un rol
async function deleteRole(req, res) {
  try {
    const rol = await Role.findByIdAndDelete(req.params.rol_id);
    if (!rol) return res.status(404).json({ error: 'Rol no encontrado.' });
    res.json({ mensaje: 'Rol eliminado correctamente.' });
  } catch (err) {
    res.status(400).json({ error: 'Error al eliminar el rol.' });
  }
}

// Establece un rol como predeterminado para una empresa
async function setDefaultRole(req, res) {
  try {
    const { companyId, rol_id } = req.body;
    // Primero, desmarcar todos los roles como predeterminados para la empresa
    await Role.updateMany({ empresa_id: companyId }, { es_predeterminado: false });
    // Luego, marcar el rol indicado como predeterminado
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
