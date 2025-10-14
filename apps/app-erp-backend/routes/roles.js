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
