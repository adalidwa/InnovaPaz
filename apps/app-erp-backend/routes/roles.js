const express = require('express');
const router = express.Router();
const rolesController = require('../controllers/roles.controller');
const { verifyFirebaseToken } = require('../controllers/auth.controller');

// Obtener todos los roles de una empresa
router.get('/company/:empresa_id', verifyFirebaseToken, rolesController.getRolesByCompany);

// Obtener rol por ID
router.get('/:rol_id', verifyFirebaseToken, rolesController.getRoleById);

// Crear rol
router.post('/', verifyFirebaseToken, rolesController.createRole);

// Actualizar rol
router.put('/:rol_id', verifyFirebaseToken, rolesController.updateRole);

// Eliminar rol
router.delete('/:rol_id', verifyFirebaseToken, rolesController.deleteRole);

// Definir rol predeterminado para empresa
router.post('/set-default', verifyFirebaseToken, rolesController.setDefaultRole);

// 🆕 Obtener rol de Administrador de una empresa
router.get(
  '/company/:empresa_id/administrador',
  verifyFirebaseToken,
  rolesController.getAdministradorRole
);

// 🆕 Obtener estadísticas de roles de una empresa
router.get('/company/:empresa_id/stats', verifyFirebaseToken, rolesController.getRoleStats);

// Obtener roles filtrados por empresa
router.get('/', async (req, res) => {
  const { empresa_id } = req.query;
  if (!empresa_id) {
    return res.status(400).json({ error: 'empresa_id es requerido' });
  }
  try {
    const roles = await rolesController.getRolesByCompany({ params: { empresa_id } }, res);
    // Si tu controlador ya responde, no necesitas hacer nada aquí.
    // Si quieres devolver el resultado directamente:
    // const roles = await Role.find({ empresa_id });
    // res.json(roles);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener roles.' });
  }
});

module.exports = router;
