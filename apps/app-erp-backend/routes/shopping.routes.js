const express = require('express');
const router = express.Router();
const shoppingController = require('../controllers/shopping.controller');

// ========== PROVIDERS ROUTES ==========
router.get('/providers', shoppingController.getProviders);
router.get('/providers/:id', shoppingController.getProviderById);
router.get('/providers/:providerId/history', shoppingController.getProviderHistory);
router.get('/providers/:providerId/history', shoppingController.getProviderHistory);
router.get('/providers/:providerId/history', shoppingController.getProviderHistory);
router.post('/providers', shoppingController.createProvider);
router.put('/providers/:id', shoppingController.updateProvider);
router.delete('/providers/:id', shoppingController.deleteProvider);

// ========== PRODUCTS ROUTES ==========
router.get('/products', shoppingController.getProducts);
router.get('/products/:id', shoppingController.getProductById);
router.post('/products', shoppingController.createProduct);
router.put('/products/:id', shoppingController.updateProduct);
router.delete('/products/:id', shoppingController.deleteProduct);

// ========== PURCHASE ORDERS ROUTES ==========
router.get('/purchase-orders', shoppingController.getPurchaseOrders);
router.get('/purchase-orders/:id', shoppingController.getPurchaseOrderById);
router.post('/purchase-orders', shoppingController.createPurchaseOrder);
router.put('/purchase-orders/:id', shoppingController.updatePurchaseOrder);
router.delete('/purchase-orders/:id', shoppingController.deletePurchaseOrder);

// ========== RECEPTIONS ROUTES ==========
router.get('/receptions', shoppingController.getReceptions);
router.post('/receptions', shoppingController.createReception);

// ========== CONTRACTS ROUTES ==========
router.get('/contracts', shoppingController.getContracts);
router.get('/contracts/:id', shoppingController.getContractById);
router.post('/contracts', shoppingController.createContract);
router.put('/contracts/:id', shoppingController.updateContract);
router.delete('/contracts/:id', shoppingController.deleteContract);

module.exports = router;
