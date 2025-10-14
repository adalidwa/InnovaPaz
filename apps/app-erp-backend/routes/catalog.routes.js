const { Router } = require('express');
const { getCategories, getSubcategories, getBrands } = require('../controllers/catalog.controller');

const router = Router();

// Obtener todas las categorías principales (padres)
router.get('/categories', getCategories);

// Obtener subcategorías por categoría padre
router.get('/categories/:parentId/subcategories', getSubcategories);

// Obtener todas las marcas
router.get('/brands', getBrands);

module.exports = router;
