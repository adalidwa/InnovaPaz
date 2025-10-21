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

    // Obtener proveedores
    const providers = await client.query('SELECT id, title FROM providers ORDER BY id');
    console.log(`📦 Agregando más órdenes a ${providers.rows.length} distribuidoras...\n`);

    let totalOrders = 0;

    // Agregar 15 órdenes más a cada proveedor (historial de varios meses)
    for (const prov of providers.rows) {
      const orders = [
        {
          date: '2024-03-15',
          status: 'received',
          amount: Math.floor(Math.random() * 15000) + 8000,
          suffix: 'K',
        },
        {
          date: '2024-04-01',
          status: 'received',
          amount: Math.floor(Math.random() * 18000) + 9000,
          suffix: 'L',
        },
        {
          date: '2024-04-20',
          status: 'received',
          amount: Math.floor(Math.random() * 16000) + 8500,
          suffix: 'M',
        },
        {
          date: '2024-05-10',
          status: 'received',
          amount: Math.floor(Math.random() * 20000) + 10000,
          suffix: 'N',
        },
        {
          date: '2024-05-25',
          status: 'received',
          amount: Math.floor(Math.random() * 17000) + 9500,
          suffix: 'O',
        },
        {
          date: '2024-06-08',
          status: 'received',
          amount: Math.floor(Math.random() * 22000) + 11000,
          suffix: 'P',
        },
        {
          date: '2024-06-22',
          status: 'received',
          amount: Math.floor(Math.random() * 19000) + 10500,
          suffix: 'Q',
        },
        {
          date: '2024-07-05',
          status: 'received',
          amount: Math.floor(Math.random() * 21000) + 11500,
          suffix: 'R',
        },
        {
          date: '2024-07-20',
          status: 'received',
          amount: Math.floor(Math.random() * 18000) + 9800,
          suffix: 'S',
        },
        {
          date: '2024-08-03',
          status: 'received',
          amount: Math.floor(Math.random() * 23000) + 12000,
          suffix: 'T',
        },
        {
          date: '2024-08-18',
          status: 'received',
          amount: Math.floor(Math.random() * 20000) + 10800,
          suffix: 'U',
        },
        {
          date: '2024-09-05',
          status: 'received',
          amount: Math.floor(Math.random() * 24000) + 12500,
          suffix: 'V',
        },
        {
          date: '2024-09-22',
          status: 'received',
          amount: Math.floor(Math.random() * 21000) + 11200,
          suffix: 'W',
        },
        {
          date: '2024-10-08',
          status: 'received',
          amount: Math.floor(Math.random() * 25000) + 13000,
          suffix: 'X',
        },
        {
          date: '2024-10-25',
          status: 'received',
          amount: Math.floor(Math.random() * 22000) + 11800,
          suffix: 'Y',
        },
      ];

      for (const order of orders) {
        await client.query(
          `
          INSERT INTO purchase_orders (order_number, date, supplier_id, supplier_name, total_items, total_amount, status, notes)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `,
          [
            `PO-${prov.id}-${order.suffix}`,
            order.date,
            prov.id,
            prov.title,
            Math.floor(Math.random() * 20) + 5,
            order.amount,
            order.status,
            `Orden ${order.status === 'received' ? 'completada' : 'pendiente'} - ${order.date}`,
          ]
        );

        totalOrders++;
      }

      console.log(`  ✓ ${prov.title.substring(0, 35)}... - 15 órdenes agregadas`);
    }

    console.log(`\n✅ ${totalOrders} órdenes agregadas\n`);

    // Resumen final
    const summary = await client.query(`
      SELECT 
        p.id,
        p.title,
        COUNT(po.id) as total_ordenes,
        COALESCE(SUM(po.total_amount::numeric), 0)::numeric(10,2) as total_comprado
      FROM providers p
      LEFT JOIN purchase_orders po ON p.id = po.supplier_id
      GROUP BY p.id, p.title
      ORDER BY p.id
    `);

    console.log('📊 Resumen final:\n');
    console.table(summary.rows);

    console.log('\n✅ Ahora cada distribuidora tiene ~25 órdenes de historial!');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
