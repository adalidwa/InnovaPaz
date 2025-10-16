const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const { verifyFirebaseToken } = require('../controllers/auth.controller');
const { checkPlanLimits } = require('../middleware/planValidation');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Obtener todos los usuarios de una empresa
router.get('/company/:empresa_id', verifyFirebaseToken, usersController.getUsersByCompany);

// Obtener usuario por UID
router.get('/:uid', verifyFirebaseToken, usersController.getUserById);

// Crear usuario (con validación de límites de plan)
router.post('/', verifyFirebaseToken, checkPlanLimits('create_user'), usersController.createUser);

// Actualizar usuario
router.put('/:uid', verifyFirebaseToken, usersController.updateUser);

// Eliminar usuario
router.delete('/:uid', verifyFirebaseToken, usersController.deleteUser);

// Cambiar rol de usuario
router.put('/:uid/role', verifyFirebaseToken, usersController.changeUserRole);

// Actualizar preferencias de usuario
router.patch('/:uid/preferences', verifyFirebaseToken, usersController.updatePreferences);

// Nuevo: Completar configuración de empresa para un usuario de Firebase existente
router.post('/complete-company-setup', verifyFirebaseToken, usersController.completeCompanySetup);

// Subir avatar de usuario (protegida)
router.post(
  '/upload/avatar/:uid',
  verifyFirebaseToken,
  upload.single('avatar'),
  usersController.uploadUserAvatar
);

module.exports = router;
