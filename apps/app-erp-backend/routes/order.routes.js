const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/order.controller');

// Rutas de pedidos
router.get('/:empresaId/orders', OrderController.getOrders);
router.get('/:empresaId/orders/stats', OrderController.getStats);
router.get('/:empresaId/orders/:pedidoId', OrderController.getOrderById);
router.post('/:empresaId/orders', OrderController.createOrder);
router.patch('/:empresaId/orders/:pedidoId/status', OrderController.updateOrderStatus);

module.exports = router;
