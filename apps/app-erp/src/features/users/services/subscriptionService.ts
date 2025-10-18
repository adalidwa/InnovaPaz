/**
 * ================================================================
 * SERVICIO DE SUSCRIPCIONES
 * ================================================================
 *
 * Maneja todas las operaciones relacionadas con suscripciones:
 * - Obtener información de suscripción
 * - Procesar pagos
 * - Renovar suscripción
 * - Cancelar suscripción
 * - Cambiar plan
 */

// API base para subscriptions - apunta al backend en puerto 4000
const API_BASE = 'http://localhost:4000/api/subscriptions';

export interface SubscriptionInfo {
  plan: {
    nombre: string;
    precio: number;
    limites: {
      miembros: number | null;
      roles: number | null;
      productos: number | null;
      modulos?: string[];
      dias_prueba?: number;
      features?: {
        reportes_avanzados?: boolean;
        exportacion?: boolean;
        api_integraciones?: boolean;
        soporte_24_7?: boolean;
      };
      soporte?: {
        tipo?: string;
        tiempo_respuesta?: string;
      };
    };
  };
  suscripcion: {
    estado: 'en_prueba' | 'activa' | 'expirada' | 'cancelada' | 'suspendida';
    fechaExpiracion: string | null;
    diasRestantes: number;
    enPeriodoPrueba: boolean;
    activa: boolean;
  };
  fechas: {
    creacion: string;
    finPrueba: string | null;
    finPeriodoActual: string | null;
  };
  // Datos de uso del middleware planValidation
  usage?: {
    usuarios: {
      current: number;
      limit: number;
      percentage: number;
    };
    plan: {
      nombre: string;
      precio: number;
      features: object;
      modulos: string[];
      soporte: object;
    };
  };
  empresa?: {
    tipo_empresa_nombre?: string;
    // Puedes agregar aquí otros campos relevantes que recibas del backend
  };
}

export interface SubscriptionAlert {
  tipo: 'info' | 'warning' | 'error' | 'success';
  titulo: string;
  mensaje: string;
  accion?: {
    texto: string;
    url?: string;
    handler?: () => void;
  };
}

export interface PaymentData {
  clienteId?: string;
  monto: number;
  metodo: 'tarjeta' | 'transferencia' | 'efectivo';
  referencia?: string;
}

export interface PaymentResponse {
  status: string;
  mensaje: string;
  fechaFinPeriodo: string;
  proximoCobro: string;
}

export interface ChangePlanData {
  nuevoPlanId: string;
}

export interface ChangePlanResponse {
  mensaje: string;
  nuevoPlan: string;
  efectivoDesde: string;
}

/**
 * Obtiene información detallada de la suscripción actual
 */
export const getSubscriptionInfo = async (): Promise<SubscriptionInfo> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  try {
    // Intentar usar el endpoint normal primero
    const response = await fetch(`${API_BASE}/info`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Si falla (por auth), usar endpoint de testing
      console.log('🧪 Usando endpoint de testing...');
      const testResponse = await fetch(`${API_BASE}/test`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!testResponse.ok) {
        const errorData = await testResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al obtener información de suscripción');
      }

      const testData = await testResponse.json();
      console.log('✅ Datos de testing obtenidos:', testData);

      // Adaptar la estructura de datos del endpoint de testing
      return {
        ...testData.subscription,
        usage: testData.usage,
      };
    }

    const data = await response.json();
    return {
      ...data.subscription,
      usage: data.usage,
    };
  } catch (error) {
    console.error('Error en getSubscriptionInfo:', error);
    throw error;
  }
};

/**
 * Obtiene las alertas de suscripción (vencimientos, límites, etc.)
 */
export const getSubscriptionAlerts = async (): Promise<SubscriptionAlert[]> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  const response = await fetch(`${API_BASE}/alerts`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al obtener alertas de suscripción');
  }

  return response.json();
};

/**
 * Procesa un pago para activar o renovar suscripción
 */
export const processPayment = async (paymentData: PaymentData): Promise<PaymentResponse> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  const response = await fetch(`${API_BASE}/payment`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ paymentData }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al procesar el pago');
  }

  return response.json();
};

/**
 * Renueva la suscripción actual (extiende 30 días más)
 */
export const renewSubscription = async (): Promise<PaymentResponse> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  const response = await fetch(`${API_BASE}/renew`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al renovar la suscripción');
  }

  return response.json();
};

/**
 * Cancela la suscripción actual
 */
export const cancelSubscription = async (): Promise<{ status: string; mensaje: string }> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  const response = await fetch(`${API_BASE}/cancel`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al cancelar la suscripción');
  }

  return response.json();
};

/**
 * Cambia el plan de suscripción actual
 */
export const changePlan = async (data: ChangePlanData): Promise<ChangePlanResponse> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  const response = await fetch(`${API_BASE}/change-plan`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al cambiar el plan');
  }

  return response.json();
};

/**
 * Helpers para formatear datos de suscripción
 */
export const subscriptionHelpers = {
  /**
   * Obtiene el estado legible de la suscripción
   */
  getEstadoLegible: (estado: SubscriptionInfo['suscripcion']['estado']): string => {
    const estados = {
      en_prueba: 'En Prueba',
      activa: 'Activa',
      expirada: 'Expirada',
      cancelada: 'Cancelada',
      suspendida: 'Suspendida',
    };
    return estados[estado] || 'Desconocido';
  },

  /**
   * Obtiene la clase CSS según el estado
   */
  getEstadoClass: (estado: SubscriptionInfo['suscripcion']['estado']): string => {
    const classes = {
      en_prueba: 'status-trial',
      activa: 'status-active',
      expirada: 'status-expired',
      cancelada: 'status-canceled',
      suspendida: 'status-suspended',
    };
    return classes[estado] || 'status-unknown';
  },

  /**
   * Formatea la fecha de próximo cobro
   */
  formatProximoCobro: (fechaExpiracion: string | null, diasRestantes: number): string => {
    if (!fechaExpiracion) return '-';

    if (diasRestantes <= 0) {
      return 'Expirado';
    } else if (diasRestantes === 1) {
      return 'Mañana';
    } else if (diasRestantes <= 7) {
      return `En ${diasRestantes} días`;
    } else {
      const fecha = new Date(fechaExpiracion);
      return `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
    }
  },

  /**
   * Verifica si el plan es ilimitado
   */
  isLimiteIlimitado: (limite: number | null): boolean => {
    return limite === null || limite === -1;
  },

  /**
   * Obtiene el valor de límite a mostrar
   */
  getLimiteDisplay: (limite: number | null): number => {
    return limite === null || limite === -1 ? 999 : limite;
  },
};
