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

    // Obtener órdenes de compra con estado 'received'
    const ordersResult = await client.query(`
      SELECT id, order_number, date, supplier_id, supplier_name 
      FROM purchase_orders 
      WHERE status = 'received'
      ORDER BY date ASC
    `);

    console.log(`📦 Creando recepciones para ${ordersResult.rows.length} órdenes...\n`);

    let totalReceptions = 0;
    const receivers = ['Juan Pérez', 'María López', 'Carlos Ruiz', 'Ana García', 'Luis Torres'];

    for (const order of ordersResult.rows) {
      // Crear recepción para esta orden
      const receptionDate = new Date(order.date);
      receptionDate.setDate(receptionDate.getDate() + Math.floor(Math.random() * 3) + 1); // 1-3 días después

      const receiver = receivers[Math.floor(Math.random() * receivers.length)];
      const receptionNumber = `REC-${order.order_number.split('-')[1]}-${order.order_number.split('-')[2]}`;

      await client.query(
        `
        INSERT INTO receptions 
          (reception_number, date, order_number, supplier_id, supplier_name, received_by, status, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
        [
          receptionNumber,
          receptionDate.toISOString().split('T')[0],
          order.order_number,
          order.supplier_id,
          order.supplier_name,
          receiver,
          'completed',
          `Recepción de orden ${order.order_number} completada`,
        ]
      );

      totalReceptions++;

      if (totalReceptions % 20 === 0) {
        console.log(`  ✓ ${totalReceptions} recepciones creadas...`);
      }
    }

    console.log(`\n✅ ${totalReceptions} recepciones creadas\n`);

    // Resumen por proveedor
    const summary = await client.query(`
      SELECT 
        p.id,
        p.title as proveedor,
        COUNT(DISTINCT r.id) as recepciones,
        COUNT(DISTINCT po.id) as ordenes
      FROM providers p
      LEFT JOIN receptions r ON p.id = r.supplier_id
      LEFT JOIN purchase_orders po ON p.id = po.supplier_id
      GROUP BY p.id, p.title
      ORDER BY recepciones DESC
    `);

    console.log('📊 Resumen por proveedor:\n');
    console.table(summary.rows);

    console.log('\n✅ Historial de recepciones agregado!');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
