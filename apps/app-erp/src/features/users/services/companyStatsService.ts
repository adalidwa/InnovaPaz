/**
 * ================================================================
 * SERVICIO DE ESTADÍSTICAS DE USO DE LA EMPRESA
 * ================================================================
 *
 * Obtiene estadísticas de uso actual de la empresa:
 * - Usuarios/miembros utilizados vs límite
 * - Productos/inventario utilizado vs límite
 * - Roles utilizados vs límite
 */

const API_BASE_URL = '/api';

export interface CompanyUsageStats {
  miembros: {
    used: number;
    total: number;
    percentage: number;
  };
  productos: {
    used: number;
    total: number;
    percentage: number;
  };
  roles: {
    used: number;
    total: number;
    percentage: number;
  };
  transacciones: {
    used: number;
    total: number;
    percentage: number;
  };
  storage?: {
    used: number; // En MB
    total: number; // En MB
    percentage: number;
  };
}

export interface CompanyInfo {
  id: string;
  nombre: string;
  tipo_empresa_id: number;
  tipo_empresa_nombre: string;
  plan_id: number;
  plan_nombre: string;
  estado_suscripcion:
    | 'en_prueba'
    | 'activa'
    | 'expirada'
    | 'cancelada'
    | 'suspendida'
    | 'pendiente_pago';
  fecha_creacion: string;
}

/**
 * Obtener estadísticas de uso de miembros/usuarios
 * Utiliza el endpoint de subscription que incluye uso actual
 */
export const getMembersUsage = async (): Promise<{
  used: number;
  total: number;
  percentage: number;
}> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  try {
    // Usar el endpoint de subscription que ya incluye la información de uso
    const response = await fetch(`${API_BASE_URL}/subscriptions/info`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Error al obtener estadísticas de usuarios');
    }

    const data = await response.json();
    const usage = data.usage || {};
    const usuarios = usage.usuarios || { current: 1, limit: 2, percentage: 50 };

    return {
      used: usuarios.current,
      total: usuarios.limit,
      percentage: usuarios.percentage,
    };
  } catch (error) {
    console.error('Error en getMembersUsage:', error);
    // Datos por defecto en caso de error
    return {
      used: 1,
      total: 2,
      percentage: 50,
    };
  }
};

/**
 * Obtener estadísticas de uso de productos/inventario
 * Por ahora usa datos dummy, se puede integrar con /api/inventories/products
 */
export const getProductsUsage = async (): Promise<{
  used: number;
  total: number;
  percentage: number;
}> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  try {
    // Obtener productos actuales para contar
    const response = await fetch(`${API_BASE_URL}/inventories/products`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn('No se pudo obtener productos, usando datos dummy');
      return {
        used: 0,
        total: 150,
        percentage: 0,
      };
    }

    const data = await response.json();
    const productos = Array.isArray(data) ? data : data.productos || [];
    const used = productos.length;
    const total = 150; // Por defecto para plan Básico, se debe obtener del plan actual

    return {
      used,
      total,
      percentage: total > 0 ? (used / total) * 100 : 0,
    };
  } catch (error) {
    console.error('Error en getProductsUsage:', error);
    return {
      used: 0,
      total: 150,
      percentage: 0,
    };
  }
};

/**
 * Obtener estadísticas de uso de roles
 * Usa el endpoint que existe: /api/roles/company/:empresa_id/stats
 */
export const getRolesUsage = async (
  empresaId?: string
): Promise<{ used: number; total: number; percentage: number }> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  try {
    // Si no se proporciona empresaId, obtenerlo del contexto del usuario
    if (!empresaId) {
      // Por ahora usaremos datos dummy, idealmente se obtendría del contexto de auth
      return {
        used: 0,
        total: 2,
        percentage: 0,
      };
    }

    const response = await fetch(`${API_BASE_URL}/roles/company/${empresaId}/stats`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn('Error al obtener roles stats:', errorData);
      return {
        used: 0,
        total: 2,
        percentage: 0,
      };
    }

    const data = await response.json();
    return {
      used: data.rolesPersonalizados || 0,
      total: data.limite || 2,
      percentage: data.porcentaje || 0,
    };
  } catch (error) {
    console.error('Error en getRolesUsage:', error);
    return {
      used: 0,
      total: 2,
      percentage: 0,
    };
  }
};

/**
 * Obtener información completa de la empresa
 * Utiliza el endpoint de subscription que ya incluye información de la empresa
 */
export const getCompanyInfo = async (): Promise<CompanyInfo> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  try {
    // Usar el endpoint de subscription que ya incluye información de empresa y plan
    const response = await fetch(`${API_BASE_URL}/subscriptions/info`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Error al obtener información de la empresa');
    }

    const data = await response.json();
    const subscription = data.subscription || {};
    const plan = subscription.plan || {};

    return {
      id: '1', // Dummy ID, se debería obtener del token o contexto
      nombre: 'Empresa Ejemplo',
      tipo_empresa_id: 2, // Dummy, se debería obtener de la respuesta
      tipo_empresa_nombre: 'Estándar',
      plan_id: 2,
      plan_nombre: plan.nombre || 'Plan Básico',
      estado_suscripcion: subscription.suscripcion?.estado || 'activa',
      fecha_creacion: subscription.fechas?.creacion || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error en getCompanyInfo:', error);
    // Datos por defecto en caso de error
    return {
      id: '1',
      nombre: 'Empresa Ejemplo',
      tipo_empresa_id: 2,
      tipo_empresa_nombre: 'Estándar',
      plan_id: 2,
      plan_nombre: 'Plan Básico',
      estado_suscripcion: 'activa',
      fecha_creacion: new Date().toISOString(),
    };
  }
};

/**
 * Obtener todas las estadísticas de uso de la empresa
 * Integra con el servicio de subscription que ya incluye los datos de uso
 */
export const getCompanyUsageStats = async (): Promise<CompanyUsageStats> => {
  try {
    const [miembros, productos, roles] = await Promise.all([
      getMembersUsage(),
      getProductsUsage(),
      getRolesUsage(),
    ]);

    return {
      miembros,
      productos,
      roles,
      transacciones: { used: 0, total: 250, percentage: 0 }, // Por implementar endpoint específico
    };
  } catch (error) {
    console.error('Error al obtener estadísticas de uso:', error);
    // Devolver datos por defecto en caso de error
    return {
      miembros: { used: 1, total: 2, percentage: 50 },
      productos: { used: 0, total: 150, percentage: 0 },
      roles: { used: 0, total: 2, percentage: 0 },
      transacciones: { used: 0, total: 250, percentage: 0 },
    };
  }
};

/**
 * Procesar estadísticas desde los datos de subscription
 * Este método es más eficiente ya que usa datos que ya se obtienen
 */
export const getStatsFromSubscription = (subscriptionData: any): CompanyUsageStats => {
  const usage = subscriptionData.usage || {};
  const plan = subscriptionData.plan || {};
  const limites = plan.limites || {};
  const empresa = subscriptionData.empresa || {};

  // Datos de usuarios del middleware
  const usuarios = usage.usuarios || { current: 1, limit: 2, percentage: 50 };

  // Productos - usar datos reales del backend si están disponibles
  const productosLimit = limites.productos || 150;
  const productosUsage = usage.productos || {};

  const productos = {
    used: productosUsage.current || 0,
    total: productosLimit,
    percentage: productosUsage.percentage || 0,
  };

  // Roles - usar datos reales del backend si están disponibles
  const rolesLimit = limites.roles || 2;
  const rolesUsage = usage.roles || {};

  const roles = {
    used: rolesUsage.current || 0,
    total: rolesLimit,
    percentage: rolesUsage.percentage || 0,
  };

  // Si no hay datos de uso de productos, intentar obtenerlos asíncronamente
  if (!productosUsage.current && empresa.empresa_id) {
    // Esta llamada asíncrona actualizará el estado cuando se complete
    updateProductosUsageAsync(empresa.empresa_id, limites.productos);
  }

  // Si no hay datos de uso de roles, intentar obtenerlos asíncronamente
  if (!rolesUsage.current && empresa.empresa_id) {
    // Esta llamada asíncrona actualizará el estado cuando se complete
    updateRolesUsageAsync(empresa.empresa_id, limites.roles);
  }

  // Transacciones - usar datos reales del backend si están disponibles
  const transaccionesLimit = limites.transacciones || 250;
  const transaccionesUsage = usage.transacciones || {};

  const transacciones = {
    used: transaccionesUsage.current || 0,
    total: transaccionesLimit,
    percentage: transaccionesUsage.percentage || 0,
  };

  // Si no hay datos de uso de transacciones, intentar obtenerlos asíncronamente
  if (!transaccionesUsage.current && empresa.empresa_id) {
    // Esta llamada asíncrona actualizará el estado cuando se complete
    updateTransaccionesUsageAsync(empresa.empresa_id, limites.transacciones);
  }

  return {
    miembros: {
      used: usuarios.current,
      total: usuarios.limit === -1 ? 999 : usuarios.limit,
      percentage: usuarios.percentage,
    },
    productos: {
      used: productos.used,
      total: productos.total === -1 ? 999 : productos.total,
      percentage: productos.percentage,
    },
    roles: {
      used: roles.used,
      total: roles.total === -1 ? 999 : roles.total,
      percentage: roles.percentage,
    },
    transacciones: {
      used: transacciones.used,
      total: transacciones.total === -1 ? 999 : transacciones.total,
      percentage: transacciones.percentage,
    },
  };
};

/**
 * Actualización asíncrona de uso de productos (no bloquea la UI)
 */
const updateProductosUsageAsync = async (_empresaId: string, limite: number) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;

    const response = await fetch(`${API_BASE_URL}/inventories/products`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      const productos = Array.isArray(data) ? data : data.productos || [];
      const used = productos.length;
      const percentage = limite > 0 ? (used / limite) * 100 : 0;

      // Emitir evento para actualizar la UI con datos reales
      window.dispatchEvent(
        new CustomEvent('productosStatsUpdated', {
          detail: {
            used: used,
            total: limite === -1 ? 999 : limite,
            percentage: percentage,
          },
        })
      );
    }
  } catch (error) {
    console.warn('No se pudieron obtener estadísticas de productos en tiempo real:', error);
  }
};

/**
 * Actualización asíncrona de uso de transacciones/ventas (no bloquea la UI)
 */
const updateTransaccionesUsageAsync = async (_empresaId: string, limite: number) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;

    const response = await fetch(`${API_BASE_URL}/sales`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      const ventas = Array.isArray(data) ? data : data.ventas || [];
      const used = ventas.length;
      const percentage = limite > 0 ? (used / limite) * 100 : 0;

      // Emitir evento para actualizar la UI con datos reales
      window.dispatchEvent(
        new CustomEvent('transaccionesStatsUpdated', {
          detail: {
            used: used,
            total: limite === -1 ? 999 : limite,
            percentage: percentage,
          },
        })
      );
    }
  } catch (error) {
    console.warn('No se pudieron obtener estadísticas de transacciones en tiempo real:', error);
  }
};

/**
 * Actualización asíncrona de uso de roles (no bloquea la UI)
 */
const updateRolesUsageAsync = async (empresaId: string, limite: number) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;

    const response = await fetch(`${API_BASE_URL}/roles/company/${empresaId}/stats`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      // Emitir evento para actualizar la UI con datos reales
      window.dispatchEvent(
        new CustomEvent('rolesStatsUpdated', {
          detail: {
            used: data.roles_personalizados || 0,
            total: limite === -1 ? 999 : limite,
            percentage: data.porcentaje_uso || 0,
          },
        })
      );
    }
  } catch (error) {
    console.warn('No se pudieron obtener estadísticas de roles en tiempo real:', error);
  }
};

/**
 * Helpers para formatear los datos
 */
export const companyStatsHelpers = {
  /**
   * Formatea el porcentaje de uso
   */
  formatPercentage: (percentage: number): string => {
    return `${Math.round(percentage)}%`;
  },

  /**
   * Determina el color del indicador según el porcentaje
   */
  getUsageColor: (percentage: number): string => {
    if (percentage >= 90) return '#ef4444'; // rojo
    if (percentage >= 75) return '#f59e0b'; // amarillo
    if (percentage >= 50) return '#3b82f6'; // azul
    return '#10b981'; // verde
  },

  /**
   * Determina si el uso está cerca del límite
   */
  isNearLimit: (used: number, total: number): boolean => {
    return used / total >= 0.8;
  },

  /**
   * Formatea el texto de uso
   */
  formatUsageText: (used: number, total: number, label: string): string => {
    if (total === -1 || total === 999) {
      return `${used} ${label} (Ilimitado)`;
    }
    return `${used} de ${total} ${label}`;
  },

  /**
   * Determina si el plan es ilimitado para un recurso
   */
  isUnlimited: (total: number): boolean => {
    return total === -1 || total === 999;
  },
};
