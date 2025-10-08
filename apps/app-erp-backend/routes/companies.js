import express from 'express';
import { executeQuery, executeTransaction } from '../utils/database.js';

const router = express.Router();

/**
 * GET /api/companies
 * Obtiene todas las empresas
 */
router.get('/', async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT 
        e.empresa_id,
        e.nombre,
        e.ajustes,
        e.estado_suscripcion,
        e.fecha_fin_prueba,
        e.fecha_fin_periodo_actual,
        e.fecha_creacion,
        te.tipo_empresa,
        p.nombre_plan,
        p.precio_mensual,
        p.limites
      FROM empresas e
      LEFT JOIN tipos_empresa te ON e.tipo_empresa_id = te.tipo_id
      LEFT JOIN planes p ON e.plan_id = p.plan_id
      ORDER BY e.fecha_creacion DESC
    `);

    if (result.success) {
      res.json({
        success: true,
        message: `Se encontraron ${result.data.length} empresas`,
        data: result.data,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error al obtener empresas',
        error: result.error,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
});

/**
 * GET /api/companies/:id
 * Obtiene una empresa específica por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await executeQuery(
      `
      SELECT 
        e.empresa_id,
        e.nombre,
        e.ajustes,
        e.estado_suscripcion,
        e.fecha_fin_prueba,
        e.fecha_fin_periodo_actual,
        e.fecha_creacion,
        te.tipo_empresa,
        p.nombre_plan,
        p.precio_mensual,
        p.limites
      FROM empresas e
      LEFT JOIN tipos_empresa te ON e.tipo_empresa_id = te.tipo_id
      LEFT JOIN planes p ON e.plan_id = p.plan_id
      WHERE e.empresa_id = $1
    `,
      [id]
    );

    if (result.success && result.data.length > 0) {
      res.json({
        success: true,
        message: 'Empresa encontrada',
        data: result.data[0],
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Empresa no encontrada',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
});

/**
 * POST /api/companies
 * Crea una nueva empresa
 */
router.post('/', async (req, res) => {
  try {
    const {
      nombre,
      tipo_empresa_id,
      plan_id,
      ajustes = {},
      estado_suscripcion = 'en_prueba',
    } = req.body;

    if (!nombre) {
      return res.status(400).json({
        success: false,
        message: 'El nombre de la empresa es requerido',
      });
    }

    // Calcular fecha de fin de prueba (30 días desde ahora)
    const fechaFinPrueba = new Date();
    fechaFinPrueba.setDate(fechaFinPrueba.getDate() + 30);

    const result = await executeQuery(
      `
      INSERT INTO empresas (nombre, tipo_empresa_id, plan_id, ajustes, estado_suscripcion, fecha_fin_prueba)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
      [
        nombre,
        tipo_empresa_id,
        plan_id,
        JSON.stringify(ajustes),
        estado_suscripcion,
        fechaFinPrueba,
      ]
    );

    if (result.success) {
      res.status(201).json({
        success: true,
        message: 'Empresa creada exitosamente',
        data: result.data[0],
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error al crear empresa',
        error: result.error,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
});

/**
 * POST /api/companies/setup
 * Configura la empresa para un usuario después del registro
 */
router.post('/setup', async (req, res) => {
  try {
    console.log('🏢 [BACKEND][SETUP] === INICIO SETUP EMPRESA ===');
    console.log('🏢 [BACKEND][SETUP] Datos recibidos:', req.body);

    const { firebase_uid, empresa_nombre, tipo_empresa_id, plan_id } = req.body;

    if (!firebase_uid || !empresa_nombre || !tipo_empresa_id) {
      console.error('❌ [BACKEND][SETUP] Campos faltantes:', {
        firebase_uid,
        empresa_nombre,
        tipo_empresa_id,
        plan_id,
      });
      return res.status(400).json({
        success: false,
        code: 'MISSING_FIELDS',
        message: 'Faltan datos requeridos: firebase_uid, empresa_nombre, tipo_empresa_id',
      });
    }

    // 🛡️ PASO 1: Verificar con el GUARDIA que el usuario existe
    console.log('🛡️ [BACKEND][SETUP] PASO 1: Verificando usuario existe:', firebase_uid);

    const userExists = await executeQuery(
      'SELECT uid, nombre_completo, email FROM usuarios WHERE uid = $1',
      [firebase_uid]
    );

    console.log('🛡️ [BACKEND][SETUP] Resultado verificación usuario:', userExists);

    if (!userExists.success || userExists.data.length === 0) {
      console.error('❌ [BACKEND][SETUP] Usuario no encontrado en PostgreSQL');
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_SYNCED',
        message: 'Usuario no encontrado en PostgreSQL. Debe sincronizarse primero.',
      });
    }

    console.log('✅ [BACKEND][SETUP] Usuario encontrado:', userExists.data[0]);

    // 📋 PASO 2: Verificar en el GERENTE si ya tiene empresa
    console.log('📋 [BACKEND][SETUP] PASO 2: Verificando si usuario ya tiene empresa...');

    const existingCompany = await executeQuery(
      'SELECT empresa_id FROM usuarios WHERE uid = $1 AND empresa_id IS NOT NULL',
      [firebase_uid]
    );

    console.log('📋 [BACKEND][SETUP] Resultado verificación empresa existente:', existingCompany);

    if (existingCompany.success && existingCompany.data.length > 0) {
      console.warn('⚠️ [BACKEND][SETUP] Usuario ya tiene empresa:', existingCompany.data[0]);
      return res.status(400).json({
        success: false,
        code: 'ALREADY_HAS_COMPANY',
        message: 'El usuario ya tiene una empresa configurada',
      });
    }

    console.log('🔄 [BACKEND][SETUP] PASO 3: Iniciando transacción...');

    const transactionResult = await executeTransaction(async (client) => {
      // 🏢 PASO 3A: Crear la empresa
      console.log('🏢 [BACKEND][SETUP] PASO 3A: Creando empresa con datos:', {
        empresa_nombre,
        tipo_empresa_id,
        plan_id: plan_id || 1,
      });

      const fechaFinPrueba = new Date();
      fechaFinPrueba.setDate(fechaFinPrueba.getDate() + 30);

      const empresaResult = await client.query(
        `INSERT INTO empresas (nombre, tipo_empresa_id, plan_id, estado_suscripcion, fecha_fin_prueba, fecha_creacion) 
         VALUES ($1, $2, $3, 'en_prueba', $4, CURRENT_TIMESTAMP) 
         RETURNING empresa_id, nombre`,
        [empresa_nombre, tipo_empresa_id, plan_id || 1, fechaFinPrueba]
      );

      const empresa_id = empresaResult.rows[0].empresa_id;
      console.log('✅ [BACKEND][SETUP] Empresa creada exitosamente:', {
        empresa_id,
        nombre: empresaResult.rows[0].nombre,
      });

      // 👤 PASO 3B: Crear rol administrador para esta empresa
      console.log(
        '🎭 [BACKEND][SETUP] PASO 3B: Creando rol administrador para empresa:',
        empresa_id
      );

      const newRolResult = await client.query(
        `INSERT INTO roles (empresa_id, nombre_rol, permisos, es_predeterminado, estado, fecha_creacion)
         VALUES ($1, 'Administrador', '{"all": true}', true, 'activo', CURRENT_TIMESTAMP)
         RETURNING rol_id, nombre_rol`,
        [empresa_id]
      );
      const admin_rol_id = newRolResult.rows[0].rol_id;
      console.log('✅ [BACKEND][SETUP] Rol administrador creado:', {
        rol_id: admin_rol_id,
        nombre_rol: newRolResult.rows[0].nombre_rol,
      });

      // 👤 PASO 3C: Actualizar usuario con empresa_id y rol_id
      console.log('👤 [BACKEND][SETUP] PASO 3C: Asignando empresa y rol al usuario:', firebase_uid);

      const userUpdateResult = await client.query(
        `UPDATE usuarios 
         SET empresa_id = $1, rol_id = $2
         WHERE uid = $3
         RETURNING uid, empresa_id, rol_id, nombre_completo`,
        [empresa_id, admin_rol_id, firebase_uid]
      );

      console.log(
        '✅ [BACKEND][SETUP] Usuario actualizado exitosamente:',
        userUpdateResult.rows[0]
      );

      return { empresa_id, admin_rol_id };
    });

    console.log('📊 [BACKEND][SETUP] Resultado transacción:', transactionResult);

    // Verificar si la transacción fue exitosa
    if (!transactionResult.success) {
      console.error('❌ [BACKEND][SETUP] Error en transacción:', transactionResult.error);
      return res.status(500).json({
        success: false,
        code: 'TRANSACTION_ERROR',
        message: `Error en transacción: ${transactionResult.error}`,
      });
    }

    const result = transactionResult.data;

    console.log('🎉 [BACKEND][SETUP] === SETUP EMPRESA COMPLETADO EXITOSAMENTE ===');
    console.log('🎉 [BACKEND][SETUP] Datos finales:', {
      empresa_id: result.empresa_id,
      rol_id: result.admin_rol_id,
      setup_completed: true,
    });

    res.json({
      success: true,
      code: 'COMPANY_SETUP_OK',
      message: '✅ Coordinador: Empresa configurada exitosamente',
      data: {
        empresa_id: result.empresa_id,
        rol_id: result.admin_rol_id,
        setup_completed: true,
      },
    });
  } catch (error) {
    console.error('💥 [BACKEND][SETUP] Error excepción en setup:', error);
    console.error('💥 [BACKEND][SETUP] Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      code: 'INTERNAL_ERROR',
      message: '💥 Error interno del Coordinador',
      error: error.message,
    });
  }
});

/**
 * PUT /api/companies/:id
 * Actualiza una empresa existente
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, tipo_empresa_id, plan_id, ajustes, estado_suscripcion } = req.body;

    if (!nombre && !tipo_empresa_id && !plan_id && !ajustes && !estado_suscripcion) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere al menos un campo para actualizar',
      });
    }

    // Construir query dinámicamente
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (nombre) {
      updates.push(`nombre = $${paramCount++}`);
      values.push(nombre);
    }
    if (tipo_empresa_id) {
      updates.push(`tipo_empresa_id = $${paramCount++}`);
      values.push(tipo_empresa_id);
    }
    if (plan_id) {
      updates.push(`plan_id = $${paramCount++}`);
      values.push(plan_id);
    }
    if (ajustes) {
      updates.push(`ajustes = $${paramCount++}`);
      values.push(JSON.stringify(ajustes));
    }
    if (estado_suscripcion) {
      updates.push(`estado_suscripcion = $${paramCount++}`);
      values.push(estado_suscripcion);
    }

    values.push(id); // Para el WHERE

    const query = `
      UPDATE empresas 
      SET ${updates.join(', ')}
      WHERE empresa_id = $${paramCount}
      RETURNING *
    `;

    const result = await executeQuery(query, values);

    if (result.success && result.data.length > 0) {
      res.json({
        success: true,
        message: 'Empresa actualizada exitosamente',
        data: result.data[0],
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Empresa no encontrada',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
});

/**
 * GET /api/companies/:id/roles
 * Obtiene todos los roles de una empresa
 */
router.get('/:id/roles', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await executeQuery(
      `
      SELECT 
        rol_id,
        nombre_rol,
        permisos,
        es_predeterminado,
        estado,
        fecha_creacion
      FROM roles
      WHERE empresa_id = $1
      ORDER BY fecha_creacion DESC
    `,
      [id]
    );

    if (result.success) {
      res.json({
        success: true,
        message: `Se encontraron ${result.data.length} roles para la empresa`,
        data: result.data,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error al obtener roles de la empresa',
        error: result.error,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
});

/**
 * GET /api/companies/types
 * Obtiene todos los tipos de empresa disponibles
 */
router.get('/types/all', async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT tipo_id, tipo_empresa, fecha_creacion
      FROM tipos_empresa
      ORDER BY tipo_empresa
    `);

    if (result.success) {
      res.json({
        success: true,
        message: `Se encontraron ${result.data.length} tipos de empresa`,
        data: result.data,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error al obtener tipos de empresa',
        error: result.error,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
});

/**
 * GET /api/companies/plans/all
 * Obtiene todos los planes disponibles
 */
router.get('/plans/all', async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT plan_id, nombre_plan, precio_mensual, limites, fecha_creacion
      FROM planes
      ORDER BY precio_mensual
    `);

    if (result.success) {
      res.json({
        success: true,
        message: `Se encontraron ${result.data.length} planes`,
        data: result.data,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error al obtener planes',
        error: result.error,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
});

export default router;
