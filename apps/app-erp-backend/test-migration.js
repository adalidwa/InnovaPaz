const db = require('./db');

async function runMigration() {
  try {
    console.log('🔧 Ejecutando migración para agregar columna plantilla_id_origen...');

    // Verificar si ya existe la columna
    const checkColumn = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'roles' AND column_name = 'plantilla_id_origen'
    `);

    if (checkColumn.rows.length > 0) {
      console.log('✅ La columna plantilla_id_origen ya existe');
    } else {
      // Agregar la columna
      await db.query(`
        ALTER TABLE roles 
        ADD COLUMN plantilla_id_origen INTEGER REFERENCES roles_plantilla(plantilla_id);
      `);
      console.log('✅ Columna plantilla_id_origen agregada exitosamente');
    }

    // Verificar la estructura actual de la tabla roles
    const tableStructure = await db.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'roles'
      ORDER BY ordinal_position
    `);

    console.log('📋 Estructura actual de la tabla roles:');
    tableStructure.rows.forEach((row) => {
      console.log(
        `  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`
      );
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    process.exit(1);
  }
}

runMigration();
