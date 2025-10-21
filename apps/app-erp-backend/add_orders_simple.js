const { Client } = require('pg');

const client = new Client({
  host: 'dpg-d3i40ladbo4c73fdfdl0-a.oregon-postgres.render.com',
  port: 5432,
  database: 'innovapaz_erp_db',
  user: 'innovapaz_erp_db_user',
  password: 'rrPJQJDlceA4jF1rm3hE8mXKyn07CDe0',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
  statement_timeout: 5000,
});

(async () => {
  try {
    await client.connect();
    console.log('✅ Conectado\n');

    // Obtener providers sin órdenes
    const providers = await client.query(`
      SELECT p.id, p.title
      FROM providers p
      LEFT JOIN purchase_orders po ON p.id = po.supplier_id
      WHERE po.id IS NULL
      ORDER BY p.id
    `);

    console.log(`📦 ${providers.rows.length} proveedores sin órdenes\n`);

    let inserted = 0;

    for (const prov of providers.rows) {
      const orderNum = `PO-2025-${String(100 + prov.id).padStart(3, '0')}`;

      try {
        await client.query(
          `
          INSERT INTO purchase_orders (order_number, date, supplier_id, supplier_name, total_items, total_amount, status, notes)
          VALUES ($1, NOW(), $2, $3, 0, $4, 'pending', 'Orden de prueba')
        `,
          [orderNum, prov.id, prov.title, Math.floor(Math.random() * 10000) + 5000]
        );

        console.log(`  ✓ ${orderNum} - ${prov.title}`);
        inserted++;
      } catch (err) {
        console.log(`  ✗ ${orderNum}: ${err.message}`);
      }
    }

    console.log(`\n✅ ${inserted} órdenes creadas`);

    // Resumen final
    const summary = await client.query(`
      SELECT 
        COUNT(DISTINCT p.id) as total_providers,
        COUNT(DISTINCT CASE WHEN po.id IS NOT NULL THEN p.id END) as with_orders
      FROM providers p
      LEFT JOIN purchase_orders po ON p.id = po.supplier_id
    `);

    console.log(
      `\n📊 ${summary.rows[0].with_orders}/${summary.rows[0].total_providers} proveedores tienen órdenes`
    );
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await client.end();
  }
})();
