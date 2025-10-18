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

async function testMeDirectly() {
  try {
    console.log('🔍 Probando endpoint /api/auth/me sin token (debe fallar)...');
    const meResponse = await makeRequest('/api/auth/me', 'GET');

    console.log('📊 Status sin token:', meResponse.status);
    console.log('📋 Respuesta sin token:', meResponse.data);

    // Ahora probemos con un token falso para ver el flujo
    console.log('\n🔍 Probando endpoint /api/auth/me con token falso (debe fallar)...');
    const fakeTokenResponse = await makeRequest('/api/auth/me', 'GET', null, 'fake-token');

    console.log('📊 Status con token falso:', fakeTokenResponse.status);
    console.log('📋 Respuesta con token falso:', fakeTokenResponse.data);
  } catch (error) {
    console.error('❌ Error en el test:', error);
  }
}

testMeDirectly();
