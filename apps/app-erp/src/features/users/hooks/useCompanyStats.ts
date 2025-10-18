import { useMemo, useState, useEffect } from 'react';
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
  const [rolesOverride, setRolesOverride] = useState<{
    used: number;
    total: number;
    percentage: number;
  } | null>(null);

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
      const baseStats = getStatsFromSubscription(subscriptionData);

      // Si tenemos datos actualizados de roles, usarlos en lugar de los base
      if (rolesOverride) {
        return {
          ...baseStats,
          roles: rolesOverride,
        };
      }

      return baseStats;
    } catch (error) {
      console.error('Error al procesar estadísticas:', error);
      return {
        miembros: { used: 1, total: 2, percentage: 50 },
        productos: { used: 0, total: 150, percentage: 0 },
        roles: rolesOverride || { used: 0, total: 2, percentage: 0 },
      };
    }
  }, [subscriptionData, rolesOverride]);

  /**
   * Escuchar actualizaciones de estadísticas de roles en tiempo real
   */
  useEffect(() => {
    const handleRolesStatsUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{
        used: number;
        total: number;
        percentage: number;
      }>;

      console.log('📊 Actualizando estadísticas de roles con datos reales:', customEvent.detail);
      setRolesOverride(customEvent.detail);
    };

    window.addEventListener('rolesStatsUpdated', handleRolesStatsUpdate);

    return () => {
      window.removeEventListener('rolesStatsUpdated', handleRolesStatsUpdate);
    };
  }, []);

  // Resetear override cuando cambian los datos de subscription (nuevo plan, etc.)
  useEffect(() => {
    if (subscriptionData) {
      setRolesOverride(null);
    }
  }, [subscriptionData?.plan?.plan_id]);

  return {
    stats,
    helpers: companyStatsHelpers,
  };
};
