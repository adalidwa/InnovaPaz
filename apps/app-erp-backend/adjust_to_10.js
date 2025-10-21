const { Client } = require('pg');

const client = new Client({
  host: 'dpg-d3i40ladbo4c73fdfdl0-a.oregon-postgres.render.com',
  port: 5432,
  database: 'innovapaz_erp_db',
  user: 'innovapaz_erp_db_user',
  password: 'rrPJQJDlceA4jF1rm3hE8mXKyn07CDe0',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
});

(async () => {
  try {
    await client.connect();
    console.log('✅ Conectado\n');
    console.log('📦 Ajustando a 10 registros exactos...\n');

    // 1. Contratos - mantener solo 10
    const contracts = await client.query('SELECT COUNT(*) as count FROM contracts');
    if (contracts.rows[0].count === '0') {
      console.log('⚠️  No hay contratos, creando 10...');
      const providers = await client.query('SELECT id, title FROM providers LIMIT 10');
      for (let i = 0; i < 10; i++) {
        const prov = providers.rows[i % providers.rows.length];
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - i);
        const endDate = new Date(startDate);
        endDate.setFullYear(endDate.getFullYear() + 1);

        await client.query(
          `
          INSERT INTO contracts (contract_number, provider_id, provider_name, start_date, end_date, amount, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
          [
            `CONT-${1000 + i}`,
            prov.id,
            prov.title,
            startDate.toISOString().split('T')[0],
            endDate.toISOString().split('T')[0],
            (Math.random() * 50000 + 10000).toFixed(2),
            i < 7 ? 'active' : 'pending',
          ]
        );
      }
      console.log('  ✓ 10 contratos creados');
    } else {
      const keepContracts = await client.query('SELECT id FROM contracts ORDER BY id LIMIT 10');
      const ids = keepContracts.rows.map((r) => r.id);
      if (ids.length > 0) {
        await client.query('DELETE FROM contracts WHERE id NOT IN (' + ids.join(',') + ')');
      }
      console.log('  ✓ Contratos ajustados a 10');
    }

    // 2. Cotizaciones - mantener solo 10
    const keepQuotes = await client.query('SELECT id FROM quotes ORDER BY date DESC LIMIT 10');
    const quoteIds = keepQuotes.rows.map((r) => r.id);
    if (quoteIds.length > 0) {
      await client.query('DELETE FROM quotes WHERE id NOT IN (' + quoteIds.join(',') + ')');
    }
    console.log('  ✓ Cotizaciones ajustadas a 10');

    // 3. Recepciones - mantener solo 10
    const keepReceptions = await client.query(
      'SELECT id FROM receptions ORDER BY date DESC LIMIT 10'
    );
    const receptionIds = keepReceptions.rows.map((r) => r.id);
    if (receptionIds.length > 0) {
      await client.query('DELETE FROM receptions WHERE id NOT IN (' + receptionIds.join(',') + ')');
    }
    console.log('  ✓ Recepciones ajustadas a 10');

    // Resumen final
    const summary = await client.query(`
      SELECT 'contracts' as tabla, COUNT(*) as total FROM contracts
      UNION ALL
      SELECT 'quotes' as tabla, COUNT(*) as total FROM quotes
      UNION ALL
      SELECT 'quote_items' as tabla, COUNT(*) as total FROM quote_items
      UNION ALL
      SELECT 'receptions' as tabla, COUNT(*) as total FROM receptions
      UNION ALL
      SELECT 'reception_items' as tabla, COUNT(*) as total FROM reception_items
      UNION ALL
      SELECT 'historical_prices' as tabla, COUNT(*) as total FROM historical_prices
    `);

    console.log('\n📊 Resumen final:\n');
    console.table(summary.rows);

    console.log('\n✅ Datos ajustados: 10 contratos, 10 cotizaciones, 10 recepciones!');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
