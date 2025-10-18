/**
 * Script para limpiar usuario de prueba
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

async function cleanupTestUser() {
  const testUid = '8isCcNqJF6fGJz7TCBgpice1c2C2';
  const testEmail = 'checatitoedisonclever@gmail.com';

  try {
    console.log('\n🧹 Limpiando usuario de prueba...\n');

    // 1. Buscar el usuario
    const user = await pool.query('SELECT * FROM usuarios WHERE uid = $1 OR email = $2', [
      testUid,
      testEmail,
    ]);

    if (user.rows.length === 0) {
      console.log('✅ No hay usuario de prueba para limpiar');
      await pool.end();
      return;
    }

    const usuario = user.rows[0];
    console.log('👤 Usuario encontrado:');
    console.log(`   UID: ${usuario.uid}`);
    console.log(`   Email: ${usuario.email}`);
    console.log(`   Empresa ID: ${usuario.empresa_id}`);
    console.log(`   Rol ID: ${usuario.rol_id}`);
    console.log(`   Plantilla Rol ID: ${usuario.plantilla_rol_id}\n`);

    // 2. Si tiene empresa, eliminar roles y empresa
    if (usuario.empresa_id) {
      console.log('🏢 Eliminando empresa y roles asociados...');

      // Eliminar roles de la empresa
      const deletedRoles = await pool.query(
        'DELETE FROM roles WHERE empresa_id = $1 RETURNING rol_id',
        [usuario.empresa_id]
      );
      console.log(`   ✅ ${deletedRoles.rows.length} roles eliminados`);

      // Eliminar empresa
      await pool.query('DELETE FROM empresas WHERE empresa_id = $1', [usuario.empresa_id]);
      console.log('   ✅ Empresa eliminada\n');
    }

    // 3. Eliminar usuario
    await pool.query('DELETE FROM usuarios WHERE uid = $1', [usuario.uid]);
    console.log('✅ Usuario eliminado exitosamente\n');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

cleanupTestUser();
