/**
 * ================================================================
 * CONSTANTES DEL SISTEMA - VALORES ENUM PERMITIDOS
 * ================================================================
 *
 * Este archivo centraliza todos los valores permitidos para campos
 * de tipo ENUM en el sistema. Usar estas constantes en validaciones
 * para mantener consistencia en toda la aplicación.
 */

/**
 * ================================================================
 * ESTADOS DE SUSCRIPCIÓN
 * ================================================================
 */
const ESTADOS_SUSCRIPCION = {
  EN_PRUEBA: 'en_prueba',
  ACTIVA: 'activa',
  EXPIRADA: 'expirada',
  CANCELADA: 'cancelada',
  SUSPENDIDA: 'suspendida',
};

const ESTADOS_SUSCRIPCION_ARRAY = Object.values(ESTADOS_SUSCRIPCION);

/**
 * ================================================================
 * ESTADOS DE USUARIO
 * ================================================================
 */
const ESTADOS_USUARIO = {
  ACTIVO: 'activo',
  INACTIVO: 'inactivo',
  SUSPENDIDO: 'suspendido',
  PENDIENTE: 'pendiente',
};

const ESTADOS_USUARIO_ARRAY = Object.values(ESTADOS_USUARIO);

/**
 * ================================================================
 * ESTADOS DE ROL
 * ================================================================
 */
const ESTADOS_ROL = {
  ACTIVO: 'activo',
  INACTIVO: 'inactivo',
};

const ESTADOS_ROL_ARRAY = Object.values(ESTADOS_ROL);

/**
 * ================================================================
 * TIPOS DE EMPRESA PREDEFINIDOS
 * ================================================================
 * Solo 3 tipos de negocio soportados en el sistema
 */
const TIPOS_EMPRESA = {
  MINIMARKET: 'Minimarket',
  FERRETERIA: 'Ferreteria',
  LICORERIA: 'Licoreria',
};

const TIPOS_EMPRESA_ARRAY = Object.values(TIPOS_EMPRESA);

/**
 * ================================================================
 * NOMBRES DE PLANES
 * ================================================================
 */
const PLANES = {
  BASICO: 'Básico',
  ESTANDAR: 'Estándar',
  PREMIUM: 'Premium',
};

const PLANES_ARRAY = Object.values(PLANES);

/**
 * ================================================================
 * ROLES PREDETERMINADOS POR TIPO DE EMPRESA
 * ================================================================
 * Roles que se crean automáticamente según el tipo de negocio
 * El rol "Administrador" siempre se crea para el dueño de la empresa
 */
const ROLES_PREDETERMINADOS = {
  // ROL UNIVERSAL (todas las empresas)
  ADMINISTRADOR: {
    nombre: 'Administrador',
    descripcion: 'Acceso total al sistema',
    permisos: {
      ventas: { crear: true, leer: true, actualizar: true, eliminar: true },
      compras: { crear: true, leer: true, actualizar: true, eliminar: true },
      inventarios: { crear: true, leer: true, actualizar: true, eliminar: true },
      usuarios: { crear: true, leer: true, actualizar: true, eliminar: true },
      reportes: { crear: true, leer: true, actualizar: true, eliminar: true },
    },
  },

  // ROLES PARA MINIMARKET
  MINIMARKET: [
    {
      nombre: 'Cajero',
      descripcion: 'Realiza ventas y cobros',
      permisos: {
        ventas: { crear: true, leer: true, actualizar: false, eliminar: false },
        compras: { crear: false, leer: false, actualizar: false, eliminar: false },
        inventarios: { crear: false, leer: true, actualizar: false, eliminar: false },
        usuarios: { crear: false, leer: false, actualizar: false, eliminar: false },
        reportes: { crear: false, leer: true, actualizar: false, eliminar: false },
      },
    },
    {
      nombre: 'Encargado de Almacén',
      descripcion: 'Gestiona inventario y compras',
      permisos: {
        ventas: { crear: false, leer: true, actualizar: false, eliminar: false },
        compras: { crear: true, leer: true, actualizar: true, eliminar: false },
        inventarios: { crear: true, leer: true, actualizar: true, eliminar: false },
        usuarios: { crear: false, leer: false, actualizar: false, eliminar: false },
        reportes: { crear: false, leer: true, actualizar: false, eliminar: false },
      },
    },
  ],

  // ROLES PARA FERRETERIA
  FERRETERIA: [
    {
      nombre: 'Vendedor',
      descripcion: 'Atiende clientes y registra ventas',
      permisos: {
        ventas: { crear: true, leer: true, actualizar: true, eliminar: false },
        compras: { crear: false, leer: false, actualizar: false, eliminar: false },
        inventarios: { crear: false, leer: true, actualizar: false, eliminar: false },
        usuarios: { crear: false, leer: false, actualizar: false, eliminar: false },
        reportes: { crear: false, leer: true, actualizar: false, eliminar: false },
      },
    },
    {
      nombre: 'Encargado de Bodega',
      descripcion: 'Administra inventario y pedidos',
      permisos: {
        ventas: { crear: false, leer: true, actualizar: false, eliminar: false },
        compras: { crear: true, leer: true, actualizar: true, eliminar: false },
        inventarios: { crear: true, leer: true, actualizar: true, eliminar: true },
        usuarios: { crear: false, leer: false, actualizar: false, eliminar: false },
        reportes: { crear: false, leer: true, actualizar: false, eliminar: false },
      },
    },
  ],

  // ROLES PARA LICORERIA
  LICORERIA: [
    {
      nombre: 'Cajero',
      descripcion: 'Realiza ventas y gestiona caja',
      permisos: {
        ventas: { crear: true, leer: true, actualizar: false, eliminar: false },
        compras: { crear: false, leer: false, actualizar: false, eliminar: false },
        inventarios: { crear: false, leer: true, actualizar: false, eliminar: false },
        usuarios: { crear: false, leer: false, actualizar: false, eliminar: false },
        reportes: { crear: false, leer: true, actualizar: false, eliminar: false },
      },
    },
    {
      nombre: 'Encargado de Inventario',
      descripcion: 'Controla stock y compras',
      permisos: {
        ventas: { crear: false, leer: true, actualizar: false, eliminar: false },
        compras: { crear: true, leer: true, actualizar: true, eliminar: false },
        inventarios: { crear: true, leer: true, actualizar: true, eliminar: false },
        usuarios: { crear: false, leer: false, actualizar: false, eliminar: false },
        reportes: { crear: false, leer: true, actualizar: false, eliminar: false },
      },
    },
  ],
};

/**
 * Helper para obtener roles por tipo de empresa
 */
const obtenerRolesPorTipoEmpresa = (tipoEmpresa) => {
  const tipo = tipoEmpresa.toUpperCase();
  const roles = [ROLES_PREDETERMINADOS.ADMINISTRADOR];

  if (ROLES_PREDETERMINADOS[tipo]) {
    roles.push(...ROLES_PREDETERMINADOS[tipo]);
  }

  return roles;
};

/**
 * ================================================================
 * MÓDULOS DISPONIBLES DEL SISTEMA
 * ================================================================
 * 5 módulos principales del ERP
 */
const MODULOS_SISTEMA = {
  VENTAS: 'ventas',
  COMPRAS: 'compras',
  INVENTARIOS: 'inventarios',
  USUARIOS: 'usuarios',
  REPORTES: 'reportes',
};

const MODULOS_SISTEMA_ARRAY = Object.values(MODULOS_SISTEMA);

/**
 * ================================================================
 * TIPOS MIME PERMITIDOS PARA UPLOADS
 * ================================================================
 */
const MIME_TYPES_IMAGENES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

/**
 * ================================================================
 * LÍMITES DE ARCHIVOS
 * ================================================================
 */
const LIMITES_ARCHIVOS = {
  LOGO_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  AVATAR_MAX_SIZE: 2 * 1024 * 1024, // 2MB
  DOCUMENTO_MAX_SIZE: 10 * 1024 * 1024, // 10MB
};

/**
 * ================================================================
 * LONGITUDES MÁXIMAS DE CAMPOS
 * ================================================================
 */
const LONGITUDES_MAXIMAS = {
  NOMBRE_EMPRESA: 150,
  NOMBRE_COMPLETO: 150,
  EMAIL: 150,
  NOMBRE_ROL: 100,
  TIPO_EMPRESA: 100,
  PASSWORD_MIN: 6,
  ZONA_HORARIA: 100,
};

/**
 * ================================================================
 * ZONA HORARIA DEL SISTEMA
 * ================================================================
 * Sistema configurado para Bolivia únicamente
 */
const ZONA_HORARIA_DEFAULT = 'America/La_Paz';

const ZONAS_HORARIAS = {
  BOLIVIA: 'America/La_Paz',
};

const ZONAS_HORARIAS_ARRAY = Object.values(ZONAS_HORARIAS);

/**
 * ================================================================
 * EXPRESIONES REGULARES
 * ================================================================
 */
const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  SOLO_LETRAS: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
  SOLO_NUMEROS: /^\d+$/,
  ALFANUMERICO: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+$/,
};

/**
 * ================================================================
 * VALIDADORES DE VALORES
 * ================================================================
 */
const validadores = {
  /**
   * Valida si un estado de suscripción es válido
   */
  isEstadoSuscripcionValido: (estado) => ESTADOS_SUSCRIPCION_ARRAY.includes(estado),

  /**
   * Valida si un estado de usuario es válido
   */
  isEstadoUsuarioValido: (estado) => ESTADOS_USUARIO_ARRAY.includes(estado),

  /**
   * Valida si un estado de rol es válido
   */
  isEstadoRolValido: (estado) => ESTADOS_ROL_ARRAY.includes(estado),

  /**
   * Valida si un tipo de empresa es válido
   */
  isTipoEmpresaValido: (tipo) => TIPOS_EMPRESA_ARRAY.includes(tipo.toLowerCase()),

  /**
   * Valida formato de email
   */
  isEmailValido: (email) => REGEX.EMAIL.test(email),

  /**
   * Valida formato UUID
   */
  isUUIDValido: (uuid) => REGEX.UUID.test(uuid),

  /**
   * Valida tipo MIME de imagen
   */
  isImagenValida: (mimetype) => MIME_TYPES_IMAGENES.includes(mimetype),

  /**
   * Valida módulo del sistema
   */
  isModuloValido: (modulo) => MODULOS_SISTEMA_ARRAY.includes(modulo),
};

/**
 * ================================================================
 * MENSAJES DE ERROR ESTÁNDAR
 * ================================================================
 */
const MENSAJES_ERROR = {
  CAMPO_REQUERIDO: (campo) => `El campo ${campo} es requerido.`,
  CAMPO_INVALIDO: (campo) => `El campo ${campo} no es válido.`,
  LONGITUD_MAXIMA: (campo, max) => `El campo ${campo} no puede exceder ${max} caracteres.`,
  VALOR_NO_PERMITIDO: (campo, valores) =>
    `Valor no permitido para ${campo}. Valores válidos: ${valores.join(', ')}`,
  EMAIL_INVALIDO: 'El formato del email no es válido.',
  PASSWORD_CORTO: (min) => `La contraseña debe tener al menos ${min} caracteres.`,
  RECURSO_NO_ENCONTRADO: (recurso) => `${recurso} no encontrado.`,
  FK_NO_EXISTE: (recurso, id) => `${recurso} con ID ${id} no encontrado.`,
  EMAIL_DUPLICADO: 'El email ya está registrado.',
  LIMITE_ALCANZADO: (recurso, limite) =>
    `Has alcanzado el límite de ${recurso} (${limite}) para tu plan.`,
  ARCHIVO_NO_PERMITIDO: (tipos) =>
    `Tipo de archivo no permitido. Solo se permiten: ${tipos.join(', ')}`,
  ARCHIVO_MUY_GRANDE: (max) => `El archivo es demasiado grande. Tamaño máximo: ${max}MB`,
};

/**
 * ================================================================
 * EXPORTACIONES
 * ================================================================
 */
module.exports = {
  // Estados
  ESTADOS_SUSCRIPCION,
  ESTADOS_SUSCRIPCION_ARRAY,
  ESTADOS_USUARIO,
  ESTADOS_USUARIO_ARRAY,
  ESTADOS_ROL,
  ESTADOS_ROL_ARRAY,

  // Tipos
  TIPOS_EMPRESA,
  TIPOS_EMPRESA_ARRAY,
  PLANES,
  PLANES_ARRAY,
  MODULOS_SISTEMA,
  MODULOS_SISTEMA_ARRAY,

  // Roles predeterminados
  ROLES_PREDETERMINADOS,
  obtenerRolesPorTipoEmpresa,

  // Archivos
  MIME_TYPES_IMAGENES,
  LIMITES_ARCHIVOS,

  // Límites
  LONGITUDES_MAXIMAS,

  // Zonas horarias
  ZONA_HORARIA_DEFAULT,
  ZONAS_HORARIAS,
  ZONAS_HORARIAS_ARRAY,

  // Regex
  REGEX,

  // Validadores
  validadores,

  // Mensajes
  MENSAJES_ERROR,
};
