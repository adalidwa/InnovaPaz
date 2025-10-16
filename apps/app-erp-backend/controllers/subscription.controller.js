const SubscriptionService = require('../services/subscriptionService');
const { getUsageInfo } = require('../middleware/planValidation');
const Company = require('../models/company.model');
const Plan = require('../models/plan.model');

/**
 * Obtener información de la suscripción actual
 */
async function getSubscriptionInfo(req, res) {
  try {
    const empresaId = req.user?.empresa_id;

    if (!empresaId) {
      return res.status(400).json({ error: 'ID de empresa requerido' });
    }

    console.log('📋 Obteniendo información de suscripción para empresa:', empresaId);

    const [subscriptionInfo, usageInfo] = await Promise.all([
      SubscriptionService.getSubscriptionInfo(empresaId),
      getUsageInfo(empresaId),
    ]);

    console.log('✅ Información obtenida:', { subscriptionInfo, usageInfo });

    res.json({
      subscription: subscriptionInfo,
      usage: usageInfo,
    });
  } catch (error) {
    console.error('Error en getSubscriptionInfo:', error);
    res.status(500).json({ error: 'Error al obtener información de suscripción' });
  }
}

/**
 * Procesar pago de suscripción
 */
async function processPayment(req, res) {
  try {
    const { empresaId, paymentData } = req.body;

    if (!empresaId || !paymentData) {
      return res.status(400).json({ error: 'Datos de pago incompletos' });
    }

    const result = await SubscriptionService.processPayment(empresaId, paymentData);
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Error en processPayment:', error);
    res.status(500).json({ error: 'Error al procesar el pago' });
  }
}

/**
 * Renovar suscripción
 */
async function renewSubscription(req, res) {
  try {
    const empresaId = req.user?.empresa_id || req.body.empresaId;

    if (!empresaId) {
      return res.status(400).json({ error: 'ID de empresa requerido' });
    }

    const result = await SubscriptionService.renewSubscription(empresaId);
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Error en renewSubscription:', error);
    res.status(500).json({ error: 'Error al renovar suscripción' });
  }
}

/**
 * Cancelar suscripción
 */
async function cancelSubscription(req, res) {
  try {
    const empresaId = req.user?.empresa_id;

    if (!empresaId) {
      return res.status(400).json({ error: 'ID de empresa requerido' });
    }

    const result = await SubscriptionService.cancelSubscription(empresaId);
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Error en cancelSubscription:', error);
    res.status(500).json({ error: 'Error al cancelar suscripción' });
  }
}

/**
 * Cambiar plan
 */
async function changePlan(req, res) {
  try {
    const { nuevoPlanId } = req.body;
    const empresaId = req.user?.empresa_id;

    if (!empresaId || !nuevoPlanId) {
      return res.status(400).json({ error: 'ID de empresa y plan requeridos' });
    }

    const result = await SubscriptionService.changePlan(empresaId, nuevoPlanId);
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Error en changePlan:', error);
    res.status(500).json({ error: 'Error al cambiar plan' });
  }
}

/**
 * Obtener facturas de la empresa
 */
async function getInvoices(req, res) {
  try {
    const empresaId = req.user?.empresa_id;

    if (!empresaId) {
      return res.status(400).json({ error: 'ID de empresa requerido' });
    }

    // Por ahora retornamos datos mock, aquí se integraría con el procesador de pagos
    const facturasMock = [
      {
        id: 'inv_001',
        numero: 'FAC-2025-001',
        fecha: '2025-01-15',
        monto: 50,
        estado: 'pagada',
        url: '/api/invoices/inv_001/download',
      },
      {
        id: 'inv_002',
        numero: 'FAC-2025-002',
        fecha: '2025-02-15',
        monto: 50,
        estado: 'pendiente',
        url: null,
      },
    ];

    res.json({ facturas: facturasMock });
  } catch (error) {
    console.error('Error en getInvoices:', error);
    res.status(500).json({ error: 'Error al obtener facturas' });
  }
}

/**
 * Verificar estado de suscripciones (endpoint para cron job)
 */
async function checkSubscriptionStatus(req, res) {
  try {
    const result = await SubscriptionService.checkExpiredSubscriptions();
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Error en checkSubscriptionStatus:', error);
    res.status(500).json({ error: 'Error al verificar suscripciones' });
  }
}

/**
 * Obtener alertas de suscripción para el usuario
 */
async function getSubscriptionAlerts(req, res) {
  try {
    const empresaId = req.user?.empresa_id;

    if (!empresaId) {
      return res.status(400).json({ error: 'ID de empresa requerido' });
    }

    const subscriptionInfo = await SubscriptionService.getSubscriptionInfo(empresaId);
    const alerts = [];

    // Generar alertas según el estado
    if (subscriptionInfo.suscripcion.estado === 'en_prueba') {
      if (subscriptionInfo.suscripcion.diasRestantes <= 3) {
        alerts.push({
          type: 'warning',
          title: 'Período de prueba por terminar',
          message: `Tu período de prueba termina en ${subscriptionInfo.suscripcion.diasRestantes} días. Actualiza tu suscripción para continuar.`,
          actionText: 'Activar Suscripción',
          actionUrl: '/settings/billing',
        });
      }
    } else if (subscriptionInfo.suscripcion.estado === 'activa') {
      if (subscriptionInfo.suscripcion.diasRestantes <= 7) {
        alerts.push({
          type: 'info',
          title: 'Próximo cobro',
          message: `Tu suscripción se renovará en ${subscriptionInfo.suscripcion.diasRestantes} días.`,
          actionText: 'Ver Facturación',
          actionUrl: '/settings/billing',
        });
      }
    } else if (subscriptionInfo.suscripcion.estado === 'expirada') {
      alerts.push({
        type: 'error',
        title: 'Suscripción expirada',
        message: 'Tu suscripción ha expirado. Renueva ahora para continuar usando el sistema.',
        actionText: 'Renovar Suscripción',
        actionUrl: '/settings/billing',
      });
    }

    res.json({ alerts });
  } catch (error) {
    console.error('Error en getSubscriptionAlerts:', error);
    res.status(500).json({ error: 'Error al obtener alertas' });
  }
}

module.exports = {
  getSubscriptionInfo,
  processPayment,
  renewSubscription,
  cancelSubscription,
  changePlan,
  getInvoices,
  checkSubscriptionStatus,
  getSubscriptionAlerts,
};
