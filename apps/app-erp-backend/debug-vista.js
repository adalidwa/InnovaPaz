const db = require('./db');

async function checkViewStructure() {
  try {
    console.log('🔍 Revisando estructura de vista_usuarios_completa...');

    // Verificar si la vista existe
    const viewExists = await db.query(`
      SELECT table_name 
      FROM information_schema.views 
      WHERE table_name = 'vista_usuarios_completa'
    `);

    if (viewExists.rows.length === 0) {
      console.log('❌ La vista vista_usuarios_completa no existe');
      return;
    }

    // Obtener la definición de la vista
    const viewDefinition = await db.query(`
      SELECT view_definition 
      FROM information_schema.views 
      WHERE table_name = 'vista_usuarios_completa'
    `);

    console.log('📋 Definición actual de la vista:');
    console.log(viewDefinition.rows[0].view_definition);

    // Verificar estructura de columnas
    const viewColumns = await db.query(`
      SELECT column_name, data_type, ordinal_position
      FROM information_schema.columns 
      WHERE table_name = 'vista_usuarios_completa'
      ORDER BY ordinal_position
    `);

    console.log('\n📊 Columnas de la vista:');
    viewColumns.rows.forEach((col, index) => {
      const marker = index === 7 ? ' ⚠️  <-- COLUMNA 8 (problema)' : '';
      console.log(`  ${col.ordinal_position}. ${col.column_name}: ${col.data_type}${marker}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkViewStructure();
