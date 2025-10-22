// Servicio para obtener información de planes (público)

export interface Plan {
  plan_id: number;
  nombre_plan: string;
  precio_mensual: number;
  limites: {
    miembros: number;
    productos: number;
    transacciones: number;
    roles?: number;
  };
  fecha_creacion: string;
}

export async function getPlans(): Promise<Plan[]> {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/plans`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Error al obtener planes');
    }

    return await response.json();
  } catch (error) {
    console.error('Error obteniendo planes:', error);
    return [];
  }
}

export async function getPlanById(planId: number): Promise<Plan | null> {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/plans/${planId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Error al obtener plan');
    }

    return await response.json();
  } catch (error) {
    console.error('Error obteniendo plan:', error);
    return null;
  }
}
