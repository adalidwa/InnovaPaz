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

    console.log('🗑️  Reduciendo órdenes de compra a solo 10 totales...\n');

    // Obtener las 10 órdenes más recientes
    const keepOrders = await client.query(
      'SELECT id FROM purchase_orders ORDER BY date DESC, id DESC LIMIT 10'
    );
    const keepIds = keepOrders.rows.map((o) => o.id);

    console.log(`📦 Manteniendo 10 órdenes: ${keepIds.join(', ')}`);

    // Eliminar todas las demás órdenes
    const deleteResult = await client.query(
      'DELETE FROM purchase_orders WHERE id NOT IN (' + keepIds.join(',') + ')'
    );

    console.log(`  ✓ Eliminadas ${deleteResult.rowCount} órdenes de compra\n`);

    // Resumen final
    const summary = await client.query(`
      SELECT 
        COUNT(*) as total_ordenes,
        COUNT(DISTINCT supplier_id) as proveedores_con_ordenes
      FROM purchase_orders
    `);

    console.log('📊 Resumen:\n');
    console.table(summary.rows);

    // Detalle de las 10 órdenes
    const detail = await client.query(`
      SELECT 
        id,
        order_number,
        date::date,
        supplier_name,
        total_amount
      FROM purchase_orders
      ORDER BY date DESC, id DESC
    `);

    console.log('\n📋 Órdenes de compra restantes:\n');
    console.table(detail.rows);

    console.log('\n✅ Ahora solo hay 10 órdenes de compra totales!');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
