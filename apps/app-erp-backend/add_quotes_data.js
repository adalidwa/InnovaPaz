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

    // Obtener productos y proveedores
    const products = await client.query('SELECT id, name FROM products LIMIT 10');
    const providers = await client.query('SELECT id, title FROM providers LIMIT 10');

    console.log(
      `📦 Creando 10 cotizaciones con ${products.rows.length} productos y ${providers.rows.length} proveedores...\n`
    );

    let totalQuotes = 0;
    let totalQuoteItems = 0;

    // Crear 10 cotizaciones
    for (let i = 0; i < 10; i++) {
      const product = products.rows[i % products.rows.length];
      const date = new Date();
      date.setDate(date.getDate() - i * 3); // Cotizaciones de los últimos 30 días

      // Crear cotización
      const quoteResult = await client.query(
        `
        INSERT INTO quotes (product_id, product_name, date, status)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `,
        [product.id, product.name, date.toISOString().split('T')[0], 'completed']
      );

      const quoteId = quoteResult.rows[0].id;
      totalQuotes++;

      // Agregar 2-3 ofertas de diferentes proveedores para cada cotización
      const numOffers = Math.floor(Math.random() * 2) + 2; // 2 o 3 ofertas
      const prices = [];

      for (let j = 0; j < numOffers; j++) {
        const provider = providers.rows[j % providers.rows.length];
        const basePrice = Math.floor(Math.random() * 100) + 50;
        const price = (basePrice + (Math.random() * 20 - 10)).toFixed(2);
        prices.push({
          price: parseFloat(price),
          providerId: provider.id,
          providerName: provider.title,
        });
      }

      // Marcar la mejor oferta
      const bestPrice = Math.min(...prices.map((p) => p.price));

      for (const priceInfo of prices) {
        await client.query(
          `
          INSERT INTO quote_items (quote_id, supplier_id, supplier_name, price, is_best, notes)
          VALUES ($1, $2, $3, $4, $5, $6)
        `,
          [
            quoteId,
            priceInfo.providerId,
            priceInfo.providerName,
            priceInfo.price,
            priceInfo.price === bestPrice,
            priceInfo.price === bestPrice ? 'Mejor oferta' : 'Precio estándar',
          ]
        );
        totalQuoteItems++;

        // Agregar al historial de precios
        await client.query(
          `
          INSERT INTO historical_prices (product_id, product_name, date, price, supplier_id, supplier_name)
          VALUES ($1, $2, $3, $4, $5, $6)
        `,
          [
            product.id,
            product.name,
            date.toISOString().split('T')[0],
            priceInfo.price,
            priceInfo.providerId,
            priceInfo.providerName,
          ]
        );
      }

      console.log(`  ✓ Cotización ${i + 1}: ${product.name} con ${numOffers} ofertas`);
    }

    console.log(
      `\n✅ ${totalQuotes} cotizaciones creadas con ${totalQuoteItems} ofertas totales\n`
    );

    // Resumen
    const summary = await client.query(`
      SELECT 
        COUNT(DISTINCT q.id) as cotizaciones,
        COUNT(qi.id) as ofertas_totales,
        COUNT(DISTINCT qi.supplier_id) as proveedores,
        ROUND(AVG(qi.price), 2) as precio_promedio
      FROM quotes q
      LEFT JOIN quote_items qi ON q.id = qi.quote_id
    `);

    console.log('📊 Resumen:\n');
    console.table(summary.rows);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
