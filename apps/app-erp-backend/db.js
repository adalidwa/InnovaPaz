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
    console.log(`📊 Conectado a la base de datos: ${DB_CONFIG.DATABASE}`);
    console.log(`🏠 Host: ${DB_CONFIG.HOST}:${DB_CONFIG.PORT}`);
    client.release();
  })
  .catch((error) => {
    console.error('❌ Error en conexión de prueba:', error.message);
    console.error('� Verifica que PostgreSQL esté ejecutándose y las credenciales sean correctas');
  });
