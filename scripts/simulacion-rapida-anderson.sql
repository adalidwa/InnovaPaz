-- =====================================================
-- PASO A PASO: SIMULACIÓN RÁPIDA PARA ANDERSON CHECA
-- =====================================================

-- PASO 1: Primero ejecuta este query para obtener tu empresa_id
SELECT u.usuario_id, u.nombre, u.email, u.empresa_id, e.nombre_empresa
FROM usuarios u
INNER JOIN empresas e ON u.empresa_id = e.empresa_id
WHERE u.email = 'ande@gmail.com';

-- ✅ COPIA EL EMPRESA_ID QUE TE APAREZCA Y REEMPLÁZALO EN LOS SIGUIENTES QUERIES

-- =====================================================
-- PASO 2: CREAR PRODUCTOS RÁPIDOS (REEMPLAZA EL EMPRESA_ID)
-- =====================================================

-- Ejemplo: Si tu empresa_id es algo como 'b123e4f5-678a-90bc-def1-234567890abc'
-- Reemplaza 'EMPRESA_ID_ANDERSON' con tu empresa_id real

INSERT INTO producto (
    nombre_producto, precio_venta, precio_costo, stock, empresa_id, estado_id, fecha_creacion, fecha_modificacion
) VALUES 
('Laptop HP', 7500.00, 6200.00, 2, 'EMPRESA_ID_ANDERSON', 1, NOW(), NOW()),
('Mouse Gamer', 180.00, 140.00, 1, 'EMPRESA_ID_ANDERSON', 1, NOW(), NOW()),
('Teclado RGB', 320.00, 250.00, 0, 'EMPRESA_ID_ANDERSON', 1, NOW(), NOW()),
('Monitor 21"', 850.00, 680.00, 8, 'EMPRESA_ID_ANDERSON', 1, NOW(), NOW()),
('Webcam HD', 200.00, 160.00, 15, 'EMPRESA_ID_ANDERSON', 1, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- =====================================================
-- PASO 3: HACER PRODUCTOS CRÍTICOS (REEMPLAZA EL EMPRESA_ID)
-- =====================================================

INSERT INTO aprovisionamiento (producto_id, stock_minimo, stock_maximo, empresa_id, fecha_creacion, fecha_modificacion)
SELECT 
    p.producto_id,
    CASE 
        WHEN p.nombre_producto = 'Laptop HP' THEN 5        -- Stock: 2, Mínimo: 5 = CRÍTICO
        WHEN p.nombre_producto = 'Mouse Gamer' THEN 3      -- Stock: 1, Mínimo: 3 = CRÍTICO  
        WHEN p.nombre_producto = 'Teclado RGB' THEN 2      -- Stock: 0, Mínimo: 2 = CRÍTICO
        WHEN p.nombre_producto = 'Monitor 21"' THEN 10     -- Stock: 8, Mínimo: 10 = CRÍTICO
        WHEN p.nombre_producto = 'Webcam HD' THEN 10       -- Stock: 15, Mínimo: 10 = NORMAL
    END as stock_minimo,
    50 as stock_maximo,
    'EMPRESA_ID_ANDERSON',
    NOW(),
    NOW()
FROM producto p
WHERE p.empresa_id = 'EMPRESA_ID_ANDERSON'
ON CONFLICT (producto_id) DO UPDATE SET
    stock_minimo = EXCLUDED.stock_minimo,
    fecha_modificacion = NOW();

-- =====================================================
-- PASO 4: CREAR MOVIMIENTOS RECIENTES (REEMPLAZA EL EMPRESA_ID)  
-- =====================================================

INSERT INTO movimientos_inventario (producto_id, tipo_movimiento, cantidad, motivo, fecha_movimiento)
SELECT 
    p.producto_id,
    'entrada' as tipo_movimiento,
    5 as cantidad,
    'Compra a proveedor' as motivo,
    NOW() - INTERVAL '2 hours' as fecha_movimiento
FROM producto p 
WHERE p.empresa_id = 'EMPRESA_ID_ANDERSON' AND p.nombre_producto = 'Laptop HP'

UNION ALL

SELECT 
    p.producto_id,
    'salida' as tipo_movimiento,
    3 as cantidad,
    'Venta a cliente' as motivo,
    NOW() - INTERVAL '4 hours' as fecha_movimiento
FROM producto p 
WHERE p.empresa_id = 'EMPRESA_ID_ANDERSON' AND p.nombre_producto = 'Mouse Gamer'

UNION ALL

SELECT 
    p.producto_id,
    'entrada' as tipo_movimiento,
    10 as cantidad,
    'Reposición de stock' as motivo,
    NOW() - INTERVAL '1 day' as fecha_movimiento
FROM producto p 
WHERE p.empresa_id = 'EMPRESA_ID_ANDERSON' AND p.nombre_producto = 'Monitor 21"'

UNION ALL

SELECT 
    p.producto_id,
    'salida' as tipo_movimiento,
    2 as cantidad,
    'Venta online' as motivo,
    NOW() - INTERVAL '3 hours' as fecha_movimiento
FROM producto p 
WHERE p.empresa_id = 'EMPRESA_ID_ANDERSON' AND p.nombre_producto = 'Webcam HD'

UNION ALL

SELECT 
    p.producto_id,
    'entrada' as tipo_movimiento,
    1 as cantidad,
    'Ajuste de inventario' as motivo,
    NOW() - INTERVAL '30 minutes' as fecha_movimiento
FROM producto p 
WHERE p.empresa_id = 'EMPRESA_ID_ANDERSON' AND p.nombre_producto = 'Teclado RGB';

-- =====================================================
-- PASO 5: VERIFICAR QUE TODO ESTÉ BIEN
-- =====================================================

-- Ver productos críticos (deberían aparecer 4)
SELECT 
    p.nombre_producto,
    p.stock,
    a.stock_minimo,
    'CRÍTICO' as estado
FROM producto p
INNER JOIN aprovisionamiento a ON p.producto_id = a.producto_id
WHERE p.empresa_id = 'EMPRESA_ID_ANDERSON'
    AND p.stock <= a.stock_minimo
ORDER BY p.stock ASC;

-- Ver movimientos recientes (deberían aparecer 5)
SELECT 
    p.nombre_producto,
    mi.tipo_movimiento,
    mi.cantidad,
    mi.motivo,
    mi.fecha_movimiento
FROM movimientos_inventario mi
INNER JOIN producto p ON mi.producto_id = p.producto_id
WHERE p.empresa_id = 'EMPRESA_ID_ANDERSON'
ORDER BY mi.fecha_movimiento DESC
LIMIT 10;