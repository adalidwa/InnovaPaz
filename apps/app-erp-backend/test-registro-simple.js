const http = require('http');

const testData = {
  email: `test-${Date.now()}@example.com`,
  password: 'password123',
  nombre_completo: 'Test User',
  empresa_data: {
    nombre: 'Test Company',
    tipo_empresa_id: 1,
    plan_id: 1,
  },
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
  },
};

console.log('🧪 Iniciando test de registro...');
console.log('📧 Email de prueba:', testData.email);

const req = http.request(options, (res) => {
  console.log(`📊 Status: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);

  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log('📋 Respuesta del servidor:');
    try {
      const response = JSON.parse(responseData);
      console.log(JSON.stringify(response, null, 2));

      if (response.firebase_uid) {
        console.log('✅ Registro exitoso!');
        console.log('👤 UID:', response.firebase_uid);
        console.log('🏢 Empresa ID:', response.usuario?.empresa_id);
      } else {
        console.log('❌ Error en el registro');
      }
    } catch (error) {
      console.log('❌ Error parsing JSON:', error.message);
      console.log('Raw response:', responseData);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error en la petición:', error);
});

req.write(postData);
req.end();
