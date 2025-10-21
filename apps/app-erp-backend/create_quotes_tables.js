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

    console.log('📦 Creando tablas para módulo de cotizaciones...\n');

    // Tabla de cotizaciones
    await client.query(`
      CREATE TABLE IF NOT EXISTS quotes (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
        product_name VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('  ✓ Tabla quotes creada');

    // Tabla de items de cotización (una cotización puede tener múltiples ofertas de proveedores)
    await client.query(`
      CREATE TABLE IF NOT EXISTS quote_items (
        id SERIAL PRIMARY KEY,
        quote_id INTEGER REFERENCES quotes(id) ON DELETE CASCADE,
        supplier_id INTEGER REFERENCES providers(id) ON DELETE SET NULL,
        supplier_name VARCHAR(255) NOT NULL,
        price NUMERIC(12,2) NOT NULL,
        is_best BOOLEAN DEFAULT false,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('  ✓ Tabla quote_items creada');

    // Tabla de historial de precios
    await client.query(`
      CREATE TABLE IF NOT EXISTS historical_prices (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
        product_name VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        price NUMERIC(12,2) NOT NULL,
        supplier_id INTEGER REFERENCES providers(id) ON DELETE SET NULL,
        supplier_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('  ✓ Tabla historical_prices creada');

    // Índices para optimizar búsquedas
    await client.query('CREATE INDEX IF NOT EXISTS idx_quotes_product ON quotes(product_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_quotes_date ON quotes(date)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_quote_items_quote ON quote_items(quote_id)');
    await client.query(
      'CREATE INDEX IF NOT EXISTS idx_quote_items_supplier ON quote_items(supplier_id)'
    );
    await client.query(
      'CREATE INDEX IF NOT EXISTS idx_historical_prices_product ON historical_prices(product_id)'
    );
    await client.query(
      'CREATE INDEX IF NOT EXISTS idx_historical_prices_date ON historical_prices(date)'
    );
    console.log('  ✓ Índices creados');

    console.log('\n✅ Tablas de cotizaciones creadas exitosamente!');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
