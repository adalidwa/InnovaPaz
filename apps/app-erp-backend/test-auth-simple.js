#!/usr/bin/env node

/**
 * SCRIPT SIMPLE DE TESTING DE AUTENTICACIÓN EN VERCEL
 *
 * Prueba todos los endpoints de autenticación en producción
 */

const axios = require('axios');

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
      tipo_empresa_id: 1,
      plan_id: 1,
    },
  },
  usuario_login_directo: {
    email: 'admin@innovapaz.com',
    password: 'admin123',
  },
};

// Utilidades de logging simples
const log = {
  title: (text) => console.log(`\n📋 ${text}`),
  success: (text) => console.log(`✅ ${text}`),
  error: (text) => console.log(`❌ ${text}`),
  warning: (text) => console.log(`⚠️  ${text}`),
  info: (text) => console.log(`ℹ️  ${text}`),
  step: (text) => console.log(`🔸 ${text}`),
  data: (label, data) => console.log(`   ${label}:`, JSON.stringify(data, null, 2)),
};

let testResults = {
  firebaseAdmin: false,
  registro: { normal: false, conEmpresa: false },
  login: { directo: false, firebase: false, google: false },
  tokens: { jwt: null, firebase: null },
  usuarios: {},
  conectividad: {},
};

/**
 * Función para hacer peticiones HTTP
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
      timeout: 15000, // 15 segundos para Vercel
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
 * TEST 1: Verificar conectividad con todas las URLs de Vercel
 */
async function testConectividadVercel() {
  log.title('TEST 1: CONECTIVIDAD CON SERVICIOS DE VERCEL');

  for (const [service, url] of Object.entries(PRODUCTION_URLS)) {
    log.step(`Probando ${service}: ${url}`);
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'InnovaPaz-Testing-Script',
        },
      });
      log.success(`${service} - Status: ${response.status} ✅`);
      testResults.conectividad[service] = true;
    } catch (error) {
      log.error(`${service} - Error: ${error.message} ❌`);
      testResults.conectividad[service] = false;
    }
  }
}

/**
 * TEST 2: Verificar endpoints básicos del backend
 */
async function testBackendBasico() {
  log.title('TEST 2: ENDPOINTS BÁSICOS DEL BACKEND');

  // Test endpoint raíz
  log.step('Probando endpoint raíz del backend...');
  const rootTest = await makeRequest('GET', '');
  if (rootTest.success) {
    log.success('Backend responde correctamente');
    log.data('Respuesta', rootTest.data);
  } else {
    log.error('Backend no responde');
    log.data('Error', rootTest.error);
  }

  // Test endpoint de autenticación
  log.step('Probando estructura de endpoints de auth...');
  const authTest = await makeRequest('POST', '/auth/login', {});
  log.info(`Endpoint /auth/login responde con status: ${authTest.status}`);
}

/**
 * TEST 3: Login directo (email/password)
 */
async function testLoginDirecto() {
  log.title('TEST 3: LOGIN DIRECTO EN VERCEL');

  log.step('Intentando login con credenciales de prueba...');
  const loginResult = await makeRequest('POST', '/auth/login', TEST_DATA.usuario_login_directo);

  if (loginResult.success) {
    log.success('✅ Login directo EXITOSO');
    log.data('Usuario logueado', {
      uid: loginResult.data.usuario?.uid,
      email: loginResult.data.usuario?.email,
      empresa_id: loginResult.data.usuario?.empresa_id,
    });
    testResults.login.directo = true;
    testResults.tokens.jwt = loginResult.data.token;
  } else {
    log.error('❌ Login directo FALLÓ');
    log.data('Error detallado', loginResult.error);

    // Analizar el tipo de error
    if (loginResult.status === 400) {
      log.warning('Error 400: Verificar que exista el usuario admin@innovapaz.com');
    } else if (loginResult.status === 500) {
      log.warning('Error 500: Problema del servidor, revisar logs de Vercel');
    }
  }
}

/**
 * TEST 4: Registro de usuarios
 */
async function testRegistro() {
  log.title('TEST 4: REGISTRO DE USUARIOS EN VERCEL');

  log.step('Probando registro normal...');
  const registroResult = await makeRequest('POST', '/auth/register', TEST_DATA.usuario_nuevo);

  if (registroResult.success) {
    log.success('✅ Registro EXITOSO');
    log.data('Usuario creado', registroResult.data.usuario);
    testResults.registro.normal = true;
    testResults.firebaseAdmin = true; // Si el registro funciona, Firebase Admin funciona
  } else {
    log.error('❌ Registro FALLÓ');
    log.data('Error detallado', registroResult.error);

    // Analizar errores específicos de Firebase
    if (
      registroResult.error?.details?.includes('Firebase') ||
      registroResult.error?.error?.includes('Firebase')
    ) {
      log.warning('🔥 Error específico de Firebase detectado');
      log.warning('Verificar variables de entorno FIREBASE_* en Vercel');
    }
  }
}

/**
 * TEST 5: Verificación de tokens
 */
async function testTokens() {
  log.title('TEST 5: VERIFICACIÓN DE TOKENS');

  if (!testResults.tokens.jwt) {
    log.warning('No hay token JWT para verificar');
    return;
  }

  log.step('Verificando token JWT...');
  const tokenTest = await makeRequest('POST', '/auth/verify-token', null, {
    Authorization: `Bearer ${testResults.tokens.jwt}`,
  });

  if (tokenTest.success) {
    log.success('✅ Token JWT válido');
  } else {
    log.error('❌ Token JWT inválido');
  }

  // Test endpoint /me
  log.step('Probando endpoint /me...');
  const meTest = await makeRequest('GET', '/auth/me', null, {
    Authorization: `Bearer ${testResults.tokens.jwt}`,
  });

  if (meTest.success) {
    log.success('✅ Endpoint /me funcionando');
    log.data('Datos del usuario', meTest.data.usuario);
  } else {
    log.error('❌ Endpoint /me falló');
  }
}

/**
 * TEST 6: Google Auth endpoints
 */
async function testGoogleAuthEndpoints() {
  log.title('TEST 6: ENDPOINTS DE GOOGLE AUTH');

  log.step('Probando google-login-erp (sin token)...');
  const googleERP = await makeRequest('POST', '/auth/google-login-erp', {});

  if (!googleERP.success && googleERP.status === 400) {
    log.success('✅ Endpoint google-login-erp correctamente protegido');
  } else {
    log.warning('⚠️ Endpoint google-login-erp no está protegido adecuadamente');
  }

  log.step('Probando google-auth (sin token)...');
  const googleAuth = await makeRequest('POST', '/auth/google-auth', {});

  if (!googleAuth.success && googleAuth.status === 400) {
    log.success('✅ Endpoint google-auth correctamente protegido');
  } else {
    log.warning('⚠️ Endpoint google-auth no está protegido adecuadamente');
  }

  log.info('💡 Para probar Google Auth completamente, necesitas un token de Firebase del frontend');
}

/**
 * TEST 7: Diagnóstico de problemas del frontend
 */
async function testDiagnosticoFrontend() {
  log.title('TEST 7: DIAGNÓSTICO DE PROBLEMAS DEL FRONTEND');

  log.step('Verificando conectividad con Google APIs...');
  try {
    const googleTest = await axios.get('https://www.googleapis.com', { timeout: 5000 });
    log.success('✅ Conectividad con Google APIs OK');
  } catch (error) {
    log.error(`❌ Problema con Google APIs: ${error.message}`);
  }

  log.step('Verificando headers CORS...');
  try {
    const corsTest = await axios.options(`${API_URL}/auth/login`);
    log.success('✅ CORS configurado correctamente');
  } catch (error) {
    log.warning('⚠️ No se pudieron verificar headers CORS');
  }

  log.info('🔍 Errores reportados del frontend:');
  log.info('   • ERR_NAME_NOT_RESOLVED - Problema DNS/red');
  log.info('   • Cross-Origin-Opener-Policy - Popups de Google bloqueados');
  log.info('   • 401 Unauthorized - Token Firebase inválido');
  log.info('   • POST google-login-erp 401 - Error de autenticación');
}

/**
 * Generar reporte final
 */
function generarReporte() {
  log.title('📊 REPORTE FINAL - TESTING EN VERCEL');

  console.log('\n🔧 CONECTIVIDAD:');
  for (const [service, status] of Object.entries(testResults.conectividad)) {
    const emoji = status ? '✅' : '❌';
    console.log(`${emoji} ${service}: ${PRODUCTION_URLS[service]}`);
  }

  console.log('\n🔐 AUTENTICACIÓN:');
  console.log(`Firebase Admin: ${testResults.firebaseAdmin ? '✅ OK' : '❌ FALLO'}`);
  console.log(`Login directo: ${testResults.login.directo ? '✅ OK' : '❌ FALLO'}`);
  console.log(`Registro: ${testResults.registro.normal ? '✅ OK' : '❌ FALLO'}`);
  console.log(`Tokens JWT: ${testResults.tokens.jwt ? '✅ Generado' : '❌ No generado'}`);

  console.log('\n💡 RECOMENDACIONES:');

  if (!testResults.firebaseAdmin) {
    console.log('🔥 FIREBASE ADMIN:');
    console.log('   • Verificar variables FIREBASE_* en Vercel');
    console.log('   • Revisar serviceAccountKey.json');
    console.log('   • Verificar logs de Vercel para errores específicos');
  }

  if (!testResults.login.directo) {
    console.log('👤 LOGIN DIRECTO:');
    console.log('   • Crear usuario admin@innovapaz.com en base de datos');
    console.log('   • Verificar conexión con PostgreSQL');
    console.log('   • Revisar variables DB_* en Vercel');
  }

  console.log('\n🚀 ACCIONES INMEDIATAS:');
  console.log('1. Revisar logs de Vercel Functions');
  console.log('2. Verificar todas las variables de entorno');
  console.log('3. Probar desde el frontend de producción');
  console.log('4. Verificar configuración CORS en vercel.json');

  console.log(`\n🔗 Backend testeado: ${API_URL}`);
}

/**
 * Función principal
 */
async function main() {
  console.log('\n🧪 TESTING COMPLETO DE AUTENTICACIÓN EN VERCEL');
  console.log(`🔗 API URL: ${API_URL}\n`);

  try {
    await testConectividadVercel();
    await testBackendBasico();
    await testLoginDirecto();
    await testRegistro();
    await testTokens();
    await testGoogleAuthEndpoints();
    await testDiagnosticoFrontend();

    generarReporte();
  } catch (error) {
    log.error(`Error crítico: ${error.message}`);
    console.error(error);
  }

  console.log('\n✨ TESTING COMPLETADO\n');
}

// Ejecutar
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, testResults };
