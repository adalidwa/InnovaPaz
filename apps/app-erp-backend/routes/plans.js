const express = require('express');
const router = express.Router();
const plansController = require('../controllers/plans.controller');
const { verifyFirebaseToken } = require('../controllers/auth.controller');

function verifyAdmin(req, res, next) {
  next();
}

// Listar todos los planes (PÚBLICO - para mostrar en pricing)
router.get('/', plansController.getAllPlans);

// Obtener plan por ID (público también)
router.get('/:id', plansController.getPlanById);

// Crear plan (solo admin)
router.post('/', verifyFirebaseToken, verifyAdmin, plansController.createPlan);

// Actualizar plan (solo admin)
router.put('/:id', verifyFirebaseToken, verifyAdmin, plansController.updatePlan);

// Eliminar plan (solo admin)
router.delete('/:id', verifyFirebaseToken, verifyAdmin, plansController.deletePlan);

// Asignar plan a empresa (solo admin)
router.post('/assign', verifyFirebaseToken, verifyAdmin, plansController.assignPlanToCompany);

module.exports = router;
