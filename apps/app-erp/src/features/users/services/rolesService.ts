/**
 * Servicio para gestionar roles con los nuevos endpoints del backend
 * - GET /api/roles/company/:empresa_id - Obtener roles de la empresa
 * - POST /api/roles - Crear rol personalizado
 * - PUT /api/roles/:rol_id - Actualizar rol
 * - DELETE /api/roles/:rol_id - Eliminar rol (no permite predeterminados)
 * - GET /api/roles/company/:empresa_id/administrador - Obtener ID de Administrador
 * - GET /api/roles/company/:empresa_id/stats - Estadísticas de uso
 */

export interface Rol {
  rol_id: string;
  nombre_rol: string;
  permisos: string[];
  es_predeterminado: boolean;
  empresa_id: string;
  descripcion?: string;
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
  const res = await fetch(`/api/roles/company/${empresaId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Error al obtener roles');
  }

  const data = await res.json();
  return data.roles || [];
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
  const res = await fetch('/api/roles', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
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
  const res = await fetch(`/api/roles/${rolId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
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
  const res = await fetch(`/api/roles/${rolId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
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
  const res = await fetch(`/api/roles/company/${empresaId}/administrador`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
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
  const res = await fetch(`/api/roles/company/${empresaId}/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Error al obtener estadísticas');
  }

  return await res.json();
};
