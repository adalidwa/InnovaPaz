const Role = require('../models/role.model');
const RolePlantilla = require('../models/rolePlantilla.model');
const Company = require('../models/company.model');
const Plan = require('../models/plan.model');

/**
 * Obtener roles disponibles para una empresa (plantillas + personalizados)
 */
async function getRolesDisponiblesEmpresa(req, res) {
  try {
    const { empresa_id } = req.params;

    // Verificar que la empresa existe
    const empresa = await Company.findById(empresa_id);
    if (!empresa) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }

    // Obtener límite del plan
    const plan = await Plan.findById(empresa.plan_id);
    const limiteRolesPlantilla = plan?.limites?.roles || 2;

    // Usar la función de base de datos para obtener roles disponibles
    const rolesDisponibles = await RolePlantilla.getRolesDisponiblesEmpresa(
      empresa_id,
      limiteRolesPlantilla
    );

    // Separar en categorías para el frontend
    const plantillas = rolesDisponibles.filter((rol) => rol.tipo_rol === 'plantilla');
    const personalizados = rolesDisponibles.filter((rol) => rol.tipo_rol === 'personalizado');

    res.json({
      empresa_id,
      plan: plan?.nombre_plan || 'Desconocido',
      limite_plantillas: limiteRolesPlantilla,
      plantillas: plantillas.map((rol) => ({
        id: rol.id_rol,
        tipo: 'plantilla',
        nombre: rol.nombre_rol,
        descripcion: rol.descripcion,
        permisos: rol.permisos,
        puede_usar: rol.puede_usar,
        orden: rol.orden_visualizacion,
      })),
      personalizados: personalizados.map((rol) => ({
        id: rol.id_rol,
        tipo: 'personalizado',
        nombre: rol.nombre_rol,
        descripcion: rol.descripcion,
        permisos: rol.permisos,
        puede_usar: rol.puede_usar,
      })),
      resumen: {
        total_plantillas: plantillas.length,
        plantillas_disponibles: plantillas.filter((r) => r.puede_usar).length,
        total_personalizados: personalizados.length,
      },
    });
  } catch (error) {
    console.error('Error al obtener roles disponibles:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message,
    });
  }
}

/**
 * Obtener solo las plantillas de roles según el tipo de empresa
 */
async function getPlantillasPorTipoEmpresa(req, res) {
  try {
    const { empresa_id } = req.params;

    // Obtener empresa y su plan
    const empresa = await Company.findById(empresa_id);
    if (!empresa) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }

    const plan = await Plan.findById(empresa.plan_id);
    const limitePlantillas = plan?.limites?.roles || 2;

    // Obtener plantillas del tipo de empresa
    const plantillas = await RolePlantilla.findByTipoEmpresa(
      empresa.tipo_empresa_id,
      limitePlantillas
    );

    res.json({
      tipo_empresa: plantillas[0]?.tipo_empresa || 'Desconocido',
      limite_plan: limitePlantillas,
      plantillas: plantillas.map((plantilla, index) => ({
        plantilla_id: plantilla.plantilla_id,
        nombre_rol: plantilla.nombre_rol,
        descripcion: plantilla.descripcion,
        permisos: plantilla.permisos,
        orden: plantilla.orden_visualizacion,
        disponible: index < limitePlantillas || limitePlantillas === null,
      })),
    });
  } catch (error) {
    console.error('Error al obtener plantillas:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message,
    });
  }
}

/**
 * Crear rol personalizado desde una plantilla
 */
async function crearRolDesdePlantilla(req, res) {
  try {
    const { empresa_id } = req.params;
    const { plantilla_id, nombre_personalizado, permisos_personalizados } = req.body;

    // Validaciones
    if (!plantilla_id) {
      return res.status(400).json({ error: 'plantilla_id es requerido' });
    }

    // Verificar empresa
    const empresa = await Company.findById(empresa_id);
    if (!empresa) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }

    // Verificar límite de roles personalizados
    const rolesPersonalizados = await Role.find({
      empresa_id,
      es_predeterminado: false,
    });

    const plan = await Plan.findById(empresa.plan_id);
    const limitePersonalizados = plan?.limites?.roles_personalizados || 2;

    if (limitePersonalizados !== null && rolesPersonalizados.length >= limitePersonalizados) {
      return res.status(403).json({
        error: `Has alcanzado el límite de roles personalizados (${limitePersonalizados})`,
        actual: rolesPersonalizados.length,
        limite: limitePersonalizados,
      });
    }

    // Obtener plantilla
    const plantilla = await RolePlantilla.findById(plantilla_id);
    if (!plantilla) {
      return res.status(404).json({ error: 'Plantilla de rol no encontrada' });
    }

    // Verificar que la plantilla corresponde al tipo de empresa
    if (plantilla.tipo_empresa_id !== empresa.tipo_empresa_id) {
      return res.status(400).json({
        error: 'La plantilla no corresponde al tipo de empresa',
      });
    }

    // Crear rol personalizado
    const nombreFinal = nombre_personalizado || `${plantilla.nombre_rol} Personalizado`;
    const permisosFinal = permisos_personalizados || plantilla.permisos;

    const nuevoRol = await Role.create({
      empresa_id,
      nombre_rol: nombreFinal,
      permisos: permisosFinal,
      es_predeterminado: false,
      estado: 'activo',
      plantilla_id_origen: plantilla_id,
    });

    res.status(201).json({
      mensaje: 'Rol personalizado creado exitosamente desde plantilla',
      rol: nuevoRol,
      plantilla_origen: {
        id: plantilla.plantilla_id,
        nombre: plantilla.nombre_rol,
        tipo_empresa: plantilla.tipo_empresa,
      },
    });
  } catch (error) {
    console.error('Error al crear rol desde plantilla:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message,
    });
  }
}

/**
 * Obtener todas las plantillas del sistema (solo admin)
 */
async function getAllPlantillas(req, res) {
  try {
    const plantillas = await RolePlantilla.findAll();

    // Agrupar por tipo de empresa
    const porTipo = plantillas.reduce((acc, plantilla) => {
      if (!acc[plantilla.tipo_empresa]) {
        acc[plantilla.tipo_empresa] = [];
      }
      acc[plantilla.tipo_empresa].push({
        plantilla_id: plantilla.plantilla_id,
        nombre_rol: plantilla.nombre_rol,
        descripcion: plantilla.descripcion,
        permisos: plantilla.permisos,
        orden: plantilla.orden_visualizacion,
      });
      return acc;
    }, {});

    res.json({
      total_plantillas: plantillas.length,
      por_tipo_empresa: porTipo,
    });
  } catch (error) {
    console.error('Error al obtener todas las plantillas:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message,
    });
  }
}

/**
 * Obtener estadísticas de uso del sistema de roles
 */
async function getEstadisticasRoles(req, res) {
  try {
    const { empresa_id } = req.params;

    // Obtener datos de la empresa y plan
    const empresa = await Company.findById(empresa_id);
    if (!empresa) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }

    const plan = await Plan.findById(empresa.plan_id);

    // Obtener plantillas disponibles
    const plantillasDisponibles = await RolePlantilla.findByTipoEmpresa(empresa.tipo_empresa_id);

    // Obtener roles personalizados
    const rolesPersonalizados = await Role.find({
      empresa_id,
      es_predeterminado: false,
    });

    // Calcular estadísticas
    const limitePersonalizados = plan?.limites?.roles_personalizados || 2;
    const limitePlantillas = plan?.limites?.roles || 2;

    res.json({
      empresa: {
        id: empresa_id,
        nombre: empresa.nombre,
        tipo: plantillasDisponibles[0]?.tipo_empresa || 'Desconocido',
        plan: plan?.nombre_plan || 'Desconocido',
      },
      plantillas: {
        total_disponibles: plantillasDisponibles.length,
        permitidas_por_plan: limitePlantillas === null ? 'Ilimitado' : limitePlantillas,
        utilizables: Math.min(
          plantillasDisponibles.length,
          limitePlantillas || plantillasDisponibles.length
        ),
      },
      roles_personalizados: {
        total: rolesPersonalizados.length,
        limite: limitePersonalizados === null ? 'Ilimitado' : limitePersonalizados,
        disponibles:
          limitePersonalizados === null
            ? 'Ilimitado'
            : Math.max(0, limitePersonalizados - rolesPersonalizados.length),
        porcentaje_uso:
          limitePersonalizados === null
            ? 0
            : (rolesPersonalizados.length / limitePersonalizados) * 100,
      },
      total_roles_activos: plantillasDisponibles.length + rolesPersonalizados.length,
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message,
    });
  }
}

module.exports = {
  getRolesDisponiblesEmpresa,
  getPlantillasPorTipoEmpresa,
  crearRolDesdePlantilla,
  getAllPlantillas,
  getEstadisticasRoles,
};
