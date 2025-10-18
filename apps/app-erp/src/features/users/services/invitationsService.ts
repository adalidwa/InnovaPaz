/**
 * Servicio para gestión de invitaciones
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export interface Invitation {
  invitacion_id: number;
  email: string;
  rol: string;
  rol_nombre?: string;
  invitado_por?: string;
  estado: 'pendiente' | 'aceptada' | 'expirada' | 'cancelada';
  fecha_creacion: string;
  fecha_expiracion: string;
  fecha_aceptacion?: string;
}

export interface CreateInvitationData {
  email: string;
  rol_id: number;
}

/**
 * Crear nueva invitación
 */
export async function createInvitation(
  data: CreateInvitationData,
  token: string
): Promise<{ success: boolean; invitacion?: Invitation; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/api/invitations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Error al crear invitación',
      };
    }

    return {
      success: true,
      invitacion: result.invitacion,
    };
  } catch (error) {
    console.error('Error en createInvitation:', error);
    return {
      success: false,
      error: 'Error de conexión al crear invitación',
    };
  }
}

/**
 * Listar invitaciones de la empresa
 */
export async function getInvitationsByCompany(token: string): Promise<Invitation[]> {
  try {
    const response = await fetch(`${API_URL}/api/invitations/company`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('Error al obtener invitaciones');
      return [];
    }

    const data = await response.json();
    return data.invitaciones || [];
  } catch (error) {
    console.error('Error en getInvitationsByCompany:', error);
    return [];
  }
}

/**
 * Reenviar invitación
 */
export async function resendInvitation(
  invitacionId: number,
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/api/invitations/${invitacionId}/resend`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Error al reenviar invitación',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error en resendInvitation:', error);
    return {
      success: false,
      error: 'Error de conexión al reenviar invitación',
    };
  }
}

/**
 * Cancelar invitación
 */
export async function cancelInvitation(
  invitacionId: number,
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/api/invitations/${invitacionId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Error al cancelar invitación',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error en cancelInvitation:', error);
    return {
      success: false,
      error: 'Error de conexión al cancelar invitación',
    };
  }
}
