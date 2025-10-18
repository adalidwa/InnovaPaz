-- ==============================================
--     QUERIES OPTIMIZADOS PARA TUS DATOS REALES
--     Dashboard de Inventarios - INNOVAPAZ
-- ==============================================

-- ==============================================
--           1. MOVIMIENTOS RECIENTES
-- ==============================================

-- Query para obtener los últimos movimientos (igual al formato de tu imagen)
SELECT 
    CASE 
        WHEN tm.tipo = 'entrada' THEN 'Entrada de ' || p.nombre_producto
        WHEN tm.tipo = 'salida' THEN 'Salida de ' || p.nombre_producto
        ELSE tm.nombre || ' de ' || p.nombre_producto
    END as nombre_movimiento,
    
    -- Formatear la hora como en tu imagen (ej: "08:09 p. m.")
    TO_CHAR(mi.fecha_movimiento, 'HH24:MI') || 
    CASE 
        WHEN EXTRACT(HOUR FROM mi.fecha_movimiento) < 12 THEN ' a. m.'
        ELSE ' p. m.'
    END as hora_formateada,
    
    -- Tipo de movimiento para el badge/color
    tm.tipo as tipo_movimiento,
    mi.cantidad,
    mi.motivo,
    p.nombre_producto,
    mi.fecha_movimiento,
    
    -- Información adicional
    p.codigo as codigo_producto,
    tm.nombre as tipo_movimiento_nombre

FROM movimientos_inventario mi
JOIN producto p ON mi.producto_id = p.producto_id
JOIN tipo_movimiento tm ON mi.tipo_movimiento_id = tm.tipo_movimiento_id
WHERE mi.empresa_id = $1  -- Parámetro para empresa_id
    AND mi.fecha_movimiento >= CURRENT_DATE - INTERVAL '7 days'  -- Últimos 7 días
ORDER BY mi.fecha_movimiento DESC
LIMIT 10;

-- ==============================================
--           2. PRODUCTOS CRÍTICOS
-- ==============================================

-- Query para productos con stock crítico o bajo
SELECT 
    p.nombre_producto,
    p.codigo,
    p.stock as stock_actual,
    COALESCE(a.stock_minimo, 0) as stock_minimo,
    
    -- Estado del stock
    CASE 
        WHEN p.stock = 0 THEN 'Sin Stock'
        WHEN a.stock_minimo IS NULL THEN 'No definido'
        WHEN p.stock < a.stock_minimo THEN 'Crítico'
        WHEN p.stock <= (a.stock_minimo * 1.2) THEN 'Bajo'
        ELSE 'Normal'
    END as estado_stock,
    
    -- Texto descriptivo para la UI
    CASE 
        WHEN a.stock_minimo IS NOT NULL 
        THEN 'Stock: ' || p.stock || ' | Mínimo: ' || a.stock_minimo
        ELSE 'Stock: ' || p.stock || ' | Mínimo: No definido'
    END as detalle_stock,
    
    p.producto_id,
    p.precio_venta,
    c.nombre_categoria,
    m.nombre as marca

FROM producto p
LEFT JOIN aprovisionamiento a ON p.producto_id = a.producto_id
LEFT JOIN categorias c ON p.categoria_id = c.categoria_id
LEFT JOIN marca m ON p.marca_id = m.marca_id
WHERE p.empresa_id = $1  -- Parámetro para empresa_id
    AND (
        -- Productos críticos o con stock bajo
        (a.stock_minimo IS NOT NULL AND p.stock < a.stock_minimo)  
        OR (a.stock_minimo IS NOT NULL AND p.stock <= (a.stock_minimo * 1.2))
        OR (a.stock_minimo IS NULL AND p.stock < 10)  -- Sin mínimo definido pero stock muy bajo
        OR p.stock = 0  -- Sin stock
    )
ORDER BY 
    CASE 
        WHEN p.stock = 0 THEN 1  -- Sin stock primero
        WHEN a.stock_minimo IS NOT NULL AND p.stock < a.stock_minimo THEN 2  -- Críticos
        WHEN a.stock_minimo IS NOT NULL AND p.stock <= (a.stock_minimo * 1.2) THEN 3  -- Bajos
        ELSE 4  -- Otros
    END,
    p.stock ASC;  -- Los de menor stock primero

-- ==============================================
--         3. RESUMEN DASHBOARD (MÉTRICAS)
-- ==============================================

-- Contadores generales para el dashboard
SELECT 
    -- Total de productos
    (SELECT COUNT(*) FROM producto WHERE empresa_id = $1) as total_productos,
    
    -- Productos críticos
    (SELECT COUNT(*) 
     FROM producto p 
     LEFT JOIN aprovisionamiento a ON p.producto_id = a.producto_id 
     WHERE p.empresa_id = $1 
       AND ((a.stock_minimo IS NOT NULL AND p.stock < a.stock_minimo) 
            OR (a.stock_minimo IS NULL AND p.stock < 10) 
            OR p.stock = 0)
    ) as productos_criticos,
    
    -- Productos con stock bajo
    (SELECT COUNT(*) 
     FROM producto p 
     LEFT JOIN aprovisionamiento a ON p.producto_id = a.producto_id 
     WHERE p.empresa_id = $1 
       AND a.stock_minimo IS NOT NULL 
       AND p.stock > a.stock_minimo 
       AND p.stock <= (a.stock_minimo * 1.2)
    ) as productos_bajo_stock,
    
    -- Movimientos hoy
    (SELECT COUNT(*) 
     FROM movimientos_inventario 
     WHERE empresa_id = $1 
       AND DATE(fecha_movimiento) = CURRENT_DATE
    ) as movimientos_hoy,
    
    -- Entradas últimos 7 días
    (SELECT COALESCE(SUM(cantidad), 0)
     FROM movimientos_inventario mi
     JOIN tipo_movimiento tm ON mi.tipo_movimiento_id = tm.tipo_movimiento_id
     WHERE mi.empresa_id = $1 
       AND mi.fecha_movimiento >= CURRENT_DATE - INTERVAL '7 days'
       AND tm.tipo = 'entrada'
    ) as entradas_semana,
    
    -- Salidas últimos 7 días
    (SELECT COALESCE(SUM(cantidad), 0)
     FROM movimientos_inventario mi
     JOIN tipo_movimiento tm ON mi.tipo_movimiento_id = tm.tipo_movimiento_id
     WHERE mi.empresa_id = $1 
       AND mi.fecha_movimiento >= CURRENT_DATE - INTERVAL '7 days'
       AND tm.tipo = 'salida'  
    ) as salidas_semana,
    
    -- Valor total del inventario
    (SELECT COALESCE(ROUND(SUM(p.stock * p.precio_costo), 2), 0)
     FROM producto p
     WHERE p.empresa_id = $1
    ) as valor_inventario_total;

-- ==============================================
--        4. MOVIMIENTOS POR TIPO (GRÁFICOS)
-- ==============================================

-- Para gráficos de movimientos
SELECT 
    tm.nombre as tipo_movimiento,
    tm.tipo,
    COUNT(*) as cantidad_movimientos,
    COALESCE(SUM(mi.cantidad), 0) as total_unidades,
    DATE(mi.fecha_movimiento) as fecha
FROM movimientos_inventario mi
JOIN tipo_movimiento tm ON mi.tipo_movimiento_id = tm.tipo_movimiento_id
WHERE mi.empresa_id = $1
    AND mi.fecha_movimiento >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY tm.nombre, tm.tipo, DATE(mi.fecha_movimiento)
ORDER BY fecha DESC, tipo_movimiento;

-- ==============================================
--         5. TOP PRODUCTOS (ANÁLISIS)
-- ==============================================

-- Productos más vendidos (basado en movimientos de salida)
SELECT 
    p.nombre_producto,
    p.codigo,
    p.stock,
    COALESCE(SUM(CASE WHEN tm.tipo = 'salida' THEN mi.cantidad ELSE 0 END), 0) as total_vendido,
    COALESCE(SUM(CASE WHEN tm.tipo = 'entrada' THEN mi.cantidad ELSE 0 END), 0) as total_comprado,
    p.precio_venta,
    (COALESCE(SUM(CASE WHEN tm.tipo = 'salida' THEN mi.cantidad ELSE 0 END), 0) * p.precio_venta) as ingresos_estimados
FROM producto p
LEFT JOIN movimientos_inventario mi ON p.producto_id = mi.producto_id
LEFT JOIN tipo_movimiento tm ON mi.tipo_movimiento_id = tm.tipo_movimiento_id
WHERE p.empresa_id = $1
    AND (mi.fecha_movimiento >= CURRENT_DATE - INTERVAL '30 days' OR mi.fecha_movimiento IS NULL)
GROUP BY p.producto_id, p.nombre_producto, p.codigo, p.stock, p.precio_venta
ORDER BY total_vendido DESC
LIMIT 10;

-- ==============================================
--                EJEMPLOS DE USO
-- ==============================================

/*
CÓMO USAR ESTOS QUERIES:

1. MOVIMIENTOS RECIENTES - Para la empresa Marco:
   SELECT ... WHERE mi.empresa_id = 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47';

2. PRODUCTOS CRÍTICOS - Para la empresa Melones:
   SELECT ... WHERE p.empresa_id = 'ebc8d621-58ad-4951-a770-160010b8f7d0';

3. RESUMEN DASHBOARD - Para la empresa Hola:
   SELECT ... WHERE empresa_id = '5dc644b0-3ce9-4c41-a83d-c7da2962214d';

EMPRESAS DISPONIBLES:
- Marco (Ferretería): d03e9c21-1d2c-459f-ab01-4dc44b43bc47
- Melones (Minimarket): ebc8d621-58ad-4951-a770-160010b8f7d0
- Hola (Licorería): 5dc644b0-3ce9-4c41-a83d-c7da2962214d

RESULTADOS ESPERADOS DESPUÉS DE EJECUTAR completar-aprovisionamiento.sql:
- 6-7 productos críticos
- Movimientos recientes funcionando
- Métricas del dashboard completas
*/