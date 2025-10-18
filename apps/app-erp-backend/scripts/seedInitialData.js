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
      'INSERT INTO tipos_empresa (tipo_empresa, fecha_creacion) VALUES ($1, NOW()) ON CONFLICT (tipo_empresa) DO NOTHING',
      [tipo]
    );
    console.log(`Tipo de empresa "${tipo}" insertado.`);
  }
}

async function seedTiposMovimiento() {
  const tiposMovimiento = [
    {
      nombre: 'Entrada por Compra',
      tipo: 'entrada',
      descripcion: 'Ingreso de productos por compra a proveedor',
    },
    {
      nombre: 'Salida por Venta',
      tipo: 'salida',
      descripcion: 'Salida de productos por venta a cliente',
    },
    {
      nombre: 'Entrada por Devolución',
      tipo: 'entrada',
      descripcion: 'Ingreso de productos devueltos por cliente',
    },
    {
      nombre: 'Salida por Devolución',
      tipo: 'salida',
      descripcion: 'Salida de productos devueltos a proveedor',
    },
    {
      nombre: 'Ajuste Positivo',
      tipo: 'entrada',
      descripcion: 'Ajuste de inventario - incremento',
    },
    { nombre: 'Ajuste Negativo', tipo: 'salida', descripcion: 'Ajuste de inventario - decremento' },
    { nombre: 'Entrada Manual', tipo: 'entrada', descripcion: 'Ingreso manual de productos' },
    { nombre: 'Salida Manual', tipo: 'salida', descripcion: 'Salida manual de productos' },
  ];

  for (const tipoMov of tiposMovimiento) {
    await pool.query(
      'INSERT INTO tipo_movimiento (nombre, tipo, descripcion) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [tipoMov.nombre, tipoMov.tipo, tipoMov.descripcion]
    );
    console.log(`Tipo de movimiento "${tipoMov.nombre}" insertado.`);
  }
}

async function seedEstadosProducto() {
  const estados = [
    { nombre: 'Activo', descripcion: 'Producto disponible para venta' },
    { nombre: 'Inactivo', descripcion: 'Producto no disponible temporalmente' },
    { nombre: 'Descontinuado', descripcion: 'Producto que ya no se venderá' },
  ];

  for (const estado of estados) {
    await pool.query(
      'INSERT INTO estado_producto (nombre, descripcion) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [estado.nombre, estado.descripcion]
    );
    console.log(`Estado de producto "${estado.nombre}" insertado.`);
  }
}

async function main() {
  try {
    await seedPlanes();
    await seedTiposEmpresa();
    await seedTiposMovimiento();
    await seedEstadosProducto();
    console.log('Datos iniciales insertados correctamente.');
  } catch (err) {
    console.error('Error al insertar datos iniciales:', err.message);
  } finally {
    await pool.end();
  }
}

main();
