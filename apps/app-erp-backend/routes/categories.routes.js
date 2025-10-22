const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  createCategory,
  updateCategory,
  deactivateCategory,
  activateCategory,
} = require('../controllers/categories.controller');

// Rutas de categorías (globales, no por empresa)
router.get('/', getAllCategories);
router.post('/', createCategory);
router.put('/:categoryId', updateCategory);
router.put('/:categoryId/activate', activateCategory);
router.delete('/:categoryId', deactivateCategory);

module.exports = router;
