// Servicio para completar la configuración de la empresa para un usuario existente

interface CompleteCompanySetupData {
  firebase_uid: string;
  email: string;
  nombre_completo: string;
  empresa_data: {
    nombre: string;
    tipo_empresa_id: number;
    plan_id: number;
  };
}

export async function completeCompanySetup(data: CompleteCompanySetupData) {
  const response = await fetch('http://localhost:4000/api/users/complete-company-setup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al completar la configuración de la empresa.');
  }

  return await response.json();
}
