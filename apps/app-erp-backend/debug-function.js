const db = require('./db');

async function checkFunction() {
  try {
    console.log('🔍 Revisando función obtener_usuario_con_rol...');

    // Obtener la definición de la función
    const functionDef = await db.query(`
      SELECT routine_definition 
      FROM information_schema.routines 
      WHERE routine_name = 'obtener_usuario_con_rol'
    `);

    if (functionDef.rows.length === 0) {
      console.log('❌ La función obtener_usuario_con_rol no existe');
      return;
    }

    console.log('📋 Definición actual de la función:');
    console.log(functionDef.rows[0].routine_definition);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkFunction();
