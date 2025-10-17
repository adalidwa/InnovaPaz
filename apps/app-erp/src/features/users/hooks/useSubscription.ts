/**
 * ================================================================
 * HOOK: useSubscription
 * ================================================================
 *
 * Maneja toda la lógica de suscripciones:
 * - Obtener información de suscripción
 * - Procesar pagos
 * - Renovar suscripción
 * - Cancelar suscripción
 * - Cambiar plan
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getSubscriptionInfo,
  processPayment,
  renewSubscription,
  cancelSubscription,
  changePlan,
  subscriptionHelpers,
  type SubscriptionInfo,
  type PaymentData,
} from '../services/subscriptionService';

interface UseSubscriptionReturn {
  // Datos
  subscription: SubscriptionInfo | null;

  // Estados de carga
  loading: boolean;
  processing: boolean;

  // Estados de error
  error: string | null;

  // Acciones
  fetchSubscription: () => Promise<void>;
  handlePayment: (paymentData: PaymentData) => Promise<any>;
  handleRenew: () => Promise<any>;
  handleCancel: () => Promise<any>;
  handleChangePlan: (nuevoPlanId: string) => Promise<any>;
  clearError: () => void;

  // Helpers
  helpers: typeof subscriptionHelpers;
}

export const useSubscription = (): UseSubscriptionReturn => {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Obtiene la información de suscripción
   */
  const fetchSubscription = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Obteniendo información de suscripción...');

      const data = await getSubscriptionInfo();
      console.log('✅ Suscripción obtenida:', data);

      setSubscription(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener suscripción';
      console.error('❌ Error en fetchSubscription:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Procesa un pago
   */
  const handlePayment = useCallback(
    async (paymentData: PaymentData) => {
      try {
        setProcessing(true);
        setError(null);
        console.log('💳 Procesando pago...', paymentData);

        const result = await processPayment(paymentData);
        console.log('✅ Pago procesado:', result);

        // Refrescar información de suscripción
        await fetchSubscription();

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al procesar pago';
        console.error('❌ Error en handlePayment:', errorMessage);
        setError(errorMessage);
        throw err;
      } finally {
        setProcessing(false);
      }
    },
    [fetchSubscription]
  );

  /**
   * Renueva la suscripción
   */
  const handleRenew = useCallback(async () => {
    try {
      setProcessing(true);
      setError(null);
      console.log('🔄 Renovando suscripción...');

      const result = await renewSubscription();
      console.log('✅ Suscripción renovada:', result);

      // Refrescar información de suscripción
      await fetchSubscription();

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al renovar suscripción';
      console.error('❌ Error en handleRenew:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setProcessing(false);
    }
  }, [fetchSubscription]);

  /**
   * Cancela la suscripción
   */
  const handleCancel = useCallback(async () => {
    try {
      setProcessing(true);
      setError(null);
      console.log('🚫 Cancelando suscripción...');

      const result = await cancelSubscription();
      console.log('✅ Suscripción cancelada:', result);

      // Refrescar información de suscripción
      await fetchSubscription();

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cancelar suscripción';
      console.error('❌ Error en handleCancel:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setProcessing(false);
    }
  }, [fetchSubscription]);

  /**
   * Cambia el plan de suscripción
   */
  const handleChangePlan = useCallback(
    async (nuevoPlanId: string) => {
      try {
        setProcessing(true);
        setError(null);
        console.log('📦 Cambiando plan...', nuevoPlanId);

        const result = await changePlan({ nuevoPlanId });
        console.log('✅ Plan cambiado:', result);

        // Refrescar información de suscripción
        await fetchSubscription();

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cambiar plan';
        console.error('❌ Error en handleChangePlan:', errorMessage);
        setError(errorMessage);
        throw err;
      } finally {
        setProcessing(false);
      }
    },
    [fetchSubscription]
  );

  /**
   * Limpia el error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Cargar información al montar el componente
   */
  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return {
    subscription,
    loading,
    processing,
    error,
    fetchSubscription,
    handlePayment,
    handleRenew,
    handleCancel,
    handleChangePlan,
    clearError,
    helpers: subscriptionHelpers,
  };
};
