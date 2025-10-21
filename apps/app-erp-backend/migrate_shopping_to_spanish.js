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

    // Obtener empresa_id (usaremos la primera disponible)
    const empresaResult = await client.query('SELECT empresa_id FROM empresas LIMIT 1');
    const empresa_id = empresaResult.rows[0].empresa_id;
    console.log(`🏢 Usando empresa_id: ${empresa_id}\n`);

    await client.query('BEGIN');

    // 1. Migrar PROVIDERS -> PROVEEDORES
    console.log('📦 1/4: Migrando providers -> proveedores...');
    const provMigrate = await client.query(
      `
      INSERT INTO proveedores (nombre, nit, contacto, telefono, email, direccion, empresa_id, estado)
      SELECT 
        title as nombre,
        nit,
        contact as contacto,
        phone as telefono,
        email,
        address as direccion,
        $1 as empresa_id,
        'activo' as estado
      FROM providers
      WHERE NOT EXISTS (
        SELECT 1 FROM proveedores WHERE nombre = providers.title
      )
    `,
      [empresa_id]
    );
    console.log(`  ✓ ${provMigrate.rowCount} proveedores migrados\n`);

    // 2. Migrar PRODUCTS -> PRODUCTO
    console.log('📦 2/4: Migrando products -> producto...');
    const prodMigrate = await client.query(
      `
      INSERT INTO producto (codigo, nombre_producto, descripcion, precio_venta, precio_costo, stock, empresa_id, estado_id)
      SELECT 
        sku as codigo,
        name as nombre_producto,
        description as descripcion,
        price as precio_venta,
        price * 0.7 as precio_costo,
        stock,
        $1 as empresa_id,
        1 as estado_id
      FROM products
      WHERE NOT EXISTS (
        SELECT 1 FROM producto WHERE codigo = products.sku
      )
    `,
      [empresa_id]
    );
    console.log(`  ✓ ${prodMigrate.rowCount} productos migrados\n`);

    // 3. Crear mapeo de IDs (providers -> proveedores)
    const provMapping = await client.query(`
      SELECT p.id as old_id, prov.proveedor_id as new_id
      FROM providers p
      JOIN proveedores prov ON p.title = prov.nombre
    `);
    const provMap = Object.fromEntries(provMapping.rows.map((r) => [r.old_id, r.new_id]));

    // 4. Crear mapeo de IDs (products -> producto)
    const prodMapping = await client.query(`
      SELECT p.id as old_id, prod.producto_id as new_id
      FROM products p
      JOIN producto prod ON p.sku = prod.codigo
    `);
    const prodMap = Object.fromEntries(prodMapping.rows.map((r) => [r.old_id, r.new_id]));

    // 5. Migrar PURCHASE_ORDERS -> ORDENES_COMPRA
    console.log('📦 3/4: Migrando purchase_orders -> ordenes_compra...');
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
          ON CONFLICT DO NOTHING
        `,
          [
            order.order_number,
            newProvId,
            empresa_id,
            order.order_date,
            order.delivery_date,
            order.total_amount || 0,
            order.status === 'pending' ? 1 : 2, // 1=pendiente, 2=recibido (ajustar según tu tabla estado_orden_compra)
            order.notes,
          ]
        );
        ordersInserted++;
      } catch (err) {
        if (!err.message.includes('duplicate')) {
          console.log(`    ⚠ Error en orden ${order.order_number}: ${err.message}`);
        }
      }
    }
    console.log(`  ✓ ${ordersInserted} órdenes migradas\n`);

    // 6. Migrar PURCHASE_ORDER_ITEMS -> DETALLE_ORDEN_COMPRA
    console.log('📦 4/4: Migrando items de órdenes...');
    const items = await client.query(`
      SELECT poi.*, po.order_number
      FROM purchase_order_items poi
      JOIN purchase_orders po ON poi.purchase_order_id = po.id
    `);

    let itemsInserted = 0;
    for (const item of items.rows) {
      const newProdId = prodMap[item.product_id];
      if (!newProdId) continue;

      // Buscar el ID de la orden migrada
      const ordenResult = await client.query(
        'SELECT orden_compra_id FROM ordenes_compra WHERE numero_orden = $1',
        [item.order_number]
      );

      if (ordenResult.rows.length === 0) continue;
      const ordenId = ordenResult.rows[0].orden_compra_id;

      try {
        await client.query(
          `
          INSERT INTO detalle_orden_compra (orden_compra_id, producto_id, cantidad, precio_unitario, subtotal)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT DO NOTHING
        `,
          [ordenId, newProdId, item.quantity, item.unit_price, item.total]
        );
        itemsInserted++;
      } catch (err) {
        // Ignorar errores de duplicados
      }
    }
    console.log(`  ✓ ${itemsInserted} items migrados\n`);

    await client.query('COMMIT');

    // Verificar resultados
    console.log('📊 Resumen de migración:\n');
    const summary = await client.query(`
      SELECT 
        prov.proveedor_id as id,
        prov.nombre,
        COUNT(oc.orden_compra_id) as ordenes
      FROM proveedores prov
      LEFT JOIN ordenes_compra oc ON prov.proveedor_id = oc.proveedor_id
      GROUP BY prov.proveedor_id, prov.nombre
      ORDER BY prov.proveedor_id
      LIMIT 25
    `);
    console.table(summary.rows);

    console.log('\n✅ Migración completada exitosamente!');
    console.log('📝 Ahora actualiza el backend y frontend para usar las tablas en español.');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
