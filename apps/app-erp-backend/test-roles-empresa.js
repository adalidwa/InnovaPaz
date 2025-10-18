const http = require('http');

// Datos de la prueba anterior
const loginData = {
  email: 'test-1760756038463@example.com',
  password: 'password123',
};

function makeRequest(path, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;

    const options = {
      hostname: 'localhost',
      port: 4000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };

    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: response });
        } catch (error) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function testRoleSystem() {
  try {
    console.log('🔐 Iniciando login...');
    const loginResponse = await makeRequest('/api/auth/login', 'POST', loginData);

    if (loginResponse.status !== 200) {
      console.log('❌ Error en login:', loginResponse.data);
      return;
    }

    console.log('✅ Login exitoso');
    const token = loginResponse.data.token;
    const empresaId = loginResponse.data.usuario.empresa_id;

    console.log('🏢 Empresa ID:', empresaId);
    console.log('🔍 Consultando roles de la empresa...');

    // Consultar roles de la empresa
    const rolesResponse = await makeRequest(`/api/roles/company/${empresaId}`, 'GET', null, token);

    console.log('📊 Status de consulta roles:', rolesResponse.status);
    console.log('📋 Roles de la empresa:');

    if (rolesResponse.data && Array.isArray(rolesResponse.data)) {
      console.log(`   Total roles: ${rolesResponse.data.length}`);
      rolesResponse.data.forEach((rol, index) => {
        console.log(`   ${index + 1}. ${rol.nombre_rol} (ID: ${rol.rol_id})`);
        console.log(`      - Es predeterminado: ${rol.es_predeterminado}`);
        console.log(`      - Plantilla origen: ${rol.plantilla_id_origen || 'N/A'}`);
        console.log(`      - Estado: ${rol.estado}`);
      });
    } else {
      console.log('   Respuesta:', rolesResponse.data);
    }
  } catch (error) {
    console.error('❌ Error en el test:', error);
  }
}

testRoleSystem();
