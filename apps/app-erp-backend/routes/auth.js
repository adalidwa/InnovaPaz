import express from 'express';
import { executeQuery, executeTransaction } from '../utils/database.js';
import { firebaseAuth } from '../utils/firebaseAdmin.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * El Coordinador maneja el registro completo: Firebase Auth + PostgreSQL
 */
router.post('/register', async (req, res) => {
  try {
    const { nombre_completo, email, password, empresa_nombre, tipo_empresa_id, plan_id } = req.body;

    if (!nombre_completo || !email || !password) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_FIELDS',
        message: 'Faltan campos requeridos: nombre_completo, email, password',
      });
    }

    console.log('🔄 Coordinador iniciando registro para:', email);

    // PASO 1: El Coordinador habla con el Guardia (Firebase Auth)
    console.log('📞 Coordinador → Guardia: Creando identidad...');
    const firebaseResult = await firebaseAuth.createUser(email, password, nombre_completo);

    if (!firebaseResult.success) {
      return res.status(400).json({
        success: false,
        code: 'FIREBASE_CREATE_ERROR',
        message: 'Error creando usuario en Firebase Auth',
        error: firebaseResult.error,
      });
    }

    const { uid } = firebaseResult;
    console.log(`✅ Guardia respondió con cédula: ${uid}`);

    // PASO 2: El Coordinador habla con el Gerente (PostgreSQL)
    console.log('📞 Coordinador → Gerente: Archivando expediente...');

    const dbResult = await executeTransaction(async (client) => {
      let empresa_id = null;

      // Si se proporciona información de empresa, crearla
      if (empresa_nombre) {
        const empresaResult = await client.query(
          `
          INSERT INTO empresas (nombre, tipo_empresa_id, plan_id, estado_suscripcion)
          VALUES ($1, $2, $3, 'en_prueba')
          RETURNING empresa_id
        `,
          [empresa_nombre, tipo_empresa_id, plan_id]
        );

        empresa_id = empresaResult.rows[0].empresa_id;
        console.log(`✅ Gerente creó empresa: ${empresa_id}`);
      }

      // Crear el usuario en PostgreSQL
      const userResult = await client.query(
        `
        INSERT INTO usuarios (uid, empresa_id, nombre_completo, email, estado, preferencias)
        VALUES ($1, $2, $3, $4, 'activo', '{"tema": "claro", "idioma": "es"}')
        RETURNING *
      `,
        [uid, empresa_id, nombre_completo, email]
      );

      console.log(`✅ Gerente archivó expediente del usuario: ${uid}`);

      return {
        usuario: userResult.rows[0],
        empresa_id,
      };
    });

    if (!dbResult.success) {
      // Si falla PostgreSQL, limpiamos Firebase Auth
      console.log('❌ Error en Gerente, limpiando Guardia...');
      await firebaseAuth.deleteUser(uid);

      return res.status(500).json({
        success: false,
        code: 'DB_TRANSACTION_ERROR',
        message: 'Error guardando datos en la base de datos',
        error: dbResult.error,
      });
    }

    console.log('🎉 Coordinador completó registro exitosamente');

    // PASO 3: Respuesta exitosa
    res.status(201).json({
      success: true,
      code: 'REGISTER_OK',
      message: 'Usuario registrado exitosamente',
      data: {
        uid: uid,
        email: email,
        nombre_completo: nombre_completo,
        empresa_id: dbResult.data.empresa_id,
        usuario: dbResult.data.usuario,
      },
    });
  } catch (error) {
    console.error('💥 Error en el Coordinador:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
});

/**
 * POST /api/auth/login
 * El Coordinador maneja el login: verifica Firebase Auth + obtiene datos de PostgreSQL
 */
router.post('/login', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_TOKEN',
        message: 'Token de Firebase requerido',
      });
    }

    console.log('🔄 Coordinador verificando login...');

    // PASO 1: Verificar con el Guardia (Firebase Auth)
    console.log('📞 Coordinador → Guardia: Verificando identidad...');
    const firebaseResult = await firebaseAuth.verifyToken(idToken);

    if (!firebaseResult.success) {
      return res.status(401).json({
        success: false,
        code: 'INVALID_TOKEN',
        message: 'Token inválido',
        error: firebaseResult.error,
      });
    }

    const { uid } = firebaseResult;
    console.log(`✅ Guardia verificó cédula: ${uid}`);

    // PASO 2: Obtener datos del Gerente (PostgreSQL)
    console.log('📞 Coordinador → Gerente: Buscando expediente...');
    const userResult = await executeQuery(
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

    if (!userResult.success || userResult.data.length === 0) {
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_FOUND_DB',
        message: 'Usuario no encontrado en la base de datos',
      });
    }

    const userData = userResult.data[0];
    console.log(`✅ Gerente encontró expediente: ${userData.nombre_completo}`);

    // PASO 3: Respuesta exitosa
    res.json({
      success: true,
      code: 'LOGIN_OK',
      message: 'Login exitoso',
      data: {
        user: userData,
        firebase: {
          uid: uid,
          email: firebaseResult.email,
        },
      },
    });
  } catch (error) {
    console.error('💥 Error en el Coordinador durante login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
});

/**
 * POST /api/auth/simple-register
 * Registro simple para el frontend de marketing (SIN Firebase por ahora)
 */
router.post('/simple-register', async (req, res) => {
  try {
    const { email, password, nombre, apellido } = req.body;

    // Validaciones básicas
    if (!email || !password || !nombre) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_FIELDS',
        message: 'Email, contraseña y nombre son obligatorios',
      });
    }

    // Crear nombre completo
    const nombre_completo = apellido ? `${nombre} ${apellido}` : nombre;

    console.log('🔄 Registro simple (sin Firebase) para:', email);

    // Generar UID temporal (en producción esto vendría de Firebase)
    const uid = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Crear usuario directamente en PostgreSQL
    console.log('📞 Coordinador → Gerente: Archivando expediente...');

    const dbResult = await executeTransaction(async (client) => {
      // Verificar si el email ya existe
      const existingUser = await client.query(
        `
        SELECT uid FROM usuarios WHERE email = $1
      `,
        [email]
      );

      if (existingUser.rows.length > 0) {
        throw new Error('EMAIL_ALREADY_EXISTS');
      }

      const userResult = await client.query(
        `
        INSERT INTO usuarios (uid, nombre_completo, email, estado, preferencias)
        VALUES ($1, $2, $3, 'activo', '{"tema": "claro", "idioma": "es"}')
        RETURNING *
      `,
        [uid, nombre_completo, email]
      );

      console.log(`✅ Gerente archivó expediente: ${uid}`);
      return { usuario: userResult.rows[0] };
    });

    if (!dbResult.success) {
      if (dbResult.error.includes('EMAIL_ALREADY_EXISTS')) {
        return res.status(400).json({
          success: false,
          code: 'EMAIL_ALREADY_EXISTS',
          message: 'Ya existe una cuenta con ese correo electrónico',
        });
      }

      return res.status(500).json({
        success: false,
        code: 'DB_ERROR',
        message: 'Error guardando datos en la base de datos',
        error: dbResult.error,
      });
    }

    console.log('🎉 Registro simple completado exitosamente');

    // PASO 3: Respuesta exitosa
    res.status(201).json({
      success: true,
      code: 'SIMPLE_REGISTER_OK',
      message: 'Usuario registrado exitosamente',
      data: {
        user: {
          id: uid,
          firebase_uid: uid,
          email: email,
          nombre: nombre,
          apellido: apellido || '',
          nombre_completo: nombre_completo,
          estado: 'activo',
          empresa_id: null,
          setup_completed: false,
        },
      },
    });
  } catch (error) {
    console.error('💥 Error en registro simple:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
});

/**
 * POST /api/auth/simple-login
 * Login simple con email y contraseña (versión simplificada para testing)
 */
router.post('/simple-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_FIELDS',
        message: 'Email y contraseña son requeridos',
      });
    }

    console.log('🔄 Login simple para:', email);

    // Para propósitos de testing, buscaremos el usuario directamente en PostgreSQL
    // En un escenario real, esto se haría con Firebase Auth primero

    // PASO 1: Verificar si el usuario existe en PostgreSQL
    const userResult = await executeQuery(
      `
      SELECT 
        u.uid,
        u.nombre_completo,
        u.email,
        u.estado,
        u.empresa_id,
        u.fecha_creacion,
        e.nombre as empresa_nombre
      FROM usuarios u
      LEFT JOIN empresas e ON u.empresa_id = e.empresa_id
      WHERE u.email = $1 AND u.estado = 'activo'
    `,
      [email]
    );

    if (!userResult.success || userResult.data.length === 0) {
      return res.status(401).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'Credenciales inválidas',
      });
    }

    const userData = userResult.data[0];
    console.log(`✅ Usuario encontrado: ${userData.nombre_completo}`);

    // Para el testing en desarrollo, aceptaremos cualquier contraseña
    // En producción, esto se verificaría con Firebase Auth
    console.log('⚠️ Modo desarrollo: aceptando cualquier contraseña para', email);

    // Dividir nombre completo en nombre y apellido para el frontend
    const nombreParts = userData.nombre_completo.split(' ');
    const nombre = nombreParts[0] || '';
    const apellido = nombreParts.slice(1).join(' ') || '';

    // PASO 2: Respuesta exitosa
    res.json({
      success: true,
      code: 'SIMPLE_LOGIN_OK',
      message: 'Login exitoso',
      data: {
        user: {
          id: userData.uid,
          firebase_uid: userData.uid,
          email: userData.email,
          nombre: nombre,
          apellido: apellido,
          nombre_completo: userData.nombre_completo,
          estado: userData.estado,
          empresa_id: userData.empresa_id,
          empresa_nombre: userData.empresa_nombre,
          setup_completed: !!userData.empresa_id,
        },
      },
    });
  } catch (error) {
    console.error('💥 Error en login simple:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
});

/**
 * GET /api/auth/me
 * Obtiene el usuario actual desde la sesión/token
 */
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
      return res.status(401).json({
        success: false,
        code: 'NO_TOKEN',
        message: 'Token de autorización requerido',
      });
    }

    console.log('🔄 Verificando token de usuario actual...');

    // Verificar token con Firebase si está disponible
    let uid = null;
    try {
      const firebaseResult = await firebaseAuth.verifyToken(token);
      if (firebaseResult.success) {
        uid = firebaseResult.uid;
        console.log(`✅ Token verificado para UID: ${uid}`);
      }
    } catch (firebaseError) {
      // Si no hay Firebase, usar token como UID temporal para desarrollo
      if (token.startsWith('temp_')) {
        uid = token;
        console.log(`⚠️ Usando token temporal como UID: ${uid}`);
      } else {
        return res.status(401).json({
          success: false,
          code: 'INVALID_TOKEN',
          message: 'Token inválido',
        });
      }
    }

    if (!uid) {
      return res.status(401).json({
        success: false,
        code: 'TOKEN_DECODE_ERROR',
        message: 'No se pudo extraer UID del token',
      });
    }

    // Obtener datos completos del usuario desde PostgreSQL
    const userResult = await executeQuery(
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
      WHERE u.uid = $1 AND u.estado = 'activo'
    `,
      [uid]
    );

    if (!userResult.success || userResult.data.length === 0) {
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'Usuario no encontrado o inactivo',
      });
    }

    const userData = userResult.data[0];
    console.log(`✅ Usuario actual obtenido: ${userData.nombre_completo}`);

    res.json({
      success: true,
      message: 'Usuario actual obtenido exitosamente',
      data: {
        user: userData,
        authenticated: true,
        has_company: !!userData.empresa_id,
        setup_completed: !!userData.empresa_id,
      },
    });
  } catch (error) {
    console.error('💥 Error obteniendo usuario actual:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
});

export default router;
