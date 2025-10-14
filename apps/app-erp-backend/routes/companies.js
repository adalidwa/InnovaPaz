const express = require('express');
const router = express.Router();
const companiesController = require('../controllers/companies.controller');
const { verifyToken } = require('../controllers/auth.controller');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.get('/types', companiesController.getAllCompanyTypes);
router.post('/types', verifyToken, companiesController.createCompanyType);

// Listar todas las empresas (puede ser pública o protegida, la dejamos pública por ahora)
router.get('/', companiesController.getAllCompanies);

// Obtener empresa por ID (protegida)
router.get('/:empresa_id', verifyToken, companiesController.getCompanyById);

// Listar empresas por plan (protegida)
router.get('/by-plan/:plan_id', verifyToken, async (req, res) => {
  try {
    const empresas = await require('../models/company.model').find({ plan_id: req.params.plan_id });
    res.json(empresas);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener empresas por plan.' });
  }
});

// Registrar nueva empresa (pública, es el endpoint de registro)
router.post('/', companiesController.createCompany);

// Actualizar empresa (protegida)
router.put('/:empresa_id', verifyToken, companiesController.updateCompany);

// Eliminar empresa (protegida)
router.delete('/:empresa_id', verifyToken, companiesController.deleteCompany);

// Cambiar plan de empresa (protegida)
router.put('/:empresa_id/change-plan', verifyToken, companiesController.changePlan);

// Actualizar estado de suscripción (protegida)
router.put(
  '/:empresa_id/subscription-status',
  verifyToken,
  companiesController.updateSubscriptionStatus
);

// Subir logo de empresa (protegida)
router.post(
  '/upload/logo/:empresa_id',
  verifyToken,
  upload.single('logo'),
  companiesController.uploadCompanyLogo
);

// Nuevas rutas para los endpoints solicitados
router.get('/:empresa_id/invoices', companiesController.getCompanyInvoices);
router.get('/:empresa_id/plan', companiesController.getCompanyPlan);

module.exports = router;
