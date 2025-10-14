const { Router } = require('express');
const {
  getCategories,
  getSubcategories,
  getBrands,
  getAttributesByCategory,
} = require('../controllers/catalog.controller');

const router = Router();

// Obtener todas las categorías principales (padres)
router.get('/categories', getCategories);

// Obtener subcategorías por categoría padre
router.get('/categories/:parentId/subcategories', getSubcategories);

// Obtener atributos específicos por categoría
router.get('/categories/:categoryId/attributes', getAttributesByCategory);

// Obtener todas las marcas
router.get('/brands', getBrands);

module.exports = router;
