import { createPool } from 'mysql2/promise';
import { DB_CONFIG } from './utils/env.js';

export const pool = createPool({
  host: DB_CONFIG.HOST,
  port: DB_CONFIG.PORT,
  user: DB_CONFIG.USER,
  password: DB_CONFIG.PASSWORD,
  database: DB_CONFIG.DATABASE,
  charset: 'utf8mb4',
  waitForConnections: DB_CONFIG.WAIT_FOR_CONNECTIONS,
  connectionLimit: 5, // Reducir el límite para conexión remota
  queueLimit: DB_CONFIG.QUEUE_LIMIT,
  // Configuración SSL para conexión remota
  ssl: {
    rejectUnauthorized: false,
  },
  // Configuraciones de timeout para conexión remota
  acquireTimeout: 120000, // 2 minutos para obtener conexión
  timeout: 120000, // 2 minutos para queries
  reconnect: true, // Reconectar automáticamente
  idleTimeout: 300000, // 5 minutos idle timeout
  enableKeepAlive: true, // Mantener conexión viva
  keepAliveInitialDelay: 0,
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
