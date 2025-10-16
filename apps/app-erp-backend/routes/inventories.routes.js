const { Router } = require('express');
const {
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductByCode,
} = require('../controllers/inventories.controller');

const router = Router();

// Búsqueda de productos
router.get('/products/search', searchProducts);

// Buscar producto por código
router.get('/products/code/:code', getProductByCode);

// Obtener todos los productos
router.get('/products', getAllProducts);

// Obtener un producto específico por ID
router.get('/products/:id', getProduct);

// Crear un nuevo producto
router.post('/products', createProduct);

// Actualizar un producto
router.put('/products/:id', updateProduct);

// Desactivar un producto (soft delete)
router.delete('/products/:id', deleteProduct);

module.exports = router;
