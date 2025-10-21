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
    console.log('✅ Conectado a innovapaz_erp_db\n');

    const empresaResult = await client.query('SELECT empresa_id FROM empresas LIMIT 1');
    const empresa_id = empresaResult.rows[0].empresa_id;
    console.log(`🏢 Empresa: ${empresa_id}\n`);

    await client.query('BEGIN');

    //1. PROVEEDORES
    console.log('📦 1/5: Migrando providers -> proveedores...');
    const provMigrate = await client.query(
      `
      INSERT INTO proveedores (nombre, nit, contacto, telefono, email, direccion, empresa_id, estado)
      SELECT title, nit, contact, phone, email, address, $1, 'activo'
      FROM providers
      WHERE NOT EXISTS (SELECT 1 FROM proveedores WHERE nombre = providers.title AND empresa_id = $1)
    `,
      [empresa_id]
    );
    console.log(`  ✓ ${provMigrate.rowCount} proveedores\n`);

    // 2. PRODUCTOS
    console.log('📦 2/5: Migrando products -> producto...');
    const prodMigrate = await client.query(
      `
      INSERT INTO producto (codigo, nombre_producto, descripcion, precio_venta, precio_costo, stock, empresa_id, estado_id)
      SELECT 
        'PROD-' || id::text,
        name,
        COALESCE(description, ''),
        unit_price::numeric,
        unit_price::numeric * 0.7,
        COALESCE(current_stock, 0),
        $1,
        1
      FROM products
      WHERE NOT EXISTS (SELECT 1 FROM producto WHERE codigo = 'PROD-' || products.id::text)
    `,
      [empresa_id]
    );
    console.log(`  ✓ ${prodMigrate.rowCount} productos\n`);

    // 3. Mapeos
    console.log('📦 3/5: Creando mapeos...');
    const provMapping = await client.query(
      `
      SELECT p.id as old_id, prov.proveedor_id as new_id
      FROM providers p
      JOIN proveedores prov ON p.title = prov.nombre AND prov.empresa_id = $1
    `,
      [empresa_id]
    );
    const provMap = Object.fromEntries(provMapping.rows.map((r) => [r.old_id, r.new_id]));

    const prodMapping = await client.query(`
      SELECT p.id as old_id, prod.producto_id as new_id
      FROM products p
      JOIN producto prod ON 'PROD-' || p.id::text = prod.codigo
    `);
    const prodMap = Object.fromEntries(prodMapping.rows.map((r) => [r.old_id, r.new_id]));
    console.log(`  ✓ ${Object.keys(provMap).length} proveedores mapeados`);
    console.log(`  ✓ ${Object.keys(prodMap).length} productos mapeados\n`);

    // 4. ORDENES
    console.log('📦 4/5: Migrando purchase_orders -> ordenes_compra...');
    const orders = await client.query('SELECT * FROM purchase_orders');
    let ordersInserted = 0;

    for (const order of orders.rows) {
      const newProvId = provMap[order.provider_id];
      if (!newProvId) continue;

      try {
        await client.query(
          `
          INSERT INTO ordenes_compra (numero_orden, proveedor_id, empresa_id, fecha_orden, fecha_entrega_esperada, total, estado_orden_compra_id, observaciones)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `,
          [
            order.order_number,
            newProvId,
            empresa_id,
            order.order_date,
            order.delivery_date,
            order.total_amount || 0,
            order.status === 'pending' ? 1 : 2,
            order.notes,
          ]
        );
        ordersInserted++;
      } catch (err) {
        if (!err.message.includes('duplicate')) {
          console.log(`    ⚠ ${order.order_number}: ${err.message}`);
        }
      }
    }
    console.log(`  ✓ ${ordersInserted} órdenes\n`);

    // 5. ITEMS
    console.log('📦 5/5: Migrando items...');
    const items = await client.query(`
      SELECT poi.*, po.order_number
      FROM purchase_order_items poi
      JOIN purchase_orders po ON poi.purchase_order_id = po.id
    `);

    let itemsInserted = 0;
    for (const item of items.rows) {
      const newProdId = prodMap[item.product_id];
      if (!newProdId) continue;

      const ordenResult = await client.query(
        'SELECT orden_compra_id FROM ordenes_compra WHERE numero_orden = $1',
        [item.order_number]
      );

      if (ordenResult.rows.length === 0) continue;

      try {
        await client.query(
          `
          INSERT INTO detalle_orden_compra (orden_compra_id, producto_id, cantidad, precio_unitario, subtotal)
          VALUES ($1, $2, $3, $4, $5)
        `,
          [
            ordenResult.rows[0].orden_compra_id,
            newProdId,
            item.quantity,
            item.unit_price,
            item.total,
          ]
        );
        itemsInserted++;
      } catch (err) {}
    }
    console.log(`  ✓ ${itemsInserted} items\n`);

    await client.query('COMMIT');

    // Resumen
    console.log('📊 Resumen:\n');
    const summary = await client.query(
      `
      SELECT 
        prov.proveedor_id as id,
        prov.nombre,
        COUNT(oc.orden_compra_id) as ordenes,
        COALESCE(SUM(oc.total), 0)::numeric(10,2) as total
      FROM proveedores prov
      LEFT JOIN ordenes_compra oc ON prov.proveedor_id = oc.proveedor_id
      WHERE prov.empresa_id = $1
      GROUP BY prov.proveedor_id, prov.nombre
      ORDER BY prov.proveedor_id
    `,
      [empresa_id]
    );
    console.table(summary.rows);

    console.log('\n✅ Migración completada! Ahora actualiza backend y frontend.');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
