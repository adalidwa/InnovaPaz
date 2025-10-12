const express = require('express');
const router = express.Router();
const rolesController = require('../controllers/roles.controller');
const { verifyToken } = require('../controllers/auth.controller');

// Obtener todos los roles de una empresa
router.get('/company/:empresa_id', verifyToken, rolesController.getRolesByCompany);

// Obtener rol por ID
router.get('/:rol_id', verifyToken, rolesController.getRoleById);

// Crear rol
router.post('/', verifyToken, rolesController.createRole);

// Actualizar rol
router.put('/:rol_id', verifyToken, rolesController.updateRole);

// Eliminar rol
router.delete('/:rol_id', verifyToken, rolesController.deleteRole);

// Definir rol predeterminado para empresa
router.post('/set-default', verifyToken, rolesController.setDefaultRole);

module.exports = router;
