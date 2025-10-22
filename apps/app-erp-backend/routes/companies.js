const express = require('express');
const router = express.Router();
const companiesController = require('../controllers/companies.controller');
const { verifyFirebaseToken } = require('../controllers/auth.controller');
const multer = require('multer');

// Configurar multer para usar memoria en lugar de disco (para Vercel)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo para logos
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes.'), false);
    }
  },
});

router.get('/types', companiesController.getAllCompanyTypes);
router.post('/types', verifyFirebaseToken, companiesController.createCompanyType);

// Listar todas las empresas (puede ser pública o protegida, la dejamos pública por ahora)
router.get('/', companiesController.getAllCompanies);

// Obtener empresa por ID (protegida)
router.get('/:empresa_id', verifyFirebaseToken, companiesController.getCompanyById);

// Listar empresas por plan (protegida)
router.get('/by-plan/:plan_id', verifyFirebaseToken, async (req, res) => {
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
router.put('/:empresa_id', verifyFirebaseToken, companiesController.updateCompany);

// Eliminar empresa (protegida)
router.delete('/:empresa_id', verifyFirebaseToken, companiesController.deleteCompany);

// Cambiar plan de empresa (protegida)
router.put('/:empresa_id/change-plan', verifyFirebaseToken, companiesController.changePlan);

// Actualizar estado de suscripción (protegida)
router.put(
  '/:empresa_id/subscription-status',
  verifyFirebaseToken,
  companiesController.updateSubscriptionStatus
);

// Subir logo de empresa (protegida)
router.post(
  '/upload/logo/:empresa_id',
  verifyFirebaseToken,
  upload.single('logo'),
  companiesController.uploadCompanyLogo
);

// Nuevas rutas para los endpoints solicitados
router.get('/:empresa_id/invoices', companiesController.getCompanyInvoices);
router.get('/:empresa_id/plan', companiesController.getCompanyPlan);

module.exports = router;
