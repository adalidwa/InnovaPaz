import express from 'express';
import { executeQuery, executeTransaction } from '../utils/database.js';

const router = express.Router();

/**
 * POST /api/users/sync
 * Sincroniza un usuario básico (creado solo en Firebase) dentro de PostgreSQL.
 * Idempotente: si ya existe devuelve existente.
 */
router.post('/sync', async (req, res) => {
  try {
    console.log('🔄 [BACKEND][SYNC] Datos recibidos:', req.body);

    const { firebase_uid, email, nombre, nombre_completo } = req.body;

    if (!firebase_uid || !email || (!nombre && !nombre_completo)) {
      console.error('❌ [BACKEND][SYNC] Campos faltantes:', {
        firebase_uid,
        email,
        nombre,
        nombre_completo,
      });
      return res.status(400).json({
        success: false,
        code: 'MISSING_FIELDS',
        message: 'firebase_uid, email y (nombre o nombre_completo) son requeridos',
      });
    }

    // Usar nombre_completo si está disponible, sino usar nombre
    const nombreFinal = nombre_completo || nombre;
    console.log('✅ [BACKEND][SYNC] Nombre final a usar:', nombreFinal);

    // Verificar si ya existe
    console.log('🔍 [BACKEND][SYNC] Verificando si usuario ya existe...');
    const existing = await executeQuery(
      'SELECT uid, empresa_id FROM usuarios WHERE uid = $1 OR email = $2',
      [firebase_uid, email]
    );

    console.log('🔍 [BACKEND][SYNC] Resultado verificación existencia:', existing);

    if (existing.success && existing.data.length > 0) {
      console.log('ℹ️ [BACKEND][SYNC] Usuario ya existe, retornando existente');
      return res.json({
        success: true,
        message: 'Usuario ya existía, sincronización omitida',
        data: {
          usuario: existing.data[0],
          alreadyExisted: true,
        },
      });
    }

    // Insertar nuevo
    console.log('➕ [BACKEND][SYNC] Insertando nuevo usuario con datos:', {
      firebase_uid,
      nombreFinal,
      email,
    });

    const insert = await executeQuery(
      `
      INSERT INTO usuarios (uid, nombre_completo, email, estado, preferencias)
      VALUES ($1, $2, $3, 'activo', '{"tema":"claro","idioma":"es"}')
      RETURNING uid, email, empresa_id, nombre_completo
    `,
      [firebase_uid, nombreFinal, email]
    );

    console.log('📊 [BACKEND][SYNC] Resultado inserción:', insert);

    if (!insert.success) {
      console.error('❌ [BACKEND][SYNC] Error en inserción:', insert.error);
      return res.status(500).json({
        success: false,
        code: 'DB_ERROR',
        message: 'Error insertando usuario',
        error: insert.error,
      });
    }

    console.log('✅ [BACKEND][SYNC] Usuario sincronizado exitosamente:', insert.data[0]);

    res.status(201).json({
      success: true,
      message: 'Usuario sincronizado correctamente',
      data: {
        usuario: insert.data[0],
        alreadyExisted: false,
      },
    });
  } catch (error) {
    console.error('💥 [BACKEND][SYNC] Error excepción:', error);
    res.status(500).json({
      success: false,
      code: 'INTERNAL_ERROR',
      message: 'Error interno en sincronización',
      error: error.message,
    });
  }
});

/**
 * GET /api/users/check-company/:uid
 * Verificar si un usuario tiene empresa configurada
 */
router.get('/check-company/:uid', async (req, res) => {
  try {
    const { uid } = req.params;

    const result = await executeQuery(
      `
      SELECT uid, empresa_id
      FROM usuarios 
      WHERE uid = $1
    `,
      [uid]
    );

    if (result.success && result.data.length > 0) {
      const user = result.data[0];
      res.json({
        success: true,
        data: {
          uid: user.uid,
          tiene_empresa: user.empresa_id !== null,
          empresa_id: user.empresa_id,
          setup_completed: user.empresa_id !== null, // <-- añadido
        },
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
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
 * GET /api/users
 * Obtiene todos los usuarios
 */
router.get('/', async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT 
        u.uid,
        u.nombre_completo,
        u.email,
        u.estado,
        u.preferencias,
        u.fecha_creacion,
        e.nombre as empresa_nombre,
        r.nombre_rol
      FROM usuarios u
      LEFT JOIN empresas e ON u.empresa_id = e.empresa_id
      LEFT JOIN roles r ON u.rol_id = r.rol_id
      ORDER BY u.fecha_creacion DESC
    `);

    if (result.success) {
      res.json({
        success: true,
        message: `Se encontraron ${result.data.length} usuarios`,
        data: result.data,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error al obtener usuarios',
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
 * GET /api/users/:uid
 * Obtiene un usuario específico por UID
 */
router.get('/:uid', async (req, res) => {
  try {
    const { uid } = req.params;

    const result = await executeQuery(
      `
      SELECT 
        u.uid,
        u.nombre_completo,
        u.email,
        u.estado,
        u.preferencias,
        u.fecha_creacion,
        e.empresa_id,
        e.nombre as empresa_nombre,
        e.ajustes as empresa_ajustes,
        r.rol_id,
        r.nombre_rol,
        r.permisos
      FROM usuarios u
      LEFT JOIN empresas e ON u.empresa_id = e.empresa_id
      LEFT JOIN roles r ON u.rol_id = r.rol_id
      WHERE u.uid = $1
    `,
      [uid]
    );

    if (result.success && result.data.length > 0) {
      res.json({
        success: true,
        message: 'Usuario encontrado',
        data: result.data[0],
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
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
 * POST /api/users
 * Crea un nuevo usuario
 */
router.post('/', async (req, res) => {
  try {
    const {
      uid,
      empresa_id,
      rol_id,
      nombre_completo,
      email,
      estado = 'activo',
      preferencias = {},
    } = req.body;

    if (!uid || !nombre_completo || !email) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: uid, nombre_completo, email',
      });
    }

    const result = await executeQuery(
      `
      INSERT INTO usuarios (uid, empresa_id, rol_id, nombre_completo, email, estado, preferencias)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `,
      [uid, empresa_id, rol_id, nombre_completo, email, estado, JSON.stringify(preferencias)]
    );

    if (result.success) {
      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: result.data[0],
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error al crear usuario',
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
 * PUT /api/users/:uid
 * Actualiza un usuario existente
 */
router.put('/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const { nombre_completo, email, estado, preferencias } = req.body;

    if (!nombre_completo && !email && !estado && !preferencias) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere al menos un campo para actualizar',
      });
    }

    // Construir query dinámicamente
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (nombre_completo) {
      updates.push(`nombre_completo = $${paramCount++}`);
      values.push(nombre_completo);
    }
    if (email) {
      updates.push(`email = $${paramCount++}`);
      values.push(email);
    }
    if (estado) {
      updates.push(`estado = $${paramCount++}`);
      values.push(estado);
    }
    if (preferencias) {
      updates.push(`preferencias = $${paramCount++}`);
      values.push(JSON.stringify(preferencias));
    }

    values.push(uid); // Para el WHERE

    const query = `
      UPDATE usuarios 
      SET ${updates.join(', ')}
      WHERE uid = $${paramCount}
      RETURNING *
    `;

    const result = await executeQuery(query, values);

    if (result.success && result.data.length > 0) {
      res.json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: result.data[0],
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
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
 * GET /api/users/company/:companyId
 * Obtiene todos los usuarios de una empresa específica
 */
router.get('/company/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;

    const result = await executeQuery(
      `
      SELECT 
        u.uid,
        u.nombre_completo,
        u.email,
        u.estado,
        u.fecha_creacion,
        r.nombre_rol,
        r.permisos
      FROM usuarios u
      LEFT JOIN roles r ON u.rol_id = r.rol_id
      WHERE u.empresa_id = $1
      ORDER BY u.fecha_creacion DESC
    `,
      [companyId]
    );

    if (result.success) {
      res.json({
        success: true,
        message: `Se encontraron ${result.data.length} usuarios para la empresa`,
        data: result.data,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error al obtener usuarios de la empresa',
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
 * POST /api/users/create-test-data
 * Crear datos de prueba para desarrollo (usuarios y empresa)
 */
router.post('/create-test-data', async (req, res) => {
  try {
    console.log('🧪 Creando datos de prueba para desarrollo...');

    const testTransaction = await executeTransaction(async (client) => {
      // 1. Verificar si ya existe el usuario de prueba
      const existingUser = await client.query('SELECT uid FROM usuarios WHERE uid = $1', [
        'test_user_123',
      ]);

      if (existingUser.rows.length > 0) {
        return { message: 'Datos de prueba ya existen', skipped: true };
      }

      // 2. Crear empresa de prueba
      const empresaResult = await client.query(`
        INSERT INTO empresas (nombre, tipo_empresa_id, plan_id, estado_suscripcion, fecha_fin_prueba, fecha_creacion)
        VALUES ('Ferretería de Prueba', 1, 1, 'en_prueba', NOW() + INTERVAL '30 days', NOW())
        RETURNING empresa_id
      `);
      const empresaId = empresaResult.rows[0].empresa_id;

      // 3. Crear rol administrador para la empresa
      const rolResult = await client.query(
        `
        INSERT INTO roles (empresa_id, nombre_rol, permisos, es_predeterminado, estado, fecha_creacion)
        VALUES ($1, 'Administrador', '{"all": true}', true, 'activo', NOW())
        RETURNING rol_id
      `,
        [empresaId]
      );
      const rolId = rolResult.rows[0].rol_id;

      // 4. Crear usuario de prueba
      const userResult = await client.query(
        `
        INSERT INTO usuarios (uid, empresa_id, rol_id, nombre_completo, email, estado, preferencias, fecha_creacion)
        VALUES ('test_user_123', $1, $2, 'Usuario de Prueba', 'test@ferreteria.com', 'activo', '{"tema": "claro", "idioma": "es"}', NOW())
        RETURNING *
      `,
        [empresaId, rolId]
      );

      // 5. Crear algunos usuarios adicionales para la empresa
      await client.query(
        `
        INSERT INTO usuarios (uid, empresa_id, rol_id, nombre_completo, email, estado, preferencias, fecha_creacion)
        VALUES 
        ('test_user_456', $1, $2, 'María García', 'maria@ferreteria.com', 'activo', '{"tema": "claro", "idioma": "es"}', NOW()),
        ('test_user_789', $1, $2, 'Carlos López', 'carlos@ferreteria.com', 'activo', '{"tema": "claro", "idioma": "es"}', NOW())
      `,
        [empresaId, rolId]
      );

      return {
        empresa_id: empresaId,
        rol_id: rolId,
        usuario_principal: userResult.rows[0],
        message: 'Datos de prueba creados exitosamente',
      };
    });

    if (!testTransaction.success) {
      return res.status(500).json({
        success: false,
        message: 'Error creando datos de prueba',
        error: testTransaction.error,
      });
    }

    console.log('✅ Datos de prueba creados:', testTransaction.data);

    res.json({
      success: true,
      message: testTransaction.data.message,
      data: testTransaction.data,
      skipped: testTransaction.data.skipped || false,
    });
  } catch (error) {
    console.error('💥 Error creando datos de prueba:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno creando datos de prueba',
      error: error.message,
    });
  }
});

export default router;
