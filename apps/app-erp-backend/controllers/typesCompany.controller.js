const TypeCompany = require('../models/typeCompany.model'); // Asumiendo que existe el modelo TypeCompany

// Lista todos los tipos de empresa
async function getAllTypes(req, res) {
  try {
    const tipos = await TypeCompany.find();
    res.json(tipos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los tipos de empresa.' });
  }
}

// Obtiene un tipo de empresa por su ID
async function getTypeById(req, res) {
  try {
    const tipo = await TypeCompany.findById(req.params.tipo_id);
    if (!tipo) return res.status(404).json({ error: 'Tipo de empresa no encontrado.' });
    res.json(tipo);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el tipo de empresa.' });
  }
}

// Crea un nuevo tipo de empresa
async function createType(req, res) {
  try {
    const { tipo_empresa } = req.body;
    const nuevoTipo = new TypeCompany({
      tipo_empresa,
      fecha_creacion: new Date(),
    });
    await nuevoTipo.save();
    res.status(201).json(nuevoTipo);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear el tipo de empresa.' });
  }
}

// Actualiza un tipo de empresa
async function updateType(req, res) {
  try {
    const { tipo_empresa } = req.body;
    const tipoActualizado = await TypeCompany.findByIdAndUpdate(
      req.params.tipo_id,
      { tipo_empresa },
      { new: true }
    );
    if (!tipoActualizado) return res.status(404).json({ error: 'Tipo de empresa no encontrado.' });
    res.json(tipoActualizado);
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar el tipo de empresa.' });
  }
}

// Elimina un tipo de empresa
async function deleteType(req, res) {
  try {
    const tipo = await TypeCompany.findByIdAndDelete(req.params.tipo_id);
    if (!tipo) return res.status(404).json({ error: 'Tipo de empresa no encontrado.' });
    res.json({ mensaje: 'Tipo de empresa eliminado correctamente.' });
  } catch (err) {
    res.status(400).json({ error: 'Error al eliminar el tipo de empresa.' });
  }
}

module.exports = {
  getAllTypes,
  getTypeById,
  createType,
  updateType,
  deleteType,
};
