#!/bin/bash

# ================================================================
# Script de prueba para el nuevo sistema de plantillas de roles
# ================================================================

echo "🧪 Probando nuevo sistema de plantillas de roles"
echo "================================================"

# Datos de prueba
EMPRESA_ID="d03e9c21-1d2c-459f-ab01-4dc44b43bc47"
BASE_URL="http://localhost:4000"

echo ""
echo "1️⃣ Probando endpoint de plantillas disponibles..."
curl -s -X GET "$BASE_URL/api/roles-plantilla/empresa/$EMPRESA_ID/plantillas" | jq '.' 2>/dev/null || echo "❌ Error o jq no instalado"

echo ""
echo "2️⃣ Probando endpoint de roles disponibles completos..."
curl -s -X GET "$BASE_URL/api/roles-plantilla/empresa/$EMPRESA_ID/disponibles" | jq '.' 2>/dev/null || echo "❌ Error o jq no instalado"

echo ""
echo "3️⃣ Probando endpoint de estadísticas..."
curl -s -X GET "$BASE_URL/api/roles-plantilla/empresa/$EMPRESA_ID/estadisticas" | jq '.' 2>/dev/null || echo "❌ Error o jq no instalado"

echo ""
echo "4️⃣ Verificando plantillas en base de datos..."
PGPASSWORD="rrPJQJDlceA4jF1rm3hE8mXKyn07CDe0" psql -h dpg-d3i40ladbo4c73fdfdl0-a.oregon-postgres.render.com -p 5432 -U innovapaz_erp_db_user -d innovapaz_erp_db -c "
SELECT 
    rp.nombre_rol,
    te.tipo_empresa,
    rp.orden_visualizacion
FROM roles_plantilla rp
JOIN tipos_empresa te ON rp.tipo_empresa_id = te.tipo_id
ORDER BY te.tipo_empresa, rp.orden_visualizacion;
"

echo ""
echo "5️⃣ Verificando usuarios con plantillas..."
PGPASSWORD="rrPJQJDlceA4jF1rm3hE8mXKyn07CDe0" psql -h dpg-d3i40ladbo4c73fdfdl0-a.oregon-postgres.render.com -p 5432 -U innovapaz_erp_db_user -d innovapaz_erp_db -c "
SELECT 
    u.nombre_completo,
    u.rol_id,
    u.plantilla_rol_id,
    rp.nombre_rol as plantilla_nombre,
    e.nombre as empresa_nombre
FROM usuarios u
LEFT JOIN roles_plantilla rp ON u.plantilla_rol_id = rp.plantilla_id
LEFT JOIN empresas e ON u.empresa_id = e.empresa_id
ORDER BY u.fecha_creacion DESC
LIMIT 5;
"

echo ""
echo "✅ Prueba completada"