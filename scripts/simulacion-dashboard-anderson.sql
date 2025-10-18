-- =====================================================
-- SIMULACIÓN DE DATOS PARA DASHBOARD DE INVENTARIOS
-- Usuario: Anderson Checa Tito (ande@gmail.com)
-- =====================================================

-- Paso 1: Obtener el empresa_id del usuario Anderson
-- (Ejecuta primero este query para obtener el empresa_id)
SELECT u.usuario_id, u.nombre, u.email, u.empresa_id, e.nombre_empresa
FROM usuarios u
INNER JOIN empresas e ON u.empresa_id = e.empresa_id
WHERE u.email = 'ande@gmail.com';

-- Resultado esperado: Copia el empresa_id para usar en los siguientes queries

-- =====================================================
-- PASO 2: CREAR PRODUCTOS DE EJEMPLO (SI NO EXISTEN)
-- =====================================================
-- Reemplaza 'TU_EMPRESA_ID_AQUI' con el empresa_id obtenido del query anterior

INSERT INTO producto (
    nombre_producto, 
    precio_venta, 
    precio_costo, 
    stock, 
    cantidad_vendidos, 
    empresa_id, 
    estado_id, 
    fecha_creacion, 
    fecha_modificacion
) VALUES 
-- Productos con stock normal
('Laptop Dell Inspiron 15', 8500.00, 7200.00, 25, 5, 'TU_EMPRESA_ID_AQUI', 1, NOW() - INTERVAL '30 days', NOW()),
('Mouse Logitech MX Master', 450.00, 380.00, 50, 12, 'TU_EMPRESA_ID_AQUI', 1, NOW() - INTERVAL '25 days', NOW()),
('Teclado Mecánico RGB', 680.00, 520.00, 30, 8, 'TU_EMPRESA_ID_AQUI', 1, NOW() - INTERVAL '20 days', NOW()),
('Monitor Samsung 24"', 1200.00, 950.00, 15, 3, 'TU_EMPRESA_ID_AQUI', 1, NOW() - INTERVAL '15 days', NOW()),
('Disco SSD 500GB', 420.00, 350.00, 40, 15, 'TU_EMPRESA_ID_AQUI', 1, NOW() - INTERVAL '10 days', NOW()),

-- Productos que serán críticos (stock bajo)
('Cable HDMI 2m', 85.00, 65.00, 3, 25, 'TU_EMPRESA_ID_AQUI', 1, NOW() - INTERVAL '5 days', NOW()),
('Memoria RAM 8GB DDR4', 320.00, 280.00, 1, 18, 'TU_EMPRESA_ID_AQUI', 1, NOW() - INTERVAL '3 days', NOW()),
('Webcam HD 1080p', 180.00, 140.00, 2, 8, 'TU_EMPRESA_ID_AQUI', 1, NOW() - INTERVAL '2 days', NOW()),
('Auriculares Bluetooth', 250.00, 200.00, 0, 12, 'TU_EMPRESA_ID_AQUI', 1, NOW() - INTERVAL '1 day', NOW()),
('Cargador Universal USB-C', 95.00, 75.00, 1, 20, 'TU_EMPRESA_ID_AQUI', 1, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- =====================================================
-- PASO 3: CONFIGURAR PRODUCTOS CRÍTICOS EN APROVISIONAMIENTO
-- =====================================================
-- Obtener los IDs de los productos recién creados
-- Reemplaza 'TU_EMPRESA_ID_AQUI' con el empresa_id real

WITH productos_empresa AS (
    SELECT producto_id, nombre_producto, stock
    FROM producto 
    WHERE empresa_id = 'TU_EMPRESA_ID_AQUI'
    AND nombre_producto IN (
        'Cable HDMI 2m',
        'Memoria RAM 8GB DDR4', 
        'Webcam HD 1080p',
        'Auriculares Bluetooth',
        'Cargador Universal USB-C',
        'Monitor Samsung 24"',
        'Laptop Dell Inspiron 15',
        'Mouse Logitech MX Master',
        'Teclado Mecánico RGB',
        'Disco SSD 500GB'
    )
)
INSERT INTO aprovisionamiento (
    producto_id,
    stock_minimo,
    stock_maximo,
    punto_reorden,
    empresa_id,
    fecha_creacion,
    fecha_modificacion
)
SELECT 
    p.producto_id,
    CASE 
        WHEN p.nombre_producto = 'Cable HDMI 2m' THEN 10
        WHEN p.nombre_producto = 'Memoria RAM 8GB DDR4' THEN 5
        WHEN p.nombre_producto = 'Webcam HD 1080p' THEN 8
        WHEN p.nombre_producto = 'Auriculares Bluetooth' THEN 5
        WHEN p.nombre_producto = 'Cargador Universal USB-C' THEN 15
        WHEN p.nombre_producto = 'Monitor Samsung 24"' THEN 20
        WHEN p.nombre_producto = 'Laptop Dell Inspiron 15' THEN 30
        WHEN p.nombre_producto = 'Mouse Logitech MX Master' THEN 25
        WHEN p.nombre_producto = 'Teclado Mecánico RGB' THEN 20
        WHEN p.nombre_producto = 'Disco SSD 500GB' THEN 30
    END as stock_minimo,
    CASE 
        WHEN p.nombre_producto = 'Cable HDMI 2m' THEN 50
        WHEN p.nombre_producto = 'Memoria RAM 8GB DDR4' THEN 30
        WHEN p.nombre_producto = 'Webcam HD 1080p' THEN 40
        WHEN p.nombre_producto = 'Auriculares Bluetooth' THEN 25
        WHEN p.nombre_producto = 'Cargador Universal USB-C' THEN 60
        WHEN p.nombre_producto = 'Monitor Samsung 24"' THEN 100
        WHEN p.nombre_producto = 'Laptop Dell Inspiron 15' THEN 150
        WHEN p.nombre_producto = 'Mouse Logitech MX Master' THEN 100
        WHEN p.nombre_producto = 'Teclado Mecánico RGB' THEN 80
        WHEN p.nombre_producto = 'Disco SSD 500GB' THEN 120
    END as stock_maximo,
    CASE 
        WHEN p.nombre_producto = 'Cable HDMI 2m' THEN 15
        WHEN p.nombre_producto = 'Memoria RAM 8GB DDR4' THEN 8
        WHEN p.nombre_producto = 'Webcam HD 1080p' THEN 12
        WHEN p.nombre_producto = 'Auriculares Bluetooth' THEN 8
        WHEN p.nombre_producto = 'Cargador Universal USB-C' THEN 20
        WHEN p.nombre_producto = 'Monitor Samsung 24"' THEN 30
        WHEN p.nombre_producto = 'Laptop Dell Inspiron 15' THEN 40
        WHEN p.nombre_producto = 'Mouse Logitech MX Master' THEN 35
        WHEN p.nombre_producto = 'Teclado Mecánico RGB' THEN 30
        WHEN p.nombre_producto = 'Disco SSD 500GB' THEN 40
    END as punto_reorden,
    'TU_EMPRESA_ID_AQUI',
    NOW(),
    NOW()
FROM productos_empresa p
ON CONFLICT (producto_id) DO UPDATE SET
    stock_minimo = EXCLUDED.stock_minimo,
    stock_maximo = EXCLUDED.stock_maximo,
    punto_reorden = EXCLUDED.punto_reorden,
    fecha_modificacion = NOW();

-- =====================================================
-- PASO 4: CREAR MOVIMIENTOS DE INVENTARIO RECIENTES
-- =====================================================
-- Simular movimientos de los últimos días

WITH productos_empresa AS (
    SELECT producto_id, nombre_producto
    FROM producto 
    WHERE empresa_id = 'TU_EMPRESA_ID_AQUI'
    LIMIT 10
)
INSERT INTO movimientos_inventario (
    producto_id,
    tipo_movimiento,
    cantidad,
    motivo,
    fecha_movimiento
)
SELECT 
    p.producto_id,
    CASE 
        WHEN random() > 0.6 THEN 'entrada'
        ELSE 'salida'
    END as tipo_movimiento,
    CASE 
        WHEN random() > 0.6 THEN floor(random() * 20 + 5)::int  -- Entradas: 5-25 unidades
        ELSE floor(random() * 10 + 1)::int                      -- Salidas: 1-10 unidades
    END as cantidad,
    CASE 
        WHEN random() > 0.6 THEN 'Reabastecimiento de stock'
        WHEN random() > 0.4 THEN 'Venta a cliente'
        WHEN random() > 0.2 THEN 'Ajuste de inventario'
        ELSE 'Transferencia interna'
    END as motivo,
    NOW() - (random() * INTERVAL '7 days') as fecha_movimiento
FROM productos_empresa p
CROSS JOIN generate_series(1, 3) -- 3 movimientos por producto
ORDER BY random();

-- =====================================================
-- PASO 5: AGREGAR MOVIMIENTOS DE HOY
-- =====================================================
-- Asegurar que haya movimientos del día actual

WITH productos_empresa AS (
    SELECT producto_id, nombre_producto
    FROM producto 
    WHERE empresa_id = 'TU_EMPRESA_ID_AQUI'
    ORDER BY random()
    LIMIT 5
)
INSERT INTO movimientos_inventario (
    producto_id,
    tipo_movimiento,
    cantidad,
    motivo,
    fecha_movimiento
)
SELECT 
    p.producto_id,
    CASE 
        WHEN random() > 0.5 THEN 'entrada'
        ELSE 'salida'
    END as tipo_movimiento,
    floor(random() * 15 + 1)::int as cantidad,
    CASE 
        WHEN random() > 0.5 THEN 'Venta matutina'
        ELSE 'Reposición de stock'
    END as motivo,
    CURRENT_DATE + (random() * INTERVAL '12 hours') as fecha_movimiento
FROM productos_empresa p;

-- =====================================================
-- VERIFICACIÓN: QUERIES PARA COMPROBAR LOS DATOS
-- =====================================================

-- Verificar productos críticos
SELECT 
    p.producto_id,
    p.nombre_producto,
    p.stock,
    a.stock_minimo,
    CASE 
        WHEN p.stock <= a.stock_minimo THEN 'CRÍTICO'
        WHEN p.stock <= (a.stock_minimo * 1.5) THEN 'BAJO'
        ELSE 'NORMAL'
    END as estado_stock
FROM producto p
INNER JOIN aprovisionamiento a ON p.producto_id = a.producto_id
WHERE p.empresa_id = 'TU_EMPRESA_ID_AQUI'
ORDER BY (p.stock::float / NULLIF(a.stock_minimo, 0)) ASC;

-- Verificar movimientos recientes
SELECT 
    mi.movimiento_id,
    p.nombre_producto,
    mi.tipo_movimiento,
    mi.cantidad,
    mi.motivo,
    mi.fecha_movimiento,
    AGE(NOW(), mi.fecha_movimiento) as tiempo_transcurrido
FROM movimientos_inventario mi
INNER JOIN producto p ON mi.producto_id = p.producto_id
WHERE p.empresa_id = 'TU_EMPRESA_ID_AQUI'
ORDER BY mi.fecha_movimiento DESC
LIMIT 20;

-- Verificar métricas del dashboard
SELECT 
    'Total Productos' as metrica,
    COUNT(*) as valor
FROM producto 
WHERE empresa_id = 'TU_EMPRESA_ID_AQUI' AND estado_id = 1

UNION ALL

SELECT 
    'Productos Críticos' as metrica,
    COUNT(DISTINCT p.producto_id) as valor
FROM producto p
INNER JOIN aprovisionamiento a ON p.producto_id = a.producto_id
WHERE p.empresa_id = 'TU_EMPRESA_ID_AQUI' 
    AND p.stock <= a.stock_minimo 
    AND p.estado_id = 1

UNION ALL

SELECT 
    'Movimientos Hoy' as metrica,
    COUNT(*) as valor
FROM movimientos_inventario mi
INNER JOIN producto p ON mi.producto_id = p.producto_id
WHERE p.empresa_id = 'TU_EMPRESA_ID_AQUI' 
    AND DATE(mi.fecha_movimiento) = CURRENT_DATE

UNION ALL

SELECT 
    'Valor Inventario (Bs)' as metrica,
    ROUND(SUM(p.precio_costo::numeric * p.stock)::numeric, 2) as valor
FROM producto p
WHERE p.empresa_id = 'TU_EMPRESA_ID_AQUI' AND p.estado_id = 1;