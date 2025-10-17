const Company = require('../models/company.model');
const Plan = require('../models/plan.model');

/**
 * Servicio para manejar suscripciones y períodos de prueba
 */
class SubscriptionService {
  /**
   * Configurar suscripción inicial al crear empresa
   */
  static async setupInitialSubscription(empresaId, planId) {
    try {
      const plan = await Plan.findById(planId);
      if (!plan) {
        throw new Error('Plan no encontrado');
      }

      const now = new Date();
      const limits = plan.limites;

      // Si el plan tiene días de prueba (como Estándar)
      if (limits.dias_prueba > 0) {
        const fechaFinPrueba = new Date(now);
        fechaFinPrueba.setDate(fechaFinPrueba.getDate() + limits.dias_prueba);

        await Company.findByIdAndUpdate(empresaId, {
          estado_suscripcion: 'en_prueba',
          fecha_fin_prueba: fechaFinPrueba,
          fecha_fin_periodo_actual: null,
        });

        return {
          status: 'en_prueba',
          mensaje: `Período de prueba activado por ${limits.dias_prueba} días`,
          fechaFinPrueba: fechaFinPrueba,
        };
      } else {
        // Sin prueba gratuita, requiere pago inmediato
        await Company.findByIdAndUpdate(empresaId, {
          estado_suscripcion: 'pendiente_pago',
          fecha_fin_prueba: null,
          fecha_fin_periodo_actual: null,
        });

        return {
          status: 'pendiente_pago',
          mensaje: 'Se requiere pago para activar la suscripción',
          requierePago: true,
        };
      }
    } catch (error) {
      console.error('Error en setupInitialSubscription:', error);
      throw error;
    }
  }

  /**
   * Procesar pago y activar suscripción
   */
  static async processPayment(empresaId, paymentData) {
    try {
      const empresa = await Company.findById(empresaId);
      if (!empresa) {
        throw new Error('Empresa no encontrada');
      }

      const now = new Date();
      const fechaFinPeriodo = new Date(now);
      fechaFinPeriodo.setDate(fechaFinPeriodo.getDate() + 30); // 30 días

      await Company.findByIdAndUpdate(empresaId, {
        estado_suscripcion: 'activa',
        fecha_fin_periodo_actual: fechaFinPeriodo,
        fecha_fin_prueba: null, // Limpiar período de prueba
        id_cliente_procesador_pago: paymentData.clienteId || null,
      });

      return {
        status: 'activa',
        mensaje: 'Suscripción activada correctamente',
        fechaFinPeriodo: fechaFinPeriodo,
        proximoCobro: fechaFinPeriodo,
      };
    } catch (error) {
      console.error('Error en processPayment:', error);
      throw error;
    }
  }

  /**
   * Renovar suscripción (pago mensual)
   */
  static async renewSubscription(empresaId) {
    try {
      const empresa = await Company.findById(empresaId);
      if (!empresa) {
        throw new Error('Empresa no encontrada');
      }

      const now = new Date();
      let nuevaFechaFin;

      // Si está activa, extender desde la fecha actual de fin
      if (empresa.fecha_fin_periodo_actual && new Date(empresa.fecha_fin_periodo_actual) > now) {
        nuevaFechaFin = new Date(empresa.fecha_fin_periodo_actual);
        nuevaFechaFin.setDate(nuevaFechaFin.getDate() + 30);
      } else {
        // Si está expirada, empezar desde ahora
        nuevaFechaFin = new Date(now);
        nuevaFechaFin.setDate(nuevaFechaFin.getDate() + 30);
      }

      await Company.findByIdAndUpdate(empresaId, {
        estado_suscripcion: 'activa',
        fecha_fin_periodo_actual: nuevaFechaFin,
      });

      return {
        status: 'activa',
        mensaje: 'Suscripción renovada correctamente',
        fechaFinPeriodo: nuevaFechaFin,
        proximoCobro: nuevaFechaFin,
      };
    } catch (error) {
      console.error('Error en renewSubscription:', error);
      throw error;
    }
  }

  /**
   * Cancelar suscripción
   */
  static async cancelSubscription(empresaId) {
    try {
      await Company.findByIdAndUpdate(empresaId, {
        estado_suscripcion: 'cancelada',
      });

      return {
        status: 'cancelada',
        mensaje: 'Suscripción cancelada. Mantendrás acceso hasta el final del período pagado.',
      };
    } catch (error) {
      console.error('Error en cancelSubscription:', error);
      throw error;
    }
  }

  /**
   * Verificar y actualizar suscripciones expiradas (para cron job)
   */
  static async checkExpiredSubscriptions() {
    try {
      const pool = require('../db');
      const now = new Date();

      // Buscar empresas con prueba expirada
      const empresasPruebaExpirada = await pool.query(
        `
        SELECT empresa_id, nombre 
        FROM empresas 
        WHERE estado_suscripcion = 'en_prueba' 
        AND fecha_fin_prueba < $1
      `,
        [now]
      );

      // Buscar empresas con suscripción activa expirada
      const empresasSuscripcionExpirada = await pool.query(
        `
        SELECT empresa_id, nombre 
        FROM empresas 
        WHERE estado_suscripcion = 'activa' 
        AND fecha_fin_periodo_actual < $1
      `,
        [now]
      );

      let actualizadas = 0;

      // Actualizar empresas con prueba expirada
      for (const empresa of empresasPruebaExpirada.rows) {
        await Company.findByIdAndUpdate(empresa.empresa_id, {
          estado_suscripcion: 'expirada',
        });
        actualizadas++;
        console.log(
          `Empresa ${empresa.nombre} (${empresa.empresa_id}) marcada como expirada - fin de prueba`
        );
      }

      // Actualizar empresas con suscripción expirada
      for (const empresa of empresasSuscripcionExpirada.rows) {
        await Company.findByIdAndUpdate(empresa.empresa_id, {
          estado_suscripcion: 'expirada',
        });
        actualizadas++;
        console.log(
          `Empresa ${empresa.nombre} (${empresa.empresa_id}) marcada como expirada - fin de período`
        );
      }

      return {
        verificadas: empresasPruebaExpirada.rows.length + empresasSuscripcionExpirada.rows.length,
        actualizadas,
        timestamp: now,
      };
    } catch (error) {
      console.error('Error en checkExpiredSubscriptions:', error);
      throw error;
    }
  }

  /**
   * Obtener información detallada de la suscripción con JOINS
   */
  static async getSubscriptionInfo(empresaId) {
    try {
      console.log('🔍 getSubscriptionInfo - Buscando empresa:', empresaId);

      // Consulta con JOIN para obtener toda la información relacionada
      const pool = require('../db');
      const query = `
        SELECT 
          e.empresa_id,
          e.nombre as empresa_nombre,
          e.tipo_empresa_id,
          e.plan_id,
          e.estado_suscripcion,
          e.fecha_fin_prueba,
          e.fecha_fin_periodo_actual,
          e.fecha_creacion,
          e.tamano_empresa,
          e.email,
          e.logo_url,
          p.nombre_plan,
          p.precio_mensual,
          p.limites,
          te.tipo_empresa
        FROM empresas e
        LEFT JOIN planes p ON e.plan_id = p.plan_id
        LEFT JOIN tipos_empresa te ON e.tipo_empresa_id = te.tipo_id
        WHERE e.empresa_id = $1
      `;

      const result = await pool.query(query, [empresaId]);
      const empresaCompleta = result.rows[0];

      if (!empresaCompleta) {
        throw new Error('Empresa no encontrada');
      }

      console.log('� Empresa completa encontrada:', {
        empresa_id: empresaCompleta.empresa_id,
        empresa_nombre: empresaCompleta.empresa_nombre,
        tipo_empresa_id: empresaCompleta.tipo_empresa_id,
        tipo_empresa: empresaCompleta.tipo_empresa,
        plan_id: empresaCompleta.plan_id,
        nombre_plan: empresaCompleta.nombre_plan,
        precio_mensual: empresaCompleta.precio_mensual,
        estado_suscripcion: empresaCompleta.estado_suscripcion,
        limites: empresaCompleta.limites,
      });

      const now = new Date();
      let diasRestantes = 0;
      let fechaExpiracion = null;

      if (empresaCompleta.estado_suscripcion === 'en_prueba' && empresaCompleta.fecha_fin_prueba) {
        fechaExpiracion = new Date(empresaCompleta.fecha_fin_prueba);
        diasRestantes = Math.max(0, Math.ceil((fechaExpiracion - now) / (1000 * 60 * 60 * 24)));
      } else if (
        empresaCompleta.estado_suscripcion === 'activa' &&
        empresaCompleta.fecha_fin_periodo_actual
      ) {
        fechaExpiracion = new Date(empresaCompleta.fecha_fin_periodo_actual);
        diasRestantes = Math.max(0, Math.ceil((fechaExpiracion - now) / (1000 * 60 * 60 * 24)));
      }

      const subscriptionData = {
        plan: {
          nombre: empresaCompleta.nombre_plan,
          precio: empresaCompleta.precio_mensual,
          limites: empresaCompleta.limites,
        },
        suscripcion: {
          estado: empresaCompleta.estado_suscripcion,
          fechaExpiracion,
          diasRestantes,
          enPeriodoPrueba: empresaCompleta.estado_suscripcion === 'en_prueba',
          activa: ['en_prueba', 'activa'].includes(empresaCompleta.estado_suscripcion),
        },
        fechas: {
          creacion: empresaCompleta.fecha_creacion,
          finPrueba: empresaCompleta.fecha_fin_prueba,
          finPeriodoActual: empresaCompleta.fecha_fin_periodo_actual,
        },
        empresa: {
          id: empresaCompleta.empresa_id,
          nombre: empresaCompleta.empresa_nombre,
          tipo_empresa_id: empresaCompleta.tipo_empresa_id,
          tipo_empresa_nombre: empresaCompleta.tipo_empresa,
          plan_id: empresaCompleta.plan_id,
          tamano_empresa: empresaCompleta.tamano_empresa,
          email: empresaCompleta.email,
          logo_url: empresaCompleta.logo_url,
        },
      };

      console.log('📤 Datos finales de suscripción:', JSON.stringify(subscriptionData, null, 2));

      return subscriptionData;
    } catch (error) {
      console.error('❌ Error en getSubscriptionInfo:', error);
      throw error;
    }
  }

  /**
   * Cambiar plan de empresa
   */
  static async changePlan(empresaId, nuevoPlanId) {
    try {
      const [empresa, nuevoPlan] = await Promise.all([
        Company.findById(empresaId),
        Plan.findById(nuevoPlanId),
      ]);

      if (!empresa) throw new Error('Empresa no encontrada');
      if (!nuevoPlan) throw new Error('Plan no encontrado');

      // Si está cambiando a un plan más caro, podría requerir pago inmediato
      // Si está cambiando a un plan más barato, se mantiene hasta el próximo ciclo

      await Company.findByIdAndUpdate(empresaId, {
        plan_id: nuevoPlanId,
      });

      return {
        mensaje: 'Plan cambiado correctamente',
        nuevoPlan: nuevoPlan.nombre_plan,
        efectivoDesde: new Date(),
      };
    } catch (error) {
      console.error('Error en changePlan:', error);
      throw error;
    }
  }
}

module.exports = SubscriptionService;
