import { useMemo } from 'react';
import {
  getStatsFromSubscription,
  type CompanyUsageStats,
  companyStatsHelpers,
} from '../services/companyStatsService';

interface UseCompanyStatsReturn {
  // Estados de datos
  stats: CompanyUsageStats | null;

  // Helpers
  helpers: typeof companyStatsHelpers;
}

/**
 * Hook simplificado que procesa los datos de subscription para generar estadísticas
 * Esto evita llamadas adicionales ya que los datos vienen del hook useSubscription
 */
export const useCompanyStats = (subscriptionData?: any): UseCompanyStatsReturn => {
  /**
   * Procesar estadísticas desde los datos de subscription
   */
  const stats = useMemo(() => {
    if (!subscriptionData) {
      return {
        miembros: { used: 1, total: 2, percentage: 50 },
        productos: { used: 0, total: 150, percentage: 0 },
        roles: { used: 0, total: 2, percentage: 0 },
      };
    }

    try {
      return getStatsFromSubscription(subscriptionData);
    } catch (error) {
      console.error('Error al procesar estadísticas:', error);
      return {
        miembros: { used: 1, total: 2, percentage: 50 },
        productos: { used: 0, total: 150, percentage: 0 },
        roles: { used: 0, total: 2, percentage: 0 },
      };
    }
  }, [subscriptionData]);

  return {
    stats,
    helpers: companyStatsHelpers,
  };
};
