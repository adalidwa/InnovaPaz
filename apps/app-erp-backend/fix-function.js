const db = require('./db');

async function fixFunction() {
  try {
    console.log('🔧 Corrigiendo función obtener_usuario_con_rol...');

    // Eliminar la función existente
    await db.query(`DROP FUNCTION IF EXISTS obtener_usuario_con_rol(character varying);`);
    console.log('✅ Función anterior eliminada');

    // Crear la función corregida
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION obtener_usuario_con_rol(p_uid character varying)
      RETURNS TABLE(
        uid character varying,
        empresa_id uuid,
        nombre_completo character varying,
        email character varying,
        estado_usuario character varying,
        nombre_rol character varying,
        permisos jsonb,
        tipo_rol text,
        nombre_empresa character varying,
        tipo_empresa character varying
      )
      LANGUAGE plpgsql
      AS $$
      BEGIN
        RETURN QUERY
        SELECT 
          vuc.uid,
          vuc.empresa_id,
          vuc.nombre_completo,
          vuc.email,
          vuc.estado_usuario,
          vuc.nombre_rol,
          vuc.permisos,
          vuc.tipo_rol,
          vuc.nombre_empresa,
          vuc.tipo_empresa
        FROM vista_usuarios_completa vuc
        WHERE vuc.uid = p_uid;
      END;
      $$;
    `;

    await db.query(createFunctionSQL);
    console.log('✅ Función obtener_usuario_con_rol actualizada correctamente');

    // Probar la función con un usuario existente
    console.log('🧪 Probando la función...');
    const testResult = await db.query(
      `SELECT * FROM obtener_usuario_con_rol('rhgBrCmEK2OQfQk4kQfiCIz4fy83') LIMIT 1;`
    );

    if (testResult.rows.length > 0) {
      console.log('✅ Función funciona correctamente');
      console.log('📋 Resultado de prueba:');
      console.log(testResult.rows[0]);
    } else {
      console.log('⚠️  Función creada pero no hay datos de prueba');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixFunction();
