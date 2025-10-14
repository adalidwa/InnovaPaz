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
