const http = require('http');

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

async function testAuth() {
  try {
    // Usar los datos del usuario que acabamos de registrar
    const loginData = {
      email: 'test-1760756845809@example.com',
      password: 'password123',
    };

    console.log('🔐 Haciendo login...');
    const loginResponse = await makeRequest('/api/auth/login', 'POST', loginData);

    console.log('📊 Status de login:', loginResponse.status);

    if (loginResponse.status !== 200) {
      console.log('❌ Error en login:', loginResponse.data);
      return;
    }

    console.log('✅ Login exitoso');
    const token = loginResponse.data.token;

    console.log('🔍 Probando endpoint /api/auth/me...');
    const meResponse = await makeRequest('/api/auth/me', 'GET', null, token);

    console.log('📊 Status de /me:', meResponse.status);

    if (meResponse.status === 200) {
      console.log('✅ Endpoint /api/auth/me funciona correctamente');
      console.log('👤 Datos del usuario:');
      console.log(JSON.stringify(meResponse.data, null, 2));
    } else {
      console.log('❌ Error en /api/auth/me:', meResponse.data);
    }
  } catch (error) {
    console.error('❌ Error en el test:', error);
  }
}

testAuth();
