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

    // Obtener todos los providers
    const providers = await client.query('SELECT id, title FROM providers ORDER BY id');
    console.log(`📦 ${providers.rows.length} proveedores encontrados\n`);

    await client.query('BEGIN');

    let inserted = 0;
    let itemsInserted = 0;

    // Para cada proveedor, crear 2 órdenes (1 received, 1 pending)
    for (const prov of providers.rows) {
      const baseNum = (prov.id - 1) * 2 + 11;

      // Orden 1: received
      try {
        const order1 = await client.query(
          `
          INSERT INTO purchase_orders (order_number, date, supplier_id, supplier_name, total_items, total_amount, status, notes)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING id
        `,
          [
            `PO-2025-${String(baseNum).padStart(3, '0')}`,
            '2025-01-15',
            prov.id,
            prov.title,
            0,
            Math.floor(Math.random() * 15000) + 7000,
            'received',
            'Orden recibida',
          ]
        );

        // Agregar 2-3 items a la orden
        const products = await client.query(
          'SELECT id, name, unit_price FROM products ORDER BY RANDOM() LIMIT 3'
        );
        for (const prod of products.rows) {
          const qty = Math.floor(Math.random() * 50) + 10;
          const price = parseFloat(prod.unit_price);
          await client.query(
            `
            INSERT INTO purchase_order_items (purchase_order_id, product_id, product_name, quantity, unit_price, total)
            VALUES ($1, $2, $3, $4, $5, $6)
          `,
            [order1.rows[0].id, prod.id, prod.name, qty, price, qty * price]
          );
          itemsInserted++;
        }

        inserted++;
      } catch (err) {
        if (!err.message.includes('duplicate')) {
          console.log(`  ⚠ Error en PO-2025-${String(baseNum).padStart(3, '0')}: ${err.message}`);
        }
      }

      // Orden 2: pending
      try {
        const order2 = await client.query(
          `
          INSERT INTO purchase_orders (order_number, date, supplier_id, supplier_name, total_items, total_amount, status, notes)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING id
        `,
          [
            `PO-2025-${String(baseNum + 1).padStart(3, '0')}`,
            '2025-02-01',
            prov.id,
            prov.title,
            0,
            Math.floor(Math.random() * 12000) + 8000,
            'pending',
            'Orden pendiente',
          ]
        );

        // Agregar 2-3 items
        const products = await client.query(
          'SELECT id, name, unit_price FROM products ORDER BY RANDOM() LIMIT 3'
        );
        for (const prod of products.rows) {
          const qty = Math.floor(Math.random() * 50) + 10;
          const price = parseFloat(prod.unit_price);
          await client.query(
            `
            INSERT INTO purchase_order_items (purchase_order_id, product_id, product_name, quantity, unit_price, total)
            VALUES ($1, $2, $3, $4, $5, $6)
          `,
            [order2.rows[0].id, prod.id, prod.name, qty, price, qty * price]
          );
          itemsInserted++;
        }

        inserted++;
      } catch (err) {
        if (!err.message.includes('duplicate')) {
          console.log(
            `  ⚠ Error en PO-2025-${String(baseNum + 1).padStart(3, '0')}: ${err.message}`
          );
        }
      }
    }

    await client.query('COMMIT');

    console.log(`✓ ${inserted} órdenes insertadas`);
    console.log(`✓ ${itemsInserted} items agregados\n`);

    // Resumen
    console.log('📊 Resumen por proveedor:\n');
    const summary = await client.query(`
      SELECT 
        p.id,
        p.title as name,
        COUNT(po.id) as orders,
        SUM(CASE WHEN po.status = 'received' THEN 1 ELSE 0 END) as received,
        SUM(CASE WHEN po.status = 'pending' THEN 1 ELSE 0 END) as pending,
        COALESCE(SUM(po.total_amount::numeric), 0)::numeric(10,2) as total
      FROM providers p
      LEFT JOIN purchase_orders po ON p.id = po.supplier_id
      GROUP BY p.id, p.title
      ORDER BY p.id
    `);
    console.table(summary.rows);

    console.log('\n✅ Todas las distribuidoras tienen historial ahora!');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
