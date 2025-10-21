const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function executeSQLFile() {
  const client = new Client({
    connectionString:
      'postgresql://innovapaz_user:qIJnkVnajEGBN2bVw7L3I0FRphBqMwHT@dpg-ct72jebqf0us73fjrso0-a.oregon-postgres.render.com/innovapaz',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  try {
    console.log('🔄 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conectado exitosamente\n');

    const sqlPath = path.join(__dirname, '../../scripts/populate-all-distributors-history.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Ejecutar en transacción
    await client.query('BEGIN');

    // Dividir y ejecutar queries
    const statements = sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s && !s.startsWith('--') && s.length > 10);

    console.log(`📝 Ejecutando ${statements.length} statements...\n`);

    for (let i = 0; i < statements.length; i++) {
      try {
        const result = await client.query(statements[i]);

        if (result.command === 'INSERT') {
          console.log(`✓ Statement ${i + 1}: ${result.rowCount} filas insertadas`);
        } else if (result.command === 'SELECT' && result.rows.length > 0) {
          console.log(`\n📊 Resumen por distribuidora:\n`);
          console.table(result.rows.slice(0, 25));
        }
      } catch (err) {
        if (err.message.includes('duplicate key') || err.message.includes('already exists')) {
          console.log(`⚠ Statement ${i + 1}: Ya existe (ignorado)`);
        } else {
          throw err;
        }
      }
    }

    await client.query('COMMIT');
    console.log('\n✅ Script ejecutado exitosamente');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

executeSQLFile();
