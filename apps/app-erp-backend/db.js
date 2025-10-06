import { Pool } from 'pg';
import { DB_CONFIG } from './utils/env.js';

export const pool = new Pool({
  host: DB_CONFIG.HOST,
  port: DB_CONFIG.PORT,
  user: DB_CONFIG.USER,
  password: DB_CONFIG.PASSWORD,
  database: DB_CONFIG.DATABASE,
  max: DB_CONFIG.CONNECTION_LIMIT, // Límite de conexiones
  idleTimeoutMillis: 30000, // Timeout idle
  connectionTimeoutMillis: 2000, // Timeout de conexión
});

console.log('🔗 Pool de conexiones a PostgreSQL creado exitosamente');

// Test de conexión inicial
pool
  .connect()
  .then((client) => {
    console.log('✅ Conexión de prueba a PostgreSQL exitosa');
    client.release();
  })
  .catch((error) => {
    console.error('❌ Error en conexión de prueba:', error.message);
  });
console.log('🔗 Pool de conexiones a la base de datos remota creado exitosamente');

// Test de conexión inicial
pool
  .getConnection()
  .then((connection) => {
    console.log('✅ Conexión de prueba a la base de datos exitosa');
    connection.release();
  })
  .catch((error) => {
    console.error('❌ Error en conexión de prueba:', error.message);
  });
