const pool = require('../db');

async function seedPlanes() {
  const planes = [
    {
      nombre_plan: 'Básico',
      precio_mensual: 10,
      limites: {
        miembros: 2,
        roles: 2,
        productos: 150,
        transacciones: 250,
        dashboard_reportes_basicos: true,
        soporte_email: '72h',
        reportes_estandar: false,
        exportacion: false,
        soporte_prioritario: false,
        reportes_avanzados: false,
        soporte_dedicado_chat: false,
      },
    },
    {
      nombre_plan: 'Estándar',
      precio_mensual: 50,
      limites: {
        miembros: 10,
        roles: 5,
        productos: 5000,
        transacciones: 10000,
        dashboard_reportes_basicos: false,
        soporte_email: false,
        reportes_estandar: true,
        exportacion: true,
        soporte_prioritario: '24h',
        reportes_avanzados: false,
        soporte_dedicado_chat: false,
      },
    },
    {
      nombre_plan: 'Premium',
      precio_mensual: 90,
      limites: {
        miembros: null,
        roles: null,
        productos: null,
        transacciones: null,
        dashboard_reportes_basicos: false,
        soporte_email: false,
        reportes_estandar: false,
        exportacion: true,
        soporte_prioritario: false,
        reportes_avanzados: true,
        soporte_dedicado_chat: true,
      },
    },
  ];

  for (const plan of planes) {
    await pool.query(
      'INSERT INTO planes (nombre_plan, precio_mensual, limites, fecha_creacion) VALUES ($1, $2, $3, NOW())',
      [plan.nombre_plan, plan.precio_mensual, JSON.stringify(plan.limites)]
    );
    console.log(`Plan "${plan.nombre_plan}" insertado.`);
  }
}

async function seedTiposEmpresa() {
  const tipos = ['Minimarket', 'Ferreteria', 'Licoreria'];
  for (const tipo of tipos) {
    await pool.query(
      'INSERT INTO tipos_empresa (tipo_empresa, fecha_creacion) VALUES ($1, NOW())',
      [tipo]
    );
    console.log(`Tipo de empresa "${tipo}" insertado.`);
  }
}

async function main() {
  try {
    await seedPlanes();
    await seedTiposEmpresa();
    console.log('Datos iniciales insertados correctamente.');
  } catch (err) {
    console.error('Error al insertar datos iniciales:', err.message);
  } finally {
    await pool.end();
  }
}

main();
