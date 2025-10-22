// Servicio para crear empresas usando el endpoint del backend

// Helper para convertir nombres de planes a IDs
export function getPlanId(planName: string | null): number {
  switch (planName) {
    case 'basico':
      return 1;
    case 'profesional':
    case 'estandar':
      return 2;
    case 'empresarial':
    case 'premium':
      return 3;
    default:
      return 1;
  }
}

// Helper para convertir tipos de empresa a IDs (ahora dinámico)
export function getBusinessTypeId(businessType: string): number {
  // Mapeo basado en los IDs reales de la base de datos
  switch (businessType.toLowerCase()) {
    case 'minimarket':
      return 1;
    case 'ferreteria':
    case 'ferretería':
      return 2;
    case 'licoreria':
    case 'licorería':
      return 3;
    default:
      return 1;
  }
}

// Helper para obtener el nombre de visualización del plan
export function getPlanDisplayName(planName: string | null): string {
  switch (planName) {
    case 'basico':
      return 'Básico';
    case 'profesional':
      return 'Profesional';
    case 'estandar':
      return 'Estándar';
    case 'empresarial':
      return 'Empresarial';
    case 'premium':
      return 'Premium';
    default:
      return 'Básico';
  }
}

// Nueva función helper para convertir el valor del select a un slug
export function businessTypeToSlug(businessTypeName: string): string {
  return businessTypeName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/\s+/g, ''); // Remover espacios
}
