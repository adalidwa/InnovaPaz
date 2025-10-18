const TypeCompany = require('../models/typeCompany.model');
const { validadores, TIPOS_EMPRESA_ARRAY } = require('../utils/constants');

async function getAllTypes(req, res) {
  try {
    const tipos = await TypeCompany.find();
    res.json(tipos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los tipos de empresa.' });
  }
}

async function getTypeById(req, res) {
  try {
    const tipo = await TypeCompany.findById(req.params.tipo_id);
    if (!tipo) return res.status(404).json({ error: 'Tipo de empresa no encontrado.' });
    res.json(tipo);
  } catch (err) {
    console.error('Error al obtener tipo de empresa:', err);
    res.status(500).json({ error: 'Error al obtener el tipo de empresa.', details: err.message });
  }
}

async function createType(req, res) {
  try {
    const { tipo_empresa } = req.body;

    // Validación: campo requerido
    if (!tipo_empresa || tipo_empresa.trim() === '') {
      return res.status(400).json({ error: 'El campo tipo_empresa es requerido.' });
    }

    // Validación: longitud máxima
    if (tipo_empresa.length > 100) {
      return res.status(400).json({ error: 'El tipo de empresa no puede exceder 100 caracteres.' });
    }

    // Validación: tipo permitido
    if (!validadores.isTipoEmpresaValido(tipo_empresa)) {
      return res.status(400).json({
        error: `Tipo de empresa no válido. Tipos permitidos: ${TIPOS_EMPRESA_ARRAY.join(', ')}`,
      });
    }

    const nuevoTipo = await TypeCompany.create({ tipo_empresa });
    res.status(201).json(nuevoTipo);
  } catch (err) {
    console.error('Error al crear tipo de empresa:', err);
    res.status(400).json({ error: 'Error al crear el tipo de empresa.', details: err.message });
  }
}

async function updateType(req, res) {
  try {
    const { tipo_empresa } = req.body;

    // Validación: campo requerido
    if (!tipo_empresa || tipo_empresa.trim() === '') {
      return res.status(400).json({ error: 'El campo tipo_empresa es requerido.' });
    }

    // Validación: longitud máxima
    if (tipo_empresa.length > 100) {
      return res.status(400).json({ error: 'El tipo de empresa no puede exceder 100 caracteres.' });
    }

    // Validación: tipo permitido
    if (!validadores.isTipoEmpresaValido(tipo_empresa)) {
      return res.status(400).json({
        error: `Tipo de empresa no válido. Tipos permitidos: ${TIPOS_EMPRESA_ARRAY.join(', ')}`,
      });
    }

    const tipoActualizado = await TypeCompany.findByIdAndUpdate(req.params.tipo_id, {
      tipo_empresa,
    });
    if (!tipoActualizado) return res.status(404).json({ error: 'Tipo de empresa no encontrado.' });
    res.json(tipoActualizado);
  } catch (err) {
    console.error('Error al actualizar tipo de empresa:', err);
    res
      .status(400)
      .json({ error: 'Error al actualizar el tipo de empresa.', details: err.message });
  }
}

async function deleteType(req, res) {
  try {
    const tipo = await TypeCompany.findByIdAndDelete(req.params.tipo_id);
    if (!tipo) return res.status(404).json({ error: 'Tipo de empresa no encontrado.' });
    res.json({ mensaje: 'Tipo de empresa eliminado correctamente.' });
  } catch (err) {
    console.error('Error al eliminar tipo de empresa:', err);
    // Si hay empresas usando este tipo, PostgreSQL dará error de FK
    if (err.code === '23503') {
      return res.status(409).json({
        error: 'No se puede eliminar el tipo de empresa porque hay empresas asociadas.',
        code: 'FK_CONSTRAINT_VIOLATION',
      });
    }
    res.status(400).json({ error: 'Error al eliminar el tipo de empresa.', details: err.message });
  }
}

module.exports = {
  getAllTypes,
  getTypeById,
  createType,
  updateType,
  deleteType,
};
