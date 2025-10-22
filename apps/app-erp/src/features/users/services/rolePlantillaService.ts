import { buildApiUrl, getAuthHeaders } from '../../../config/api';

/**
 * Servicio para gestionar plantillas de roles y el nuevo sistema
 * Endpoints del nuevo sistema de plantillas:
 * - GET /api/roles-plantilla/empresa/:empresa_id/disponibles - Obtener todos los roles disponibles
 * - GET /api/roles-plantilla/empresa/:empresa_id/plantillas - Obtener solo plantillas por tipo
 * - POST /api/roles-plantilla/empresa/:empresa_id/crear-desde-plantilla - Crear rol desde plantilla
 * - GET /api/roles-plantilla/empresa/:empresa_id/estadisticas - Estadísticas del sistema
 * - GET /api/roles-plantilla/todas - Obtener todas las plantillas (admin)
 */

export interface RolPlantilla {
  plantilla_id: number;
  nombre_rol: string;
  descripcion: string;
  permisos: Record<string, any>;
  orden: number;
  disponible: boolean;
  tipo_empresa?: string;
}

export interface RolDisponible {
  id: number;
  tipo: 'plantilla' | 'personalizado';
  nombre: string;
  descripcion: string;
  permisos: Record<string, any>;
  puede_usar: boolean;
  orden?: number;
}

export interface RolesDisponiblesResponse {
  empresa_id: string;
  plan: string;
  limite_plantillas: number;
  plantillas: RolDisponible[];
  personalizados: RolDisponible[];
  resumen: {
    total_plantillas: number;
    plantillas_disponibles: number;
    total_personalizados: number;
  };
}

export interface EstadisticasRoles {
  empresa: {
    id: string;
    nombre: string;
    tipo: string;
    plan: string;
  };
  plantillas: {
    total_disponibles: number;
    permitidas_por_plan: number | string;
    utilizables: number;
  };
  roles_personalizados: {
    total: number;
    limite: number | string;
    disponibles: number | string;
    porcentaje_uso: number;
  };
  total_roles_activos: number;
}

export interface PlantillasResponse {
  tipo_empresa: string;
  limite_plan: number;
  plantillas: RolPlantilla[];
}

/**
 * Obtener todos los roles disponibles para una empresa (plantillas + personalizados)
 */
export const getRolesDisponiblesEmpresa = async (
  empresaId: string,
  token: string
): Promise<RolesDisponiblesResponse> => {
  const url = buildApiUrl(`roles-plantilla/empresa/${empresaId}/disponibles`);
  const res = await fetch(url, {
    headers: getAuthHeaders(token),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Error al obtener roles disponibles');
  }

  return await res.json();
};

/**
 * Obtener solo las plantillas de roles según el tipo de empresa
 */
export const getPlantillasPorTipoEmpresa = async (
  empresaId: string,
  token: string
): Promise<PlantillasResponse> => {
  const url = buildApiUrl(`roles-plantilla/empresa/${empresaId}/plantillas`);
  const res = await fetch(url, {
    headers: getAuthHeaders(token),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Error al obtener plantillas');
  }

  return await res.json();
};

/**
 * Crear rol personalizado desde una plantilla (con plantilla_id_origen)
 */
export const crearRolDesdePlantilla = async (
  empresaId: string,
  plantillaId: number,
  token: string,
  nombrePersonalizado?: string,
  permisosPersonalizados?: Record<string, any>
): Promise<any> => {
  const url = buildApiUrl(`roles-plantilla/empresa/${empresaId}/crear-desde-plantilla`);
  const res = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({
      plantilla_id: plantillaId,
      nombre_personalizado: nombrePersonalizado,
      permisos_personalizados: permisosPersonalizados,
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Error al crear rol desde plantilla');
  }

  return await res.json();
};

/**
 * Crear rol completamente nuevo (sin plantilla)
 */
export const crearRolNuevo = async (
  empresaId: string,
  nombre: string,
  descripcion: string,
  permisos: Record<string, any>,
  token: string
): Promise<any> => {
  const url = buildApiUrl('roles');
  const res = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({
      empresa_id: empresaId,
      nombre_rol: nombre,
      descripcion,
      permisos,
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Error al crear rol nuevo');
  }

  return await res.json();
};

/**
 * Obtener roles de la empresa
 */
export const getRolesEmpresa = async (empresaId: string, token: string): Promise<any> => {
  const url = buildApiUrl(`roles/company/${empresaId}`);
  const res = await fetch(url, {
    headers: getAuthHeaders(token),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Error al obtener roles de la empresa');
  }

  return await res.json();
};

/**
 * Obtener estadísticas de uso de roles para una empresa
 */
export const getEstadisticasRolesEmpresa = async (
  empresaId: string,
  token: string
): Promise<EstadisticasRoles> => {
  const url = buildApiUrl(`roles-plantilla/empresa/${empresaId}/estadisticas`);
  const res = await fetch(url, {
    headers: getAuthHeaders(token),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Error al obtener estadísticas');
  }

  return await res.json();
};

/**
 * Obtener todas las plantillas del sistema (solo admin)
 */
export const getAllPlantillas = async (token: string): Promise<any> => {
  const url = buildApiUrl('roles-plantilla/todas');
  const res = await fetch(url, {
    headers: getAuthHeaders(token),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Error al obtener todas las plantillas');
  }

  return await res.json();
};

/**
 * Utilidad para formatear permisos para mostrar en UI
 */
export const formatearPermisos = (permisos: Record<string, any>): string[] => {
  const permisosFormateados: string[] = [];

  Object.entries(permisos).forEach(([modulo, acciones]) => {
    if (typeof acciones === 'object') {
      Object.entries(acciones as Record<string, boolean>).forEach(([accion, permitido]) => {
        if (permitido) {
          permisosFormateados.push(`${modulo}:${accion}`);
        }
      });
    }
  });

  return permisosFormateados;
};

/**
 * Utilidad para obtener descripción de permisos legible
 */
export const getDescripcionPermisos = (permisos: Record<string, any>): string => {
  const modulos = Object.keys(permisos);
  const totalAcciones = Object.values(permisos).reduce((total, acciones) => {
    if (typeof acciones === 'object') {
      return total + Object.values(acciones as Record<string, boolean>).filter(Boolean).length;
    }
    return total;
  }, 0);

  return `${modulos.length} módulos, ${totalAcciones} permisos`;
};

/**
 * Verificar si un rol tiene un permiso específico
 */
export const tienePermiso = (
  permisos: Record<string, any>,
  modulo: string,
  accion: string
): boolean => {
  return permisos?.[modulo]?.[accion] === true;
};
