// Datos simulados para el módulo de usuarios

// Tipos actualizados con estructura real de Firebase
export interface User {
  id: string;
  nombre_completo: string;
  email: string;
  rol: string;
  empresa_id: string;
  created_at: Date | string;
  updated_at: Date | string;
  setup_completed: boolean;
  avatar?: string | null;
  estado?: string;
}

export interface Company {
  id: string;
  nombre: string;
  owner_uid: string;
  plan_id: string;
  tipo_negocio: string;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  permissions: string[];
}

export interface PlanInfo {
  id: string;
  name: string;
  maxUsers: number;
  currentUsers: number;
  features: string[];
  price?: number;
}

// Datos reales del usuario actual (se llenarán desde Firebase)
// Inicializados con datos temporales para desarrollo
export let currentUser: User | null = {
  id: 'temp-user-id',
  nombre_completo: 'Usuario de Prueba',
  email: 'usuario@test.com',
  rol: 'administrador',
  empresa_id: 'temp-company-id',
  created_at: new Date(),
  updated_at: new Date(),
  setup_completed: true,
  avatar: null,
  estado: 'activo',
};

export let currentCompany: Company | null = {
  id: 'temp-company-id',
  nombre: 'Empresa de Prueba',
  owner_uid: 'temp-user-id',
  plan_id: 'basico',
  tipo_negocio: 'ferreteria',
  created_at: new Date(),
  updated_at: new Date(),
};

// Función para actualizar datos reales
export const setCurrentUser = (user: User) => {
  currentUser = user;
};

export const setCurrentCompany = (company: Company) => {
  currentCompany = company;
};

// Roles disponibles (configuración estática)
export const availableRoles: Role[] = [
  {
    id: 'administrador',
    name: 'Administrador',
    description: 'Acceso completo al sistema',
    color: 'blue',
    permissions: ['all'],
  },
  {
    id: 'vendedor',
    name: 'Vendedor',
    description: 'Gestión de ventas y clientes',
    color: 'green',
    permissions: ['sales', 'customers'],
  },
  {
    id: 'encargado_almacen',
    name: 'Encargado de Almacén',
    description: 'Gestión de inventario y productos',
    color: 'orange',
    permissions: ['inventory', 'products'],
  },
  {
    id: 'contador',
    name: 'Contador',
    description: 'Gestión financiera y reportes',
    color: 'purple',
    permissions: ['reports', 'finances'],
  },
];

// Información de planes disponibles
export const availablePlans: Record<string, PlanInfo> = {
  basico: {
    id: 'basico',
    name: 'Plan Básico',
    maxUsers: 3,
    currentUsers: 0,
    features: ['Gestión básica de usuarios', 'Reportes básicos', 'Soporte estándar'],
    price: 29,
  },
  profesional: {
    id: 'profesional',
    name: 'Plan Profesional',
    maxUsers: 10,
    currentUsers: 0,
    features: [
      'Gestión completa de usuarios',
      'Roles y permisos personalizados',
      'Reportes avanzados',
      'Soporte prioritario',
    ],
    price: 79,
  },
  empresarial: {
    id: 'empresarial',
    name: 'Plan Empresarial',
    maxUsers: 50,
    currentUsers: 0,
    features: [
      'Gestión ilimitada de usuarios',
      'Roles y permisos avanzados',
      'Reportes personalizados',
      'Soporte 24/7',
      'API completa',
    ],
    price: 199,
  },
};

// Si necesitas un export planInfo por compatibilidad, puedes exportar uno por defecto:
export const planInfo = availablePlans['basico'];

// Tipos de negocio disponibles
export const tiposNegocio = {
  restaurante: 'Restaurante',
  licoreria: 'Licorería',
  tienda: 'Tienda',
  farmacia: 'Farmacia',
  supermercado: 'Supermercado',
  ferreteria: 'Ferretería',
  otros: 'Otros',
} as const;

// Estados de invitación
export const invitationStates = {
  PENDING: 'Pendiente',
  ACCEPTED: 'Aceptada',
  EXPIRED: 'Expirada',
  CANCELLED: 'Cancelada',
} as const;

// Configuración de notificaciones
export const notificationConfig = {
  success: {
    duration: 3000,
    position: 'top-right',
  },
  error: {
    duration: 5000,
    position: 'top-right',
  },
  warning: {
    duration: 4000,
    position: 'top-right',
  },
} as const;

// Función para obtener información del plan actual
export const getCurrentPlanInfo = (planId: string, currentUsers: number): PlanInfo => {
  const plan = availablePlans[planId];
  if (plan) {
    return {
      ...plan,
      currentUsers,
    };
  }

  // Plan por defecto si no se encuentra
  return {
    id: 'basico',
    name: 'Plan Básico',
    maxUsers: 3,
    currentUsers,
    features: ['Gestión básica de usuarios'],
    price: 29,
  };
};
