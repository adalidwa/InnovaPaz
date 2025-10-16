import { pool } from '../db.js';

/**
 * Ejecuta una consulta SQL con parámetros
 * @param {string} query - La consulta SQL
 * @param {Array} params - Los parámetros para la consulta
 * @returns {Promise<Object>} - Resultado de la consulta
 */
export const executeQuery = async (query, params = []) => {
  const client = await pool.connect();
  try {
    console.log('📊 [DATABASE] Ejecutando query:', {
      query: query.slice(0, 100) + (query.length > 100 ? '...' : ''),
      params: params,
    });

    const result = await client.query(query, params);

    console.log('✅ [DATABASE] Query exitosa:', {
      rowCount: result.rowCount,
      command: result.command,
      rows: result.rows.length > 0 ? `${result.rows.length} filas` : 'Sin filas',
    });

    return {
      success: true,
      data: result.rows,
      rowCount: result.rowCount,
      command: result.command,
    };
  } catch (error) {
    console.error('❌ [DATABASE] Error en query:', {
      error: error.message,
      code: error.code,
      query: query.slice(0, 100),
      params: params,
    });
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  } finally {
    client.release();
  }
};

/**
 * Ejecuta una transacción
 * @param {Function} callback - Función que contiene las operaciones de la transacción
 * @returns {Promise<Object>} - Resultado de la transacción
 */
export const executeTransaction = async (callback) => {
  const client = await pool.connect();
  try {
    console.log('🔄 [DATABASE] Iniciando transacción...');
    await client.query('BEGIN');

    const result = await callback(client);

    await client.query('COMMIT');
    console.log('✅ [DATABASE] Transacción completada exitosamente');

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ [DATABASE] Error en transacción, realizando ROLLBACK:', {
      error: error.message,
      code: error.code,
      stack: error.stack,
    });
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  } finally {
    client.release();
  }
};

/**
 * Verifica la conexión a la base de datos
 * @returns {Promise<Object>} - Estado de la conexión
 */
export const checkDatabaseConnection = async () => {
  try {
    const result = await executeQuery('SELECT NOW() as current_time, version() as db_version');
    return {
      success: true,
      connected: true,
      timestamp: result.data[0]?.current_time,
      version: result.data[0]?.db_version,
    };
  } catch (error) {
    return {
      success: false,
      connected: false,
      error: error.message,
    };
  }
};

/**
 * Obtiene el conteo de registros de una tabla
 * @param {string} tableName - Nombre de la tabla
 * @returns {Promise<Object>} - Conteo de registros
 */
export const getTableCount = async (tableName) => {
  try {
    const result = await executeQuery(`SELECT COUNT(*) as count FROM ${tableName}`);
    return {
      success: true,
      table: tableName,
      count: parseInt(result.data[0]?.count || 0),
    };
  } catch (error) {
    return {
      success: false,
      table: tableName,
      error: error.message,
    };
  }
};

/**
 * Lista todas las tablas de la base de datos
 * @returns {Promise<Object>} - Lista de tablas
 */
export const listTables = async () => {
  try {
    const result = await executeQuery(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    return {
      success: true,
      tables: result.data.map((row) => row.table_name),
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};
