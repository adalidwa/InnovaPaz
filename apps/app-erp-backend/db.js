const { Pool } = require('pg');
const { db, env } = require('./config'); // Importar 'env'

// Configuración de SSL condicional.
// Se activa solo en producción (como en Render), no en desarrollo local.
const sslConfig = env === 'production' ? { ssl: { rejectUnauthorized: false } } : {};

const pool = new Pool({
  user: db.user,
  password: db.password,
  host: db.host,
  port: db.port,
  database: db.database,
  ...sslConfig, // Aplicar la configuración de SSL aquí
});

// Verificar conexión a la base de datos
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error al conectar a la base de datos:', err.message);
    console.error('Detalles del error:', err.stack);
  } else {
    console.log(
      `✅ Conectado exitosamente a la base de datos PostgreSQL: "${client.database}" en el host "${client.host}"`
    );
    release(); // Liberar el cliente
  }
});

// Manejar errores de conexión del pool
pool.on('error', (err) => {
  console.error('❌ Error inesperado en el pool de conexiones:', err);
  process.exit(-1);
});

module.exports = pool;
