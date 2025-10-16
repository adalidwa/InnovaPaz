const { Pool } = require('pg');
const { db, env } = require('./config');

// Habilitar SSL para conexiones de Render
const needsSsl = db.host && db.host.includes('render.com');
const sslConfig = needsSsl ? { ssl: { rejectUnauthorized: false } } : {};

const pool = new Pool({
  user: db.user,
  password: db.password,
  host: db.host,
  port: db.port,
  database: db.database,
  ...sslConfig,
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error al conectar a la base de datos:', err.message);
    console.error('Detalles del error:', err.stack);
  } else {
    console.log(
      `✅ Conectado exitosamente a la base de datos PostgreSQL: "${client.database}" en el host "${client.host}"`
    );
    release();
  }
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en el pool de conexiones:', err);
  process.exit(-1);
});

module.exports = pool;
