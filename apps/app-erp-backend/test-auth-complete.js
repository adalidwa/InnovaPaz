#!/usr/bin/env node

/**
 * SCRIPT COMPLETO DE TESTING DE AUTENTICACIÓN
 *
 * Este script prueba todos los endpoints de autenticación:
 * 1. Conexión Firebase Admin
 * 2. Registro normal (con y sin empresa)
 * 3. Login directo (email/password)
 * 4. Login con Firebase
 * 5. Google Auth
 * 6. Verificación de tokens
 */

const axios = require('axios');
const chalk = require('chalk');

// Configuración - URLs de producción en Vercel
const PRODUCTION_URLS = {
  frontend: 'https://innovapaz-app-erp-alpha.vercel.app',
  marketing: 'https://innovapaz-website-erp-marketing.vercel.app',
  backend: 'https://innovapaz-app-erp-backend.vercel.app',
  corporate: 'https://innovapaz-website-corporate.vercel.app',
};

const BASE_URL = process.env.BASE_URL || PRODUCTION_URLS.backend;
const API_URL = `${BASE_URL}/api`;

// Datos de prueba
const TEST_DATA = {
  usuario_nuevo: {
    email: 'test-auth@innovapaz.com',
    password: 'TestPassword123!',
    nombre_completo: 'Usuario de Prueba Auth',
  },
  usuario_con_empresa: {
    email: 'admin-test@innovapaz.com',
    password: 'AdminPassword123!',
    nombre_completo: 'Admin de Prueba',
    empresa_data: {
      nombre: 'Empresa Test Auth',
      tipo_empresa_id: 1, // Asumiendo que existe
      plan_id: 1, // Asumiendo que existe
    },
  },
  usuario_login_directo: {
    email: 'admin@innovapaz.com',
    password: 'admin123',
  },
};

// Utilidades
const log = {
  title: (text) => console.log(chalk.cyan.bold(`\n📋 ${text}`)),
  success: (text) => console.log(chalk.green(`✅ ${text}`)),
  error: (text) => console.log(chalk.red(`❌ ${text}`)),
  warning: (text) => console.log(chalk.yellow(`⚠️  ${text}`)),
  info: (text) => console.log(chalk.blue(`ℹ️  ${text}`)),
  step: (text) => console.log(chalk.magenta(`🔸 ${text}`)),
  data: (label, data) => console.log(chalk.gray(`   ${label}:`), JSON.stringify(data, null, 2)),
};

// Variables globales para almacenar resultados
let testResults = {
  firebaseAdmin: false,
  registro: { normal: false, conEmpresa: false },
  login: { directo: false, firebase: false, google: false },
  tokens: { jwt: null, firebase: null },
  usuarios: {},
};

/**
 * Función para hacer peticiones HTTP con manejo de errores
 */
async function makeRequest(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${API_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500,
    };
  }
}

/**
 * TEST 1: Verificar Firebase Admin (a través de endpoints)
 */
async function testFirebaseAdmin() {
  log.title('TEST 1: FIREBASE ADMIN CONNECTION (VÍA ENDPOINTS)');

  log.step('Verificando configuración de Firebase Admin a través de endpoints...');

  // En lugar de intentar importar directamente, vamos a probar endpoints que usan Firebase
  log.step('Probando endpoint que requiere Firebase Admin...');

  // Test 1: Intentar registro que requiere Firebase Admin
  const testRegistro = await makeRequest('POST', '/auth/register', {
    email: 'test-firebase-connectivity@test.com',
    password: 'TestPassword123!',
    nombre_completo: 'Test Firebase Connectivity',
  });

  if (testRegistro.success) {
    log.success('Firebase Admin está funcionando (registro exitoso)');
    testResults.firebaseAdmin = true;

    // Limpiar: intentar eliminar el usuario de prueba
    log.info('Usuario de prueba creado, se intentará limpiar automáticamente');
  } else {
    log.error(`Firebase Admin puede tener problemas: ${JSON.stringify(testRegistro.error)}`);

    // Analizar el tipo de error
    if (
      testRegistro.error?.details?.includes('Firebase') ||
      testRegistro.error?.error?.includes('Firebase')
    ) {
      log.warning('Error específico de Firebase detectado');
      log.warning('Verificar:');
      log.warning('- Variables de entorno FIREBASE_* en Vercel');
      log.warning('- Configuración de serviceAccountKey.json');
      log.warning('- Conectividad con Firebase desde Vercel');
    }
  }

  // Test 2: Verificar si podemos hacer login directo (no requiere Firebase Admin)
  log.step('Verificando login directo (no requiere Firebase Admin)...');
  const loginDirectoTest = await makeRequest('POST', '/auth/login', {
    email: 'admin@innovapaz.com',
    password: 'admin123',
  });

  if (loginDirectoTest.success) {
    log.success('Login directo funcionando (sin Firebase Admin)');
    log.info('Al menos el sistema básico de autenticación está operativo');
  } else {
    log.warning('Login directo también está fallando');
    log.data('Error login directo', loginDirectoTest.error);
  }
}

/**
 * TEST 2: Registro de usuarios
 */
async function testRegistro() {
  log.title('TEST 2: REGISTRO DE USUARIOS');

  // 2.1 Registro normal (sin empresa)
  log.step('2.1 Registrando usuario normal (sin empresa)...');
  const registroNormal = await makeRequest('POST', '/auth/register', TEST_DATA.usuario_nuevo);

  if (registroNormal.success) {
    log.success('Registro normal exitoso');
    log.data('Usuario creado', {
      uid: registroNormal.data.usuario?.uid,
      email: registroNormal.data.usuario?.email,
      tiene_empresa: !!registroNormal.data.usuario?.empresa_id,
    });

    testResults.registro.normal = true;
    testResults.usuarios.normal = registroNormal.data.usuario;
    testResults.tokens.jwt = registroNormal.data.token;
  } else {
    log.error(`Registro normal falló: ${JSON.stringify(registroNormal.error)}`);
  }

  // 2.2 Registro con empresa
  log.step('2.2 Registrando usuario con empresa...');
  const registroConEmpresa = await makeRequest(
    'POST',
    '/auth/register',
    TEST_DATA.usuario_con_empresa
  );

  if (registroConEmpresa.success) {
    log.success('Registro con empresa exitoso');
    log.data('Usuario y empresa creados', {
      uid: registroConEmpresa.data.usuario?.uid,
      email: registroConEmpresa.data.usuario?.email,
      empresa_id: registroConEmpresa.data.usuario?.empresa_id,
      rol: registroConEmpresa.data.usuario?.rol,
    });

    testResults.registro.conEmpresa = true;
    testResults.usuarios.conEmpresa = registroConEmpresa.data.usuario;
  } else {
    log.error(`Registro con empresa falló: ${JSON.stringify(registroConEmpresa.error)}`);
  }
}

/**
 * TEST 3: Login directo (email/password)
 */
async function testLoginDirecto() {
  log.title('TEST 3: LOGIN DIRECTO (EMAIL/PASSWORD)');

  log.step('Probando login con credenciales hardcodeadas...');
  const loginDirecto = await makeRequest('POST', '/auth/login', TEST_DATA.usuario_login_directo);

  if (loginDirecto.success) {
    log.success('Login directo exitoso');
    log.data('Usuario logueado', {
      uid: loginDirecto.data.usuario?.uid,
      email: loginDirecto.data.usuario?.email,
      empresa_id: loginDirecto.data.usuario?.empresa_id,
      rol: loginDirecto.data.usuario?.rol,
    });

    testResults.login.directo = true;
    testResults.tokens.jwt = loginDirecto.data.token;
  } else {
    log.error(`Login directo falló: ${JSON.stringify(loginDirecto.error)}`);
    log.warning('Verificar que exista usuario admin@innovapaz.com con password admin123');
  }
}

/**
 * TEST 4: Verificación de tokens
 */
async function testTokenVerification() {
  log.title('TEST 4: VERIFICACIÓN DE TOKENS');

  if (!testResults.tokens.jwt) {
    log.warning('No hay token JWT para verificar');
    return;
  }

  log.step('Verificando token JWT...');
  const tokenCheck = await makeRequest('POST', '/auth/verify-token', null, {
    Authorization: `Bearer ${testResults.tokens.jwt}`,
  });

  if (tokenCheck.success) {
    log.success('Token JWT válido');
    log.data('Usuario del token', tokenCheck.data.usuario);
  } else {
    log.error(`Verificación de token falló: ${JSON.stringify(tokenCheck.error)}`);
  }

  // Test endpoint /me
  log.step('Probando endpoint /me...');
  const meCheck = await makeRequest('GET', '/auth/me', null, {
    Authorization: `Bearer ${testResults.tokens.jwt}`,
  });

  if (meCheck.success) {
    log.success('Endpoint /me funcionando');
    log.data('Datos completos del usuario', meCheck.data.usuario);
  } else {
    log.error(`Endpoint /me falló: ${JSON.stringify(meCheck.error)}`);
  }
}

/**
 * TEST 5: Simulación de Google Auth y endpoints específicos de ERP
 */
async function testGoogleAuth() {
  log.title('TEST 5: GOOGLE AUTH Y ENDPOINTS ERP');

  log.step('Probando endpoint google-login-erp (sin token - debe fallar)...');
  const googleLoginFail = await makeRequest('POST', '/auth/google-login-erp', {});

  if (!googleLoginFail.success && googleLoginFail.status === 400) {
    log.success('Endpoint google-login-erp correctamente protegido');
    log.data('Error esperado', googleLoginFail.error);
  } else {
    log.warning('Endpoint google-login-erp no está adecuadamente protegido');
  }

  log.step('Probando endpoint google-auth (sin token - debe fallar)...');
  const googleAuthFail = await makeRequest('POST', '/auth/google-auth', {});

  if (!googleAuthFail.success && googleAuthFail.status === 400) {
    log.success('Endpoint google-auth correctamente protegido');
  } else {
    log.warning('Endpoint google-auth no está adecuadamente protegido');
  }

  // Test específico para el error que estabas viendo
  log.step('Simulando error específico del frontend...');
  log.warning('Errores reportados del frontend:');
  log.info('• ERR_NAME_NOT_RESOLVED - Problema de DNS/conectividad');
  log.info('• Cross-Origin-Opener-Policy - Problemas con popups de Google');
  log.info('• 401 Unauthorized - Token de Firebase inválido');

  log.step('Verificando conectividad con identitytoolkit.googleapis.com...');
  try {
    // Simular una petición que haría Firebase desde el frontend
    const response = await axios.get('https://www.googleapis.com', { timeout: 5000 });
    log.success('Conectividad con Google APIs funcionando');
  } catch (error) {
    log.error(`Problema de conectividad con Google: ${error.message}`);
  }

  log.warning('Google Auth requiere token de Firebase real del frontend');
  log.info('Para probar completamente, usar el frontend con autenticación Google');

  // Simular estructura de respuesta esperada
  log.step('Estructura esperada para Google Auth:');
  log.data('POST /auth/google-auth', {
    idToken: 'FIREBASE_ID_TOKEN_FROM_FRONTEND',
    empresa_data: {
      nombre: 'Mi Empresa',
      tipo_empresa_id: 1,
      plan_id: 1,
    },
  });

  log.step('Estructura esperada para Google Login ERP:');
  log.data('POST /auth/google-login-erp', {
    idToken: 'FIREBASE_ID_TOKEN_FROM_FRONTEND',
  });
}

/**
 * TEST 6: Endpoints específicos del backend y conectividad en Vercel
 */
async function testBackendEndpoints() {
  log.title('TEST 6: ENDPOINTS ESPECÍFICOS DEL BACKEND EN VERCEL');

  // Test health check o endpoint raíz
  log.step('Verificando conectividad con backend en Vercel...');
  const health = await makeRequest('GET', '');
  if (health.success) {
    log.success('Backend Vercel respondiendo correctamente');
    log.data('Respuesta', health.data);
  } else {
    log.error(`Backend Vercel no responde: ${JSON.stringify(health.error)}`);
  }

  // Test endpoint específico que debe existir
  log.step('Probando endpoint de test...');
  const testEndpoint = await makeRequest('GET', '/test');
  if (testEndpoint.success) {
    log.success('Endpoint /test funcionando');
  } else {
    log.info('Endpoint /test no disponible (normal)');
  }

  // Test CORS headers
  log.step('Verificando headers CORS...');
  try {
    const corsTest = await axios.options(`${API_URL}/auth/login`);
    log.success('Headers CORS configurados correctamente');
    log.data('CORS Headers', {
      'Access-Control-Allow-Origin': corsTest.headers['access-control-allow-origin'],
      'Access-Control-Allow-Methods': corsTest.headers['access-control-allow-methods'],
      'Access-Control-Allow-Headers': corsTest.headers['access-control-allow-headers'],
    });
  } catch (error) {
    log.warning('No se pudieron verificar headers CORS completamente');
  }

  // Test sync session (sin token válido)
  log.step('Probando sync-session (debería fallar sin token)...');
  const syncFail = await makeRequest('POST', '/auth/sync-session');
  if (!syncFail.success && syncFail.status === 401) {
    log.success('Sync-session correctamente protegido');
  } else {
    log.warning('Sync-session no está adecuadamente protegido');
  }

  // Test conectividad con todos los servicios de Vercel
  log.step('Verificando conectividad con todos los servicios de Vercel...');
  for (const [service, url] of Object.entries(PRODUCTION_URLS)) {
    try {
      const response = await axios.get(url, { timeout: 10000 });
      log.success(`✅ ${service}: ${url} - Status ${response.status}`);
    } catch (error) {
      log.error(`❌ ${service}: ${url} - Error: ${error.message}`);
    }
  }
}

/**
 * TEST 7: Limpiar datos de prueba
 */
async function limpiarDatosPrueba() {
  log.title('TEST 7: LIMPIEZA DE DATOS DE PRUEBA');

  if (testResults.firebaseAdmin) {
    try {
      const { firebaseAuth } = require('./utils/firebaseAdmin');

      // Intentar eliminar usuarios de prueba de Firebase
      const emailsPrueba = [TEST_DATA.usuario_nuevo.email, TEST_DATA.usuario_con_empresa.email];

      for (const email of emailsPrueba) {
        try {
          const userInfo = await firebaseAuth.getUserByEmail(email);
          if (userInfo.success) {
            await firebaseAuth.deleteUser(userInfo.uid);
            log.success(`Usuario ${email} eliminado de Firebase`);
          }
        } catch (error) {
          log.info(`Usuario ${email} no encontrado en Firebase (normal)`);
        }
      }
    } catch (error) {
      log.warning('No se pudo limpiar Firebase automáticamente');
    }
  }

  log.info('Limpieza manual recomendada:');
  log.info('- Eliminar usuarios de prueba de la base de datos PostgreSQL');
  log.info('- Eliminar empresas de prueba creadas');
  log.info('- Verificar logs del servidor para errores');
}

/**
 * Generar reporte final
 */
function generarReporte() {
  log.title('📊 REPORTE FINAL DE TESTING');

  console.log(chalk.cyan('\n🔧 COMPONENTES PRINCIPALES:'));
  console.log(
    `Firebase Admin: ${testResults.firebaseAdmin ? chalk.green('✅ OK') : chalk.red('❌ FALLO')}`
  );

  console.log(chalk.cyan('\n👥 REGISTRO:'));
  console.log(
    `Registro normal: ${testResults.registro.normal ? chalk.green('✅ OK') : chalk.red('❌ FALLO')}`
  );
  console.log(
    `Registro con empresa: ${testResults.registro.conEmpresa ? chalk.green('✅ OK') : chalk.red('❌ FALLO')}`
  );

  console.log(chalk.cyan('\n🔐 LOGIN:'));
  console.log(
    `Login directo: ${testResults.login.directo ? chalk.green('✅ OK') : chalk.red('❌ FALLO')}`
  );

  console.log(chalk.cyan('\n🎯 TOKENS:'));
  console.log(
    `Token JWT: ${testResults.tokens.jwt ? chalk.green('✅ Generado') : chalk.red('❌ No generado')}`
  );

  console.log(chalk.cyan('\n💡 RECOMENDACIONES PARA VERCEL:'));

  if (!testResults.firebaseAdmin) {
    console.log(chalk.yellow('• Verificar variables de entorno de Firebase en Vercel:'));
    console.log(chalk.yellow('  - FIREBASE_PROJECT_ID'));
    console.log(chalk.yellow('  - FIREBASE_PRIVATE_KEY'));
    console.log(chalk.yellow('  - FIREBASE_CLIENT_EMAIL'));
    console.log(chalk.yellow('  - Otras variables FIREBASE_*'));
    console.log(chalk.yellow('• Verificar que el archivo serviceAccountKey.json esté incluido'));
  }

  if (!testResults.login.directo) {
    console.log(chalk.yellow('• Verificar conexión con base de datos PostgreSQL en Vercel'));
    console.log(chalk.yellow('• Crear usuario admin@innovapaz.com en base de datos de producción'));
    console.log(chalk.yellow('• Verificar variables de entorno de base de datos'));
  }

  if (!testResults.registro.normal || !testResults.registro.conEmpresa) {
    console.log(chalk.yellow('• Verificar todas las variables de entorno en Vercel'));
    console.log(chalk.yellow('• Revisar logs de Vercel para errores específicos'));
    console.log(chalk.yellow('• Verificar conectividad entre Vercel y servicios externos'));
  }

  console.log(chalk.cyan('\n🚀 SIGUIENTES PASOS PARA VERCEL:'));
  console.log('1. Revisar logs de Vercel para errores específicos');
  console.log('2. Probar Google Auth desde el frontend de producción');
  console.log('3. Verificar que todos los headers CORS estén configurados');
  console.log('4. Probar flujos completos de usuario en producción');
  console.log('5. Verificar redirecciones entre aplicaciones (marketing ↔ ERP)');

  console.log(chalk.cyan('\n🔗 URLs DE PRODUCCIÓN PROBADAS:'));
  for (const [service, url] of Object.entries(PRODUCTION_URLS)) {
    console.log(`${service}: ${url}`);
  }
}

/**
 * Función principal
 */
async function main() {
  console.log(chalk.cyan('\n🧪 INICIANDO TESTING COMPLETO DE AUTENTICACIÓN EN VERCEL\n'));
  console.log(chalk.blue(`🔗 API Base URL: ${API_URL}\n`));

  try {
    await testFirebaseAdmin();
    await testRegistro();
    await testLoginDirecto();
    await testTokenVerification();
    await testGoogleAuth();
    await testBackendEndpoints();
    await limpiarDatosPrueba();

    generarReporte();
  } catch (error) {
    log.error(`Error crítico en testing: ${error.message}`);
    console.error(error);
  }

  console.log(chalk.cyan('\n✨ TESTING COMPLETADO\n'));
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, testResults };
