const express = require('express');
const router = express.Router();
const plansController = require('../controllers/plans.controller');
const { verifyToken } = require('../controllers/auth.controller');

// Middleware de ejemplo para verificar administrador
function verifyAdmin(req, res, next) {
  // Aquí deberías verificar el rol del usuario
  // if (req.user && req.user.rol === 'admin') return next();
  // res.status(403).json({ error: 'Solo administradores.' });
  next(); // Quitar esto y poner la lógica real
}

// Listar todos los planes (PÚBLICO - para mostrar en pricing)
router.get('/', plansController.getAllPlans);

// Obtener plan por ID (público también)
router.get('/:id', plansController.getPlanById);

// Crear plan (solo admin)
router.post('/', verifyToken, verifyAdmin, plansController.createPlan);

// Actualizar plan (solo admin)
router.put('/:id', verifyToken, verifyAdmin, plansController.updatePlan);

// Eliminar plan (solo admin)
router.delete('/:id', verifyToken, verifyAdmin, plansController.deletePlan);

// Asignar plan a empresa (solo admin)
router.post('/assign', verifyToken, verifyAdmin, plansController.assignPlanToCompany);

module.exports = router;
