const express = require('express');
const router = express.Router();
const rolesPlantillaController = require('../controllers/rolesPlantilla.controller');

// Middleware de autenticación (ajustar según tu implementación)
// const authMiddleware = require('../middleware/auth');

/**
 * @route   GET /api/roles-plantilla/empresa/:empresa_id/disponibles
 * @desc    Obtener todos los roles disponibles para una empresa (plantillas + personalizados)
 * @access  Private
 */
router.get('/empresa/:empresa_id/disponibles', rolesPlantillaController.getRolesDisponiblesEmpresa);

/**
 * @route   GET /api/roles-plantilla/empresa/:empresa_id/plantillas
 * @desc    Obtener solo las plantillas de roles según el tipo de empresa
 * @access  Private
 */
router.get('/empresa/:empresa_id/plantillas', rolesPlantillaController.getPlantillasPorTipoEmpresa);

/**
 * @route   POST /api/roles-plantilla/empresa/:empresa_id/crear-desde-plantilla
 * @desc    Crear un rol personalizado basado en una plantilla
 * @access  Private
 * @body    { plantilla_id, nombre_personalizado?, permisos_personalizados? }
 */
router.post(
  '/empresa/:empresa_id/crear-desde-plantilla',
  rolesPlantillaController.crearRolDesdePlantilla
);

/**
 * @route   GET /api/roles-plantilla/empresa/:empresa_id/estadisticas
 * @desc    Obtener estadísticas de uso de roles para una empresa
 * @access  Private
 */
router.get('/empresa/:empresa_id/estadisticas', rolesPlantillaController.getEstadisticasRoles);

/**
 * @route   GET /api/roles-plantilla/todas
 * @desc    Obtener todas las plantillas del sistema (solo admin)
 * @access  Private (Admin only)
 */
router.get('/todas', rolesPlantillaController.getAllPlantillas);

module.exports = router;
