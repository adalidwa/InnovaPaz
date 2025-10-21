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

    // Obtener productos para usar en reception_items
    const productsResult = await client.query('SELECT id, name FROM products LIMIT 20');
    const products = productsResult.rows;

    if (products.length === 0) {
      console.log('⚠️  No hay productos en la BD. Creando algunos...');

      const sampleProducts = [
        'Arroz La Pradera 1kg',
        'Azúcar Blanca 1kg',
        'Aceite Girasol 1L',
        'Fideos Spaghetti 500g',
        'Harina de Trigo 1kg',
        'Sal Fina 1kg',
        'Café Molido 250g',
        'Té Negro 100g',
        'Leche Entera 1L',
        'Mantequilla 250g',
        'Queso Fresco 500g',
        'Yogurt Natural 1L',
        'Pan Blanco 500g',
        'Galletas María 200g',
        'Chocolate Tableta 100g',
      ];

      for (const name of sampleProducts) {
        await client.query(
          'INSERT INTO products (name, description, category, unit_price, current_stock) VALUES ($1, $2, $3, $4, $5)',
          [
            name,
            `Producto ${name}`,
            'Abarrotes',
            Math.floor(Math.random() * 50) + 10,
            Math.floor(Math.random() * 100) + 50,
          ]
        );
      }

      const newProducts = await client.query('SELECT id, name FROM products LIMIT 20');
      products.push(...newProducts.rows);
      console.log(`✅ ${sampleProducts.length} productos creados\n`);
    }

    // Obtener recepciones sin items
    const receptionsResult = await client.query(`
      SELECT r.id, r.reception_number, r.supplier_name
      FROM receptions r
      LEFT JOIN reception_items ri ON r.id = ri.reception_id
      WHERE ri.id IS NULL
    `);

    console.log(`📦 Agregando items a ${receptionsResult.rows.length} recepciones...\n`);

    let totalItems = 0;

    for (const reception of receptionsResult.rows) {
      // Agregar entre 3-8 items por recepción
      const itemCount = Math.floor(Math.random() * 6) + 3;

      for (let i = 0; i < itemCount; i++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const expectedQty = Math.floor(Math.random() * 50) + 10;
        const receivedQty = expectedQty + Math.floor(Math.random() * 5) - 2; // -2 a +2 diferencia
        const difference = receivedQty - expectedQty;
        const unitPrice = (Math.floor(Math.random() * 100) + 10).toFixed(2);

        await client.query(
          `
          INSERT INTO reception_items 
            (reception_id, product_id, product_name, expected_quantity, received_quantity, difference, unit_price)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
          [reception.id, product.id, product.name, expectedQty, receivedQty, difference, unitPrice]
        );

        totalItems++;
      }

      if (totalItems % 50 === 0) {
        console.log(`  ✓ ${totalItems} items agregados...`);
      }
    }

    console.log(`\n✅ ${totalItems} items agregados a las recepciones\n`);

    // Resumen
    const summary = await client.query(`
      SELECT 
        r.supplier_name,
        COUNT(DISTINCT r.id) as recepciones,
        COUNT(ri.id) as items_totales,
        ROUND(AVG(ri.received_quantity), 1) as promedio_cantidad
      FROM receptions r
      LEFT JOIN reception_items ri ON r.id = ri.reception_id
      GROUP BY r.supplier_name
      ORDER BY recepciones DESC
      LIMIT 10
    `);

    console.log('📊 Resumen (Top 10 proveedores):\n');
    console.table(summary.rows);

    console.log('\n✅ Datos completos agregados al módulo de recepciones!');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
