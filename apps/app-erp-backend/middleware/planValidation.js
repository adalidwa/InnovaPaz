const Company = require('../models/company.model');
const Plan = require('../models/plan.model');
const User = require('../models/user.model');

/**
 * Middleware para verificar límites del plan de la empresa
 */
function checkPlanLimits(requiredPermission = null) {
  return async (req, res, next) => {
    try {
      // Obtener empresa_id del usuario autenticado
      let empresaId = req.user?.empresa_id;

      // Si no está en req.user, intentar obtenerlo de los parámetros
      if (!empresaId) {
        empresaId = req.params.empresa_id || req.body.empresa_id;
      }

      if (!empresaId) {
        return res.status(400).json({
          error: 'No se pudo determinar la empresa del usuario',
          code: 'EMPRESA_REQUIRED',
        });
      }

      // Obtener información de la empresa
      const empresa = await Company.findById(empresaId);
      if (!empresa) {
        return res.status(404).json({
          error: 'Empresa no encontrada',
          code: 'EMPRESA_NOT_FOUND',
        });
      }

      // Verificar estado de suscripción
      const subscriptionStatus = await checkSubscriptionStatus(empresa);
      if (!subscriptionStatus.isActive) {
        return res.status(403).json({
          error: 'Suscripción inactiva o expirada',
          code: 'SUBSCRIPTION_INACTIVE',
          details: subscriptionStatus,
        });
      }

      // Obtener información del plan
      const plan = await Plan.findById(empresa.plan_id);
      if (!plan) {
        return res.status(404).json({
          error: 'Plan no encontrado',
          code: 'PLAN_NOT_FOUND',
        });
      }

      // Verificar permiso específico si se requiere
      if (requiredPermission) {
        const hasPermission = await checkSpecificPermission(plan, requiredPermission, empresaId);
        if (!hasPermission.allowed) {
          return res.status(403).json({
            error: `Acceso denegado: ${hasPermission.reason}`,
            code: 'PERMISSION_DENIED',
            required: requiredPermission,
            currentPlan: plan.nombre_plan,
          });
        }
      }

      // Agregar información del plan al request para uso posterior
      req.planInfo = {
        plan,
        empresa,
        subscriptionStatus,
        limits: plan.limites,
      };

      next();
    } catch (error) {
      console.error('Error en checkPlanLimits:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR',
      });
    }
  };
}

/**
 * Verificar estado de suscripción de la empresa
 */
async function checkSubscriptionStatus(empresa) {
  const now = new Date();

  // Si está en prueba, verificar si no ha expirado
  if (empresa.estado_suscripcion === 'en_prueba') {
    if (empresa.fecha_fin_prueba && now > new Date(empresa.fecha_fin_prueba)) {
      // Actualizar estado a expirado
      await Company.findByIdAndUpdate(empresa.empresa_id, {
        estado_suscripcion: 'expirada',
      });
      return {
        isActive: false,
        status: 'expirada',
        message: 'El período de prueba ha expirado',
        expiredDate: empresa.fecha_fin_prueba,
      };
    }
    return {
      isActive: true,
      status: 'en_prueba',
      message: 'En período de prueba',
      expiresAt: empresa.fecha_fin_prueba,
    };
  }

  // Si está activa, verificar si no ha expirado el período actual
  if (empresa.estado_suscripcion === 'activa') {
    if (empresa.fecha_fin_periodo_actual && now > new Date(empresa.fecha_fin_periodo_actual)) {
      // Actualizar estado a expirado
      await Company.findByIdAndUpdate(empresa.empresa_id, {
        estado_suscripcion: 'expirada',
      });
      return {
        isActive: false,
        status: 'expirada',
        message: 'La suscripción ha expirado',
        expiredDate: empresa.fecha_fin_periodo_actual,
      };
    }
    return {
      isActive: true,
      status: 'activa',
      message: 'Suscripción activa',
      expiresAt: empresa.fecha_fin_periodo_actual,
    };
  }

  // Estados inactivos
  return {
    isActive: false,
    status: empresa.estado_suscripcion,
    message: 'Suscripción inactiva',
  };
}

/**
 * Verificar permiso específico según el plan
 */
async function checkSpecificPermission(plan, permission, empresaId) {
  const limits = plan.limites;

  switch (permission) {
    case 'create_user':
      const currentUsers = await User.count({ empresa_id: empresaId });
      const maxUsuarios = limits.miembros || 2;

      // Si el plan es ilimitado (Premium: miembros = null), permitir
      if (maxUsuarios === null || maxUsuarios === -1) {
        break;
      }

      if (currentUsers >= maxUsuarios) {
        return {
          allowed: false,
          reason: `Has alcanzado el límite de usuarios (${maxUsuarios}) para tu plan ${plan.nombre_plan}`,
          current: currentUsers,
          limit: maxUsuarios,
        };
      }
      break;

    case 'create_role':
      const Role = require('../models/role.model');
      // ⚠️ IMPORTANTE: Solo contar roles PERSONALIZADOS (es_predeterminado = false)
      // Los roles predeterminados NO consumen el límite del plan
      const currentRolesPersonalizados = await Role.count({
        empresa_id: empresaId,
        es_predeterminado: false,
      });
      const maxRolesPersonalizados = limits.roles || 2;

      // Si el plan es ilimitado (Premium: roles = null), permitir
      if (maxRolesPersonalizados === null || maxRolesPersonalizados === -1) {
        break;
      }

      if (currentRolesPersonalizados >= maxRolesPersonalizados) {
        return {
          allowed: false,
          reason: `Has alcanzado el límite de roles personalizados (${maxRolesPersonalizados}) para tu plan ${plan.nombre_plan}`,
          current: currentRolesPersonalizados,
          limit: maxRolesPersonalizados,
          note: 'Los roles predeterminados no cuentan para este límite',
        };
      }
      break;

    case 'access_module':
      const module = permission.split(':')[1]; // ej: "access_module:reportes"
      if (module && limits.modulos && !limits.modulos.includes(module)) {
        return {
          allowed: false,
          reason: `El módulo ${module} no está disponible en tu plan ${plan.nombre_plan}`,
          availableModules: limits.modulos,
        };
      }
      break;

    case 'advanced_reports':
      if (!limits.features?.reportes_avanzados) {
        return {
          allowed: false,
          reason: `Los reportes avanzados no están disponibles en tu plan ${plan.nombre_plan}`,
        };
      }
      break;

    case 'api_integrations':
      if (!limits.features?.api_integraciones) {
        return {
          allowed: false,
          reason: `Las integraciones API no están disponibles en tu plan ${plan.nombre_plan}`,
        };
      }
      break;

    case 'export_data':
      if (!limits.features?.exportacion) {
        return {
          allowed: false,
          reason: `La exportación de datos no está disponible en tu plan ${plan.nombre_plan}`,
        };
      }
      break;

    default:
      // Si no hay permiso específico definido, permitir acceso
      break;
  }

  return { allowed: true };
}

/**
 * Middleware específico para verificar acceso a módulos
 */
function checkModuleAccess(moduleName) {
  return checkPlanLimits(`access_module:${moduleName}`);
}

/**
 * Obtener información de uso actual de la empresa
 */
async function getUsageInfo(empresaId) {
  try {
    console.log('📊 getUsageInfo - Obteniendo datos de uso para empresa:', empresaId);

    // Obtener usuarios y empresa
    const [usuarios, empresa] = await Promise.all([
      User.find({ empresa_id: empresaId }),
      Company.findById(empresaId),
    ]);

    if (!empresa) {
      throw new Error('Empresa no encontrada');
    }

    console.log('👥 Usuarios encontrados:', usuarios.length);
    console.log('🏢 Empresa encontrada:', {
      empresa_id: empresa.empresa_id,
      nombre: empresa.nombre,
      plan_id: empresa.plan_id,
    });

    // Obtener el plan
    const plan = await Plan.findById(empresa.plan_id);
    if (!plan) {
      throw new Error('Plan no encontrado');
    }

    console.log('💼 Plan encontrado para uso:', {
      plan_id: plan.plan_id,
      nombre_plan: plan.nombre_plan,
      precio_mensual: plan.precio_mensual,
      limites: plan.limites,
    });

    const limits = plan.limites || {};

    // Obtener información de roles
    let rolesUsage = { current: 0, limit: 2, percentage: 0 };
    try {
      const Role = require('../models/role.model');
      const totalRoles = await Role.count({ empresa_id: empresaId });
      const rolesPersonalizados = await Role.count({
        empresa_id: empresaId,
        es_predeterminado: false,
      });

      // Usar el límite del plan para roles personalizados
      const rolesLimit = limits.roles || 2;
      const isUnlimited = rolesLimit === -1 || rolesLimit === null;

      rolesUsage = {
        current: rolesPersonalizados,
        limit: isUnlimited ? -1 : rolesLimit,
        percentage: isUnlimited ? 0 : (rolesPersonalizados / rolesLimit) * 100,
        total_roles: totalRoles,
        roles_predeterminados: totalRoles - rolesPersonalizados,
      };

      console.log('🎭 Roles encontrados:', rolesUsage);
    } catch (roleError) {
      console.warn('⚠️ No se pudo obtener información de roles:', roleError.message);
    }

    const usageData = {
      usuarios: {
        current: usuarios.length,
        limit: limits.miembros || 2,
        percentage: limits.miembros === -1 ? 0 : (usuarios.length / (limits.miembros || 2)) * 100,
      },
      roles: rolesUsage,
      plan: {
        nombre: plan.nombre_plan,
        precio: plan.precio_mensual,
        features: limits.features || {},
        modulos: limits.modulos || [],
        soporte: limits.soporte || {},
      },
      subscription: await checkSubscriptionStatus(empresa),
    };

    console.log('📤 Datos de uso finales:', JSON.stringify(usageData, null, 2));

    return usageData;
  } catch (error) {
    console.error('❌ Error getting usage info:', error);
    // Retornar datos por defecto en caso de error
    return {
      usuarios: { current: 1, limit: 2, percentage: 50 },
      roles: { current: 0, limit: 2, percentage: 0 },
      plan: {
        nombre: 'Plan Básico',
        precio: 10,
        features: {},
        modulos: [],
        soporte: {},
      },
      subscription: { isActive: false, status: 'error', message: 'Error al obtener información' },
    };
  }
}

module.exports = {
  checkPlanLimits,
  checkModuleAccess,
  checkSubscriptionStatus,
  getUsageInfo,
};
