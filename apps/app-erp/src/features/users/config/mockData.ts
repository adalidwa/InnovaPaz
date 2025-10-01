// Datos simulados para el módulo de usuarios

// Tipos
export interface User {
  id: number;
  nombre_completo: string;
  email: string;
  rol: string;
  empresa_id: number;
  fecha_creacion: string;
  avatar: string | null;
  estado?: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  permissions: string[];
}

export interface PlanInfo {
  name: string;
  maxUsers: number;
  currentUsers: number;
  features: string[];
}

// Usuario actual (simulado)
export const currentUser: User = {
  id: 1,
  nombre_completo: 'Edison Checa',
  email: 'edison@innovapaz.com',
  rol: 'Administrador',
  empresa_id: 1,
  fecha_creacion: '2024-01-15',
  avatar: null,
};

// Lista de usuarios del equipo
export const teamUsers: User[] = [
  {
    id: 1,
    nombre_completo: 'Edison Checa',
    email: 'edison@innovapaz.com',
    rol: 'Administrador',
    empresa_id: 1,
    fecha_creacion: '2024-01-15',
    avatar: null,
    estado: 'Activo',
  },
  {
    id: 2,
    nombre_completo: 'María González',
    email: 'maria@innovapaz.com',
    rol: 'Vendedor',
    empresa_id: 1,
    fecha_creacion: '2024-02-10',
    avatar: null,
    estado: 'Activo',
  },
  {
    id: 3,
    nombre_completo: 'Carlos López',
    email: 'carlos@innovapaz.com',
    rol: 'Encargado de Almacén',
    empresa_id: 1,
    fecha_creacion: '2024-03-05',
    avatar: null,
    estado: 'Activo',
  },
  {
    id: 4,
    nombre_completo: 'Ana Martínez',
    email: 'ana@innovapaz.com',
    rol: 'Vendedor',
    empresa_id: 1,
    fecha_creacion: '2024-03-20',
    avatar: null,
    estado: 'Pendiente',
  },
];

// Roles disponibles
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

// Información del plan actual
export const planInfo: PlanInfo = {
  name: 'Plan Profesional',
  maxUsers: 10,
  currentUsers: 4,
  features: [
    'Gestión completa de usuarios',
    'Roles y permisos personalizados',
    'Reportes avanzados',
    'Soporte prioritario',
  ],
};

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
