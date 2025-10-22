const express = require('express');
const router = express.Router();

/**
 * Endpoint de debug para diagnosticar Firebase
 */
router.get('/firebase-debug', async (req, res) => {
  try {
    console.log('🔍 Iniciando debug de Firebase...');

    // Verificar variables de entorno
    const envVars = {
      FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
      FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
      FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY_ID: !!process.env.FIREBASE_PRIVATE_KEY_ID,
      FIREBASE_CLIENT_ID: !!process.env.FIREBASE_CLIENT_ID,
    };

    console.log('🔍 Variables de entorno Firebase:', envVars);

    // Intentar inicializar Firebase
    let firebaseStatus = 'no-inicializado';
    let firebaseError = null;

    try {
      const { firebaseAuth } = require('../utils/firebaseAdmin');

      // Intentar crear un usuario de prueba
      const testResult = await firebaseAuth.createUser(
        'test-debug@test.com',
        'TestPassword123!',
        'Test Debug User'
      );

      if (testResult.success) {
        firebaseStatus = 'funcionando';
        // Limpiar usuario de prueba
        await firebaseAuth.deleteUser(testResult.uid);
      } else {
        firebaseStatus = 'error-creacion';
        firebaseError = testResult.error;
      }
    } catch (error) {
      firebaseStatus = 'error-inicializacion';
      firebaseError = error.message;
      console.error('❌ Error en debug de Firebase:', error);
    }

    res.json({
      timestamp: new Date().toISOString(),
      firebase: {
        status: firebaseStatus,
        error: firebaseError,
        environmentVariables: envVars,
      },
      environment: process.env.NODE_ENV || 'development',
      platform: process.platform,
      nodeVersion: process.version,
    });
  } catch (error) {
    console.error('❌ Error crítico en debug:', error);
    res.status(500).json({
      error: 'Error crítico en debug',
      message: error.message,
    });
  }
});

/**
 * Endpoint para crear usuario admin de prueba
 */
router.post('/create-admin-user', async (req, res) => {
  try {
    const pool = require('../db');

    // Crear usuario admin en PostgreSQL
    const adminUser = {
      uid: 'admin-test-uid-' + Date.now(),
      email: 'admin@innovapaz.com',
      nombre_completo: 'Administrador de Prueba',
      password: 'admin123',
      empresa_id: null,
      rol_id: null,
      estado: 'activo',
    };

    const insertQuery = `
      INSERT INTO usuarios (uid, email, nombre_completo, password, empresa_id, rol_id, estado, fecha_creacion)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (email) 
      DO UPDATE SET 
        password = EXCLUDED.password,
        fecha_actualizacion = NOW()
      RETURNING uid, email, nombre_completo, estado
    `;

    const result = await pool.query(insertQuery, [
      adminUser.uid,
      adminUser.email,
      adminUser.nombre_completo,
      adminUser.password,
      adminUser.empresa_id,
      adminUser.rol_id,
      adminUser.estado,
    ]);

    res.json({
      message: 'Usuario admin creado/actualizado exitosamente',
      usuario: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Error creando usuario admin:', error);
    res.status(500).json({
      error: 'Error creando usuario admin',
      message: error.message,
    });
  }
});

/**
 * Endpoint para verificar conexión con base de datos
 */
router.get('/db-debug', async (req, res) => {
  try {
    const pool = require('../db');

    // Test básico de conexión
    const result = await pool.query('SELECT NOW() as timestamp, version() as postgres_version');

    // Verificar si existe tabla usuarios
    const tableCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'usuarios'
    `);

    // Contar usuarios existentes
    const userCount = await pool.query('SELECT COUNT(*) as total FROM usuarios');

    res.json({
      database: {
        status: 'conectado',
        timestamp: result.rows[0].timestamp,
        version: result.rows[0].postgres_version,
        tablaUsuarios: tableCheck.rows.length > 0,
        totalUsuarios: parseInt(userCount.rows[0].total),
      },
    });
  } catch (error) {
    console.error('❌ Error en debug de DB:', error);
    res.status(500).json({
      database: {
        status: 'error',
        error: error.message,
      },
    });
  }
});

module.exports = router;
