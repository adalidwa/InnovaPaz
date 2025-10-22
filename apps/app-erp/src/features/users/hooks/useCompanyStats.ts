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

  const [productosOverride, setProductosOverride] = useState<{
    used: number;
    total: number;
    percentage: number;
  } | null>(null);

  const [transaccionesOverride, setTransaccionesOverride] = useState<{
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
        transacciones: { used: 0, total: 250, percentage: 0 },
      };
    }

    try {
      const baseStats = getStatsFromSubscription(subscriptionData);

      // Si tenemos datos actualizados, usarlos en lugar de los base
      return {
        ...baseStats,
        productos: productosOverride || baseStats.productos,
        roles: rolesOverride || baseStats.roles,
        transacciones: transaccionesOverride || baseStats.transacciones,
      };
    } catch (error) {
      console.error('Error al procesar estadísticas:', error);
      return {
        miembros: { used: 1, total: 2, percentage: 50 },
        productos: productosOverride || { used: 0, total: 150, percentage: 0 },
        roles: rolesOverride || { used: 0, total: 2, percentage: 0 },
        transacciones: transaccionesOverride || { used: 0, total: 250, percentage: 0 },
      };
    }
  }, [subscriptionData, rolesOverride, productosOverride, transaccionesOverride]);

  /**
   * Escuchar actualizaciones de estadísticas en tiempo real
   */
  useEffect(() => {
    const handleProductosStatsUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{
        used: number;
        total: number;
        percentage: number;
      }>;

      console.log(
        '📊 Actualizando estadísticas de productos con datos reales:',
        customEvent.detail
      );
      setProductosOverride(customEvent.detail);
    };

    const handleRolesStatsUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{
        used: number;
        total: number;
        percentage: number;
      }>;

      console.log('📊 Actualizando estadísticas de roles con datos reales:', customEvent.detail);
      setRolesOverride(customEvent.detail);
    };

    const handleTransaccionesStatsUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{
        used: number;
        total: number;
        percentage: number;
      }>;

      console.log(
        '📊 Actualizando estadísticas de transacciones con datos reales:',
        customEvent.detail
      );
      setTransaccionesOverride(customEvent.detail);
    };

    window.addEventListener('productosStatsUpdated', handleProductosStatsUpdate);
    window.addEventListener('rolesStatsUpdated', handleRolesStatsUpdate);
    window.addEventListener('transaccionesStatsUpdated', handleTransaccionesStatsUpdate);

    return () => {
      window.removeEventListener('productosStatsUpdated', handleProductosStatsUpdate);
      window.removeEventListener('rolesStatsUpdated', handleRolesStatsUpdate);
      window.removeEventListener('transaccionesStatsUpdated', handleTransaccionesStatsUpdate);
    };
  }, []);

  // Resetear overrides cuando cambian los datos de subscription (nuevo plan, etc.)
  useEffect(() => {
    if (subscriptionData) {
      setProductosOverride(null);
      setRolesOverride(null);
      setTransaccionesOverride(null);
    }
  }, [subscriptionData?.plan?.plan_id]);

  return {
    stats,
    helpers: companyStatsHelpers,
  };
};
