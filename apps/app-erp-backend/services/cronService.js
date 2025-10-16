const cron = require('node-cron');
const SubscriptionService = require('../services/subscriptionService');

/**
 * Configurar tareas programadas (cron jobs)
 */
function setupCronJobs() {
  // Verificar suscripciones expiradas cada día a las 00:00
  cron.schedule(
    '0 0 * * *',
    async () => {
      console.log('🕛 Ejecutando verificación de suscripciones expiradas...');
      try {
        const result = await SubscriptionService.checkExpiredSubscriptions();
        console.log(
          `✅ Verificación completada: ${result.verificadas} empresas verificadas, ${result.actualizadas} actualizadas`
        );
      } catch (error) {
        console.error('❌ Error en verificación de suscripciones:', error);
      }
    },
    {
      timezone: 'America/La_Paz', // Zona horaria de Bolivia
    }
  );

  // Verificar suscripciones cada 6 horas (por si hay urgencias)
  cron.schedule(
    '0 */6 * * *',
    async () => {
      console.log('🕰️ Verificación rápida de suscripciones...');
      try {
        const result = await SubscriptionService.checkExpiredSubscriptions();
        if (result.actualizadas > 0) {
          console.log(`⚠️ Se encontraron ${result.actualizadas} suscripciones expiradas`);
        }
      } catch (error) {
        console.error('❌ Error en verificación rápida:', error);
      }
    },
    {
      timezone: 'America/La_Paz',
    }
  );

  // Notificación de inicio
  console.log('⏰ Cron jobs configurados:');
  console.log('   - Verificación diaria de suscripciones: 00:00 (La Paz)');
  console.log('   - Verificación rápida: cada 6 horas');
}

/**
 * Ejecutar verificación manual (para testing)
 */
async function runManualCheck() {
  console.log('🔍 Ejecutando verificación manual de suscripciones...');
  try {
    const result = await SubscriptionService.checkExpiredSubscriptions();
    console.log('📊 Resultado:', result);
    return result;
  } catch (error) {
    console.error('❌ Error en verificación manual:', error);
    throw error;
  }
}

module.exports = {
  setupCronJobs,
  runManualCheck,
};
