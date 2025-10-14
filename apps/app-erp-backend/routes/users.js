const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const { verifyToken } = require('../controllers/auth.controller');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Obtener todos los usuarios de una empresa
router.get('/company/:empresa_id', verifyToken, usersController.getUsersByCompany);

// Obtener usuario por UID
router.get('/:uid', verifyToken, usersController.getUserById);

// Crear usuario
router.post('/', verifyToken, usersController.createUser);

// Actualizar usuario
router.put('/:uid', verifyToken, usersController.updateUser);

// Eliminar usuario
router.delete('/:uid', verifyToken, usersController.deleteUser);

// Cambiar rol de usuario
router.put('/:uid/role', verifyToken, usersController.changeUserRole);

// Actualizar preferencias de usuario
router.put('/:uid/preferences', verifyToken, usersController.updatePreferences);

// Nuevo: Completar configuración de empresa para un usuario de Firebase existente
router.post('/complete-company-setup', verifyToken, usersController.completeCompanySetup);

// Subir avatar de usuario (protegida)
router.post(
  '/upload/avatar/:uid',
  verifyToken,
  upload.single('avatar'),
  usersController.uploadUserAvatar
);

module.exports = router;
