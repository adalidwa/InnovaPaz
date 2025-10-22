// Script para probar los reportes actualizados
const axios = require('axios');

async function testReportes() {
  const baseURL = 'http://localhost:4000/api/reports';
  const empresaId = 'bdd7888b-49a7-4824-bdf2-0890ce9c3af4';

  console.log('🧪 PROBANDO MÓDULO DE REPORTES ACTUALIZADO\n');

  const tests = [
    {
      name: 'Dashboard General',
      url: `${baseURL}/generate/dashboard?empresa_id=${empresaId}&periodo=mes_actual`
    },
    {
      name: 'Reporte de Usuarios',
      url: `${baseURL}/generate/usuarios?empresa_id=${empresaId}`
    },
    {
      name: 'Reporte de Productos/Inventario',
      url: `${baseURL}/generate/productos?empresa_id=${empresaId}`
    },
    {
      name: 'Reporte de Ventas',
      url: `${baseURL}/generate/ventas?empresa_id=${empresaId}`
    },
    {
      name: 'Reporte de Inventario Completo',
      url: `${baseURL}/generate/inventario?empresa_id=${empresaId}`
    },
    {
      name: 'Reporte de Movimientos de Inventario',
      url: `${baseURL}/generate/movimientos-inventario?empresa_id=${empresaId}`
    },
    {
      name: 'Reporte de Alertas',
      url: `${baseURL}/generate/alertas?empresa_id=${empresaId}&stock_minimo=10`
    },
    {
      name: 'Reporte de Roles',
      url: `${baseURL}/generate/roles?empresa_id=${empresaId}`
    },
    {
      name: 'Reporte de Invitaciones',
      url: `${baseURL}/generate/invitaciones?empresa_id=${empresaId}`
    }
  ];

  for (const test of tests) {
    try {
      console.log(`📊 Probando: ${test.name}`);
      const response = await axios.get(test.url, { timeout: 10000 });
      
      if (response.data.success) {
        console.log(`   ✅ Éxito - Tiempo: ${response.data.tiempo_ejecucion_ms}ms`);
        
        // Mostrar información específica según el tipo de reporte
        if (test.name === 'Dashboard General') {
          const metrics = response.data.metricas;
          console.log(`      👥 Usuarios: ${metrics.usuarios.total_usuarios}`);
          console.log(`      📦 Productos: ${metrics.productos.total_productos}`);
          console.log(`      💰 Ventas: ${metrics.ventas.total_ventas_periodo}`);
        } else if (test.name.includes('Usuarios')) {
          console.log(`      👥 Total usuarios: ${response.data.estadisticas.total}`);
        } else if (test.name.includes('Productos') || test.name.includes('Inventario')) {
          const stats = response.data.estadisticas;
          console.log(`      📦 Total productos: ${stats.total_productos || 'N/A'}`);
        } else if (test.name.includes('Ventas')) {
          const stats = response.data.estadisticas;
          console.log(`      💰 Total ventas: ${stats.total_ventas || 'N/A'}`);
        } else if (test.name.includes('Alertas')) {
          const resumen = response.data.resumen;
          console.log(`      ⚠️  Total alertas: ${resumen.total_alertas}`);
        }
      } else {
        console.log(`   ❌ Error: ${response.data.message}`);
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`   ❌ Error: Servidor no disponible`);
        break;
      } else {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
    console.log('');
  }

  console.log('🎉 PRUEBAS COMPLETADAS');
}

testReportes().catch(console.error);