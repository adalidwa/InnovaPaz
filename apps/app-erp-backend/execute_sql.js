const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
  connectionString:
    'postgresql://innovapaz_user:qIJnkVnajEGBN2bVw7L3I0FRphBqMwHT@dpg-ct72jebqf0us73fjrso0-a.oregon-postgres.render.com/innovapaz',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
  query_timeout: 30000,
  keepAlive: true,
});

async function executeSQL() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos');

    const sql = fs.readFileSync('/tmp/populate_all_distributors.sql', 'utf8');

    // Dividir el SQL en múltiples queries
    const queries = sql
      .split(';')
      .map((q) => q.trim())
      .filter((q) => q && !q.startsWith('--'));

    console.log(`📝 Ejecutando ${queries.length} queries...`);

    let lastResult;
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      if (query) {
        try {
          const result = await client.query(query);
          lastResult = result;
          console.log(`✓ Query ${i + 1}/${queries.length} completada`);
        } catch (err) {
          if (!err.message.includes('ON CONFLICT')) {
            console.log(`⚠ Query ${i + 1}: ${err.message}`);
          }
        }
      }
    }

    // Mostrar resultados finales
    if (lastResult && lastResult.rows) {
      console.log('\n📊 Resumen por distribuidora:');
      console.table(lastResult.rows);
    }

    console.log('\n✅ Script ejecutado exitosamente');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

executeSQL();
