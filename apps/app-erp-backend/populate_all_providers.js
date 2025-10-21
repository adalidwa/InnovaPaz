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

    await client.query('BEGIN');

    // Insertar 40 órdenes nuevas (2 por proveedor del ID 2 al 21)
    console.log('📝 Insertando órdenes de compra...\n');

    const orders = [];
    for (let provId = 2; provId <= 21; provId++) {
      const baseNum = (provId - 2) * 2 + 11;
      orders.push({
        num: `PO-2025-${String(baseNum).padStart(3, '0')}`,
        provId,
        date1: '2025-01-15',
        date2: '2025-01-22',
        status: 'received',
        amount: Math.floor(Math.random() * 15000) + 7000,
      });
      orders.push({
        num: `PO-2025-${String(baseNum + 1).padStart(3, '0')}`,
        provId,
        date1: '2025-02-01',
        date2: null,
        status: 'pending',
        amount: Math.floor(Math.random() * 12000) + 8000,
      });
    }

    let inserted = 0;
    for (const order of orders) {
      try {
        await client.query(
          `
          INSERT INTO purchase_orders (order_number, provider_id, order_date, delivery_date, status, total_amount, notes)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (order_number) DO NOTHING
        `,
          [
            order.num,
            order.provId,
            order.date1,
            order.date2,
            order.status,
            order.amount,
            `Orden ${order.status === 'received' ? 'recibida' : 'pendiente'}`,
          ]
        );
        inserted++;
      } catch (err) {
        if (!err.message.includes('duplicate')) {
          console.log(`  ⚠ Error en ${order.num}: ${err.message}`);
        }
      }
    }

    console.log(`✓ ${inserted} órdenes insertadas\n`);

    // Agregar items aleatorios a las nuevas órdenes
    console.log('📦 Agregando items a las órdenes...\n');

    const itemsResult = await client.query(`
      INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_price, total)
      SELECT 
        po.id,
        p.id,
        FLOOR(RANDOM() * 50 + 10)::int as quantity,
        (SELECT price FROM products WHERE id = p.id LIMIT 1) * 0.8 as unit_price,
        (FLOOR(RANDOM() * 50 + 10)::int * (SELECT price FROM products WHERE id = p.id LIMIT 1) * 0.8) as total
      FROM purchase_orders po
      CROSS JOIN LATERAL (
        SELECT id FROM products ORDER BY RANDOM() LIMIT 3
      ) p
      WHERE po.order_number LIKE 'PO-2025-0%'
        AND NOT EXISTS (
          SELECT 1 FROM purchase_order_items poi WHERE poi.purchase_order_id = po.id AND poi.product_id = p.id
        )
      LIMIT 120
    `);

    console.log(`✓ ${itemsResult.rowCount} items agregados\n`);

    await client.query('COMMIT');

    // Verificar resultados
    console.log('📊 Resumen por proveedor:\n');
    const summary = await client.query(`
      SELECT 
        p.id,
        p.title as name,
        COUNT(po.id) as orders,
        SUM(CASE WHEN po.status = 'received' THEN 1 ELSE 0 END) as received,
        SUM(CASE WHEN po.status = 'pending' THEN 1 ELSE 0 END) as pending,
        COALESCE(SUM(po.total_amount), 0)::numeric(10,2) as total
      FROM providers p
      LEFT JOIN purchase_orders po ON p.id = po.provider_id
      GROUP BY p.id, p.title
      ORDER BY p.id
      LIMIT 25
    `);

    console.table(summary.rows);

    console.log('\n✅ Todas las distribuidoras ahora tienen historial!');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
