-- ==============================================
--     QUERIES PARA DASHBOARD DE INVENTARIOS
--     Proyecto INNOVAPAZ - Módulo de Inventarios
-- ==============================================

-- ==============================================
--           1. MOVIMIENTOS RECIENTES
-- ==============================================

-- Query principal para obtener los últimos movimientos (como en la imagen)
-- Devuelve: nombre del movimiento, hora, tipo, cantidad
SELECT 
    CASE 
        WHEN tm.tipo = 'entrada' THEN 'Entrada de ' || p.nombre_producto
        WHEN tm.tipo = 'salida' THEN 'Salida de ' || p.nombre_producto
        ELSE 'Movimiento de ' || p.nombre_producto
    END as nombre_movimiento,
    
    TO_CHAR(mi.fecha_movimiento, 'HH24:MI') || ' ' || 
    CASE 
        WHEN DATE(mi.fecha_movimiento) = CURRENT_DATE THEN 'p. m.'
        WHEN DATE(mi.fecha_movimiento) = CURRENT_DATE - 1 THEN 'a. m.'
        ELSE 'p. m.'
    END as hora_formateada,
    
    tm.tipo as tipo_movimiento,
    mi.cantidad,
    mi.motivo,
    
    -- Calcular si es de hoy, ayer, etc.
    CASE 
        WHEN DATE(mi.fecha_movimiento) = CURRENT_DATE THEN 'Hoy'
        WHEN DATE(mi.fecha_movimiento) = CURRENT_DATE - 1 THEN 'Ayer'
        ELSE TO_CHAR(mi.fecha_movimiento, 'DD/MM')
    END as dia_relativo,
    
    p.nombre_producto,
    mi.fecha_movimiento

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

-- Query para productos con stock crítico (como en la imagen)
-- Devuelve: nombre, stock actual, stock mínimo, estado
SELECT 
    p.nombre_producto,
    p.stock as stock_actual,
    COALESCE(a.stock_minimo, 0) as stock_minimo,
    
    -- Calcular el estado basado en stock vs mínimo
    CASE 
        WHEN p.stock = 0 THEN 'Sin Stock'
        WHEN a.stock_minimo IS NULL THEN 'No definido'
        WHEN p.stock < a.stock_minimo THEN 'Crítico'
        WHEN p.stock <= (a.stock_minimo * 1.2) THEN 'Bajo'
        ELSE 'Normal'
    END as estado_stock,
    
    -- Texto para mostrar en la UI
    CONCAT('Stock: ', p.stock, 
           CASE 
               WHEN a.stock_minimo IS NOT NULL THEN ' | Mínimo: ' || a.stock_minimo
               ELSE ' | Mínimo: No definido'
           END) as detalle_stock,
    
    p.producto_id,
    p.codigo,
    c.nombre_categoria

FROM producto p
LEFT JOIN aprovisionamiento a ON p.producto_id = a.producto_id
LEFT JOIN categorias c ON p.categoria_id = c.categoria_id
WHERE p.empresa_id = $1  -- Parámetro para empresa_id
    AND (
        (a.stock_minimo IS NOT NULL AND p.stock < a.stock_minimo)  -- Stock bajo definido
        OR (a.stock_minimo IS NULL AND p.stock < 10)  -- Sin mínimo definido pero stock muy bajo
        OR p.stock = 0  -- Sin stock
    )
ORDER BY 
    CASE 
        WHEN p.stock = 0 THEN 1  -- Sin stock primero
        WHEN a.stock_minimo IS NOT NULL AND p.stock < a.stock_minimo THEN 2  -- Críticos
        ELSE 3  -- Otros
    END,
    p.stock ASC;  -- Los de menor stock primero

-- ==============================================
--         3. RESUMEN GENERAL DEL DASHBOARD
-- ==============================================

-- Contadores para el dashboard
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
    
    -- Movimientos hoy
    (SELECT COUNT(*) 
     FROM movimientos_inventario 
     WHERE empresa_id = $1 
       AND DATE(fecha_movimiento) = CURRENT_DATE
    ) as movimientos_hoy,
    
    -- Entradas hoy
    (SELECT COALESCE(SUM(cantidad), 0)
     FROM movimientos_inventario mi
     JOIN tipo_movimiento tm ON mi.tipo_movimiento_id = tm.tipo_movimiento_id
     WHERE mi.empresa_id = $1 
       AND DATE(mi.fecha_movimiento) = CURRENT_DATE
       AND tm.tipo = 'entrada'
    ) as entradas_hoy,
    
    -- Salidas hoy
    (SELECT COALESCE(SUM(cantidad), 0)
     FROM movimientos_inventario mi
     JOIN tipo_movimiento tm ON mi.tipo_movimiento_id = tm.tipo_movimiento_id
     WHERE mi.empresa_id = $1 
       AND DATE(mi.fecha_movimiento) = CURRENT_DATE
       AND tm.tipo = 'salida'
    ) as salidas_hoy;

-- ==============================================
--          4. QUERY PARA PRODUCTOS POR ALMACÉN
-- ==============================================

-- Inventario por almacén (útil para gestión detallada)
SELECT 
    a.nombre as almacen,
    p.nombre_producto,
    p.codigo,
    i.cantidad_actual,
    p.precio_venta,
    (i.cantidad_actual * p.precio_costo) as valor_inventario
FROM inventario i
JOIN almacenes a ON i.almacen_id = a.almacen_id
JOIN producto p ON i.producto_id = p.producto_id
WHERE a.empresa_id = $1
    AND a.activo = true
    AND i.cantidad_actual > 0
ORDER BY a.nombre, p.nombre_producto;

-- ==============================================
--        5. QUERY PARA PRODUCTOS MÁS VENDIDOS
-- ==============================================

-- Top 10 productos más vendidos (para insights)
SELECT 
    p.nombre_producto,
    p.codigo,
    p.cantidad_vendidos,
    p.stock,
    c.nombre_categoria,
    m.nombre as marca
FROM producto p
LEFT JOIN categorias c ON p.categoria_id = c.categoria_id
LEFT JOIN marca m ON p.marca_id = m.marca_id
WHERE p.empresa_id = $1
ORDER BY p.cantidad_vendidos DESC
LIMIT 10;

-- ==============================================
--           6. QUERIES PARA FILTROS
-- ==============================================

-- Obtener categorías disponibles
SELECT DISTINCT 
    c.categoria_id,
    c.nombre_categoria
FROM categorias c
JOIN producto p ON c.categoria_id = p.categoria_id
WHERE p.empresa_id = $1
ORDER BY c.nombre_categoria;

-- Obtener almacenes activos
SELECT 
    almacen_id,
    nombre,
    direccion
FROM almacenes
WHERE empresa_id = $1 AND activo = true
ORDER BY nombre;

-- ==============================================
--                   NOTAS DE USO
-- ==============================================

/*
CÓMO USAR ESTOS QUERIES EN TU BACKEND:

1. MOVIMIENTOS RECIENTES:
   - Usar el primer query con el empresa_id como parámetro
   - El resultado tiene el formato exacto para mostrar como en tu imagen
   - Campos: nombre_movimiento, hora_formateada, tipo_movimiento, cantidad

2. PRODUCTOS CRÍTICOS:
   - Usar el segundo query con el empresa_id como parámetro
   - Filtra automáticamente productos con stock bajo o crítico
   - Campos: nombre_producto, stock_actual, stock_minimo, estado_stock

3. DASHBOARD RESUMEN:
   - El tercer query te da contadores para métricas generales
   - Úsalo para mostrar cards de resumen en la parte superior

EJEMPLO DE IMPLEMENTACIÓN EN EXPRESS.JS:

// Endpoint para movimientos recientes
app.get('/api/inventory/recent-movements/:empresaId', async (req, res) => {
  const { empresaId } = req.params;
  const result = await pool.query(QUERY_MOVIMIENTOS_RECIENTES, [empresaId]);
  res.json(result.rows);
});

// Endpoint para productos críticos
app.get('/api/inventory/critical-products/:empresaId', async (req, res) => {
  const { empresaId } = req.params;
  const result = await pool.query(QUERY_PRODUCTOS_CRITICOS, [empresaId]);
  res.json(result.rows);
});

PARÁMETROS:
- Todos los queries usan $1 como parámetro para empresa_id
- Asegúrate de usar el UUID: '550e8400-e29b-41d4-a716-446655440000'
*/