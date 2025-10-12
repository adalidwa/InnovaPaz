// Servicio para obtener tipos de empresa (público)

export interface BusinessType {
  tipo_id: number;
  tipo_empresa: string;
  fecha_creacion: string;
}

export async function getBusinessTypes(): Promise<BusinessType[]> {
  try {
    const response = await fetch('http://localhost:4000/api/companies/types', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener tipos de empresa');
    }

    return await response.json();
  } catch (error) {
    console.error('Error obteniendo tipos de empresa:', error);
    return [];
  }
}

export async function getBusinessTypeById(typeId: number): Promise<BusinessType | null> {
  try {
    const response = await fetch(`http://localhost:4000/api/companies/types/${typeId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener tipo de empresa');
    }

    return await response.json();
  } catch (error) {
    console.error('Error obteniendo tipo de empresa:', error);
    return null;
  }
}
