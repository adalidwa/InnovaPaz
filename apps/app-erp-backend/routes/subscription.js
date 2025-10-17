const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription.controller');
const { verifyFirebaseToken } = require('../controllers/auth.controller');
const { checkPlanLimits } = require('../middleware/planValidation');

// Obtener información de suscripción actual
router.get('/info', verifyFirebaseToken, subscriptionController.getSubscriptionInfo);

// TESTING - Obtener información sin auth
router.get('/test', subscriptionController.getSubscriptionInfoTest);

// Obtener facturas de la empresa
router.get('/invoices', verifyFirebaseToken, subscriptionController.getInvoices);

// Obtener alertas de suscripción
router.get('/alerts', verifyFirebaseToken, subscriptionController.getSubscriptionAlerts);

// Procesar pago
router.post('/payment', verifyFirebaseToken, subscriptionController.processPayment);

// Renovar suscripción
router.post('/renew', verifyFirebaseToken, subscriptionController.renewSubscription);

// Cancelar suscripción
router.post('/cancel', verifyFirebaseToken, subscriptionController.cancelSubscription);

// Cambiar plan
router.post('/change-plan', verifyFirebaseToken, subscriptionController.changePlan);

// Endpoint para verificar suscripciones (cron job) - sin autenticación para el cron
router.post('/check-status', subscriptionController.checkSubscriptionStatus);

module.exports = router;
