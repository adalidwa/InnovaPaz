/**
 * Servicio para gestionar roles con los nuevos endpoints del backend
 * - GET /api/roles/company/:empresa_id - Obtener roles de la empresa
 * - POST /api/roles - Crear rol personalizado
 * - PUT /api/roles/:rol_id - Actualizar rol
 * - DELETE /api/roles/:rol_id - Eliminar rol (no permite predeterminados)
 * - GET /api/roles/company/:empresa_id/administrador - Obtener ID de Administrador
 * - GET /api/roles/company/:empresa_id/stats - Estadísticas de uso
 */

import { buildApiUrl, getAuthHeaders } from '../../../config/api';

export interface Rol {
  rol_id: string;
  nombre_rol: string;
  permisos: string[] | Record<string, any>;
  es_predeterminado: boolean;
  empresa_id: string;
  descripcion?: string;
  plantilla_id_origen?: number;
}

export interface RolStats {
  total_roles: number;
  roles_predeterminados: number;
  roles_personalizados: number;
  limite_roles: number;
  puede_crear_mas: boolean;
}

/**
 * Obtener todos los roles de una empresa
 */
export const getRolesByEmpresa = async (empresaId: string, token: string): Promise<Rol[]> => {
  const url = buildApiUrl(`roles/company/${empresaId}`);
  const res = await fetch(url, {
    headers: getAuthHeaders(token),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Error al obtener roles');
  }

  const data = await res.json();
  // Backend puede devolver directamente un array o un objeto { roles: [] }
  if (Array.isArray(data)) return data as Rol[];
  if (data && Array.isArray(data.roles)) return data.roles as Rol[];
  return [];
};

/**
 * Crear un nuevo rol personalizado
 */
export const createRol = async (
  empresaId: string,
  nombreRol: string,
  permisos: string[],
  token: string,
  descripcion?: string
): Promise<Rol> => {
  const url = buildApiUrl('roles');
  const res = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({
      empresa_id: empresaId,
      nombre_rol: nombreRol,
      permisos,
      descripcion,
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Error al crear rol');
  }

  const data = await res.json();
  return data.rol;
};

/**
 * Actualizar un rol existente
 */
export const updateRol = async (
  rolId: string,
  nombreRol: string,
  permisos: string[],
  token: string,
  descripcion?: string
): Promise<Rol> => {
  const url = buildApiUrl(`roles/${rolId}`);
  const res = await fetch(url, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify({
      nombre_rol: nombreRol,
      permisos,
      descripcion,
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Error al actualizar rol');
  }

  const data = await res.json();
  return data.rol;
};

/**
 * Eliminar un rol (solo roles personalizados)
 */
export const deleteRol = async (rolId: string, token: string): Promise<void> => {
  const url = buildApiUrl(`roles/${rolId}`);
  const res = await fetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Error al eliminar rol');
  }
};

/**
 * Obtener el ID del rol Administrador de la empresa
 */
export const getAdministradorRolId = async (empresaId: string, token: string): Promise<string> => {
  const url = buildApiUrl(`roles/company/${empresaId}/administrador`);
  const res = await fetch(url, {
    headers: getAuthHeaders(token),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Error al obtener rol Administrador');
  }

  const data = await res.json();
  return data.rol_id;
};

/**
 * Obtener estadísticas de uso de roles
 */
export const getRolesStats = async (empresaId: string, token: string): Promise<RolStats> => {
  const url = buildApiUrl(`roles/company/${empresaId}/stats`);
  const res = await fetch(url, {
    headers: getAuthHeaders(token),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Error al obtener estadísticas');
  }

  return await res.json();
};
