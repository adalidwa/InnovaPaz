const express = require('express');
const router = express.Router();
const {
  getAllSales,
  getSaleById,
  createSale,
  updateSaleStatus,
  cancelSale,
  getSalesStats,
} = require('../controllers/sales.controller');

// Rutas de ventas por empresa
router.get('/empresa/:empresaId', getAllSales);
router.get('/empresa/:empresaId/stats', getSalesStats);
router.get('/empresa/:empresaId/:ventaId', getSaleById);
router.post('/empresa/:empresaId', createSale);
router.put('/empresa/:empresaId/:ventaId/status', updateSaleStatus);
router.put('/empresa/:empresaId/:ventaId/cancel', cancelSale);

module.exports = router;
