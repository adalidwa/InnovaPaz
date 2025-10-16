const CategoryModel = require('../models/category.model');

// Obtener todas las categorías
const getAllCategories = async (req, res) => {
  try {
    const categories = await CategoryModel.findAll();

    res.status(200).json({
      success: true,
      data: categories,
      count: categories.length,
    });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener categorías',
      error: error.message,
    });
  }
};

// Crear categoría
const createCategory = async (req, res) => {
  try {
    const categoryData = req.body;

    if (!categoryData.nombre) {
      return res.status(400).json({
        success: false,
        message: 'El nombre es requerido',
      });
    }

    const newCategory = await CategoryModel.create(categoryData);

    res.status(201).json({
      success: true,
      message: 'Categoría creada exitosamente',
      data: newCategory,
    });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear categoría',
      error: error.message,
    });
  }
};

// Actualizar categoría
const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const categoryData = req.body;

    const updatedCategory = await CategoryModel.update(categoryId, categoryData);

    if (!updatedCategory) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Categoría actualizada exitosamente',
      data: updatedCategory,
    });
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar categoría',
      error: error.message,
    });
  }
};

// Desactivar categoría
const deactivateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const deactivatedCategory = await CategoryModel.deactivate(categoryId);

    if (!deactivatedCategory) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Categoría desactivada exitosamente',
      data: deactivatedCategory,
    });
  } catch (error) {
    console.error('Error al desactivar categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error al desactivar categoría',
      error: error.message,
    });
  }
};

// Activar categoría
const activateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const activatedCategory = await CategoryModel.activate(categoryId);

    if (!activatedCategory) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Categoría activada exitosamente',
      data: activatedCategory,
    });
  } catch (error) {
    console.error('Error al activar categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error al activar categoría',
      error: error.message,
    });
  }
};

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deactivateCategory,
  activateCategory,
};
