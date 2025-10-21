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

    console.log('🗑️  Reduciendo datos del módulo shopping a 10 registros...\n');

    // 1. Obtener los primeros 10 proveedores
    const providersResult = await client.query('SELECT id FROM providers ORDER BY id LIMIT 10');
    const providerIds = providersResult.rows.map((p) => p.id);

    console.log(`📦 Manteniendo ${providerIds.length} proveedores: ${providerIds.join(', ')}`);

    // 2. Eliminar órdenes de compra que no pertenecen a estos 10 proveedores
    const deleteOrders = await client.query(
      'DELETE FROM purchase_orders WHERE supplier_id NOT IN (' +
        providerIds.join(',') +
        ') OR supplier_id IS NULL'
    );
    console.log(`  ✓ Eliminadas ${deleteOrders.rowCount} órdenes de compra`);

    // 3. Limitar a 10 órdenes por proveedor
    for (const providerId of providerIds) {
      const keepOrders = await client.query(
        'SELECT id FROM purchase_orders WHERE supplier_id = $1 ORDER BY date DESC LIMIT 10',
        [providerId]
      );
      const keepIds = keepOrders.rows.map((o) => o.id);

      if (keepIds.length > 0) {
        await client.query(
          'DELETE FROM purchase_orders WHERE supplier_id = $1 AND id NOT IN (' +
            keepIds.join(',') +
            ')',
          [providerId]
        );
      }
    }
    console.log('  ✓ Limitadas a 10 órdenes por proveedor');

    // 4. Eliminar recepciones que no pertenecen a estos proveedores
    const deleteReceptions = await client.query(
      'DELETE FROM receptions WHERE supplier_id NOT IN (' +
        providerIds.join(',') +
        ') OR supplier_id IS NULL'
    );
    console.log(`  ✓ Eliminadas ${deleteReceptions.rowCount} recepciones`);

    // 5. Limitar a 10 recepciones por proveedor
    for (const providerId of providerIds) {
      const keepReceptions = await client.query(
        'SELECT id FROM receptions WHERE supplier_id = $1 ORDER BY date DESC LIMIT 10',
        [providerId]
      );
      const keepIds = keepReceptions.rows.map((r) => r.id);

      if (keepIds.length > 0) {
        await client.query(
          'DELETE FROM receptions WHERE supplier_id = $1 AND id NOT IN (' + keepIds.join(',') + ')',
          [providerId]
        );
      }
    }
    console.log('  ✓ Limitadas a 10 recepciones por proveedor');

    // 6. Eliminar proveedores extra (dejar solo 10)
    const deleteProviders = await client.query(
      'DELETE FROM providers WHERE id NOT IN (' + providerIds.join(',') + ')'
    );
    console.log(`  ✓ Eliminados ${deleteProviders.rowCount} proveedores extra`);

    // 7. Limitar contratos a 10 (si existen)
    const deleteContracts = await client.query(`
      DELETE FROM contracts 
      WHERE id NOT IN (
        SELECT id FROM contracts ORDER BY id LIMIT 10
      )
    `);
    console.log(`  ✓ Eliminados ${deleteContracts.rowCount} contratos extra`);

    // 8. Resumen final
    const summary = await client.query(`
      SELECT 
        'providers' as tabla,
        COUNT(*) as registros
      FROM providers
      UNION ALL
      SELECT 
        'purchase_orders' as tabla,
        COUNT(*) as registros
      FROM purchase_orders
      UNION ALL
      SELECT 
        'receptions' as tabla,
        COUNT(*) as registros
      FROM receptions
      UNION ALL
      SELECT 
        'contracts' as tabla,
        COUNT(*) as registros
      FROM contracts
      ORDER BY tabla
    `);

    console.log('\n📊 Resumen final de datos:\n');
    console.table(summary.rows);

    // Detalle por proveedor
    const detailByProvider = await client.query(`
      SELECT 
        p.id,
        p.title as proveedor,
        COUNT(DISTINCT po.id) as ordenes,
        COUNT(DISTINCT r.id) as recepciones
      FROM providers p
      LEFT JOIN purchase_orders po ON p.id = po.supplier_id
      LEFT JOIN receptions r ON p.id = r.supplier_id
      GROUP BY p.id, p.title
      ORDER BY p.id
    `);

    console.log('\n📦 Datos por proveedor:\n');
    console.table(detailByProvider.rows);

    console.log('\n✅ Módulo shopping reducido a ~10 registros por tabla!');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
