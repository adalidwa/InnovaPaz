-- =====================================================
-- SIMULACIÓN PARA ANDERSON CHECA TITO - DATOS REALES
-- Usuario: ande@gmail.com
-- Empresa ID: d03e9c21-1d2c-459f-ab01-4dc44b43bc47
-- =====================================================

-- PASO 0: VERIFICAR TIPOS DE MOVIMIENTO DISPONIBLES
-- Ejecuta este query primero para ver qué IDs usar:
SELECT * FROM tipo_movimiento ORDER BY tipo_movimiento_id;

-- NOTA: Ajusta los números en tipo_movimiento_id según los resultados:
-- Busca algo como:
-- 1 = 'Entrada' o 'Ingreso' 
-- 2 = 'Salida' o 'Egreso'
-- Y reemplaza en el script si es necesario

-- PASO 1: CONFIGURAR PRODUCTOS CRÍTICOS EN APROVISIONAMIENTO
-- Usar los productos existentes de Anderson con la estructura real

-- Primero eliminar registros existentes para estos productos (si existen)
DELETE FROM aprovisionamiento WHERE producto_id IN (1, 2, 3, 4);

-- Insertar configuraciones de aprovisionamiento
INSERT INTO aprovisionamiento (
    producto_id, 
    stock_actual,
    stock_minimo, 
    stock_maximo, 
    estado,
    fecha_actualizacion
) VALUES 
-- Taladro: Stock actual 15, ponemos mínimo 20 = CRÍTICO
(1, 15, 20, 100, 'critico', NOW()),

-- Martillo: Stock actual 18, ponemos mínimo 25 = CRÍTICO  
(2, 18, 25, 80, 'critico', NOW()),

-- Alicate: Stock actual 20, ponemos mínimo 15 = NORMAL
(3, 20, 15, 60, 'normal', NOW()),

-- Amoladora: Stock actual 10, ponemos mínimo 12 = CRÍTICO
(4, 10, 12, 50, 'critico', NOW());

-- =====================================================
-- PASO 2: CREAR MOVIMIENTOS RECIENTES
-- =====================================================

-- Primero necesitamos saber qué IDs usar para tipo_movimiento_id
-- Consulta para ver los tipos de movimiento disponibles
-- SELECT * FROM tipo_movimiento; -- Descomentar para ver opciones

INSERT INTO movimientos_inventario (
    producto_id,
    tipo_movimiento_id,
    cantidad,
    motivo,
    entidad_tipo,
    fecha_movimiento,
    empresa_id
) VALUES 
-- Movimientos de HOY (asumiendo: 1=entrada, 2=salida - ajustar según tu tabla tipo_movimiento)
(1, 2, 3, 'Venta a cliente - Proyecto construcción', 'cliente', NOW() - INTERVAL '2 hours', 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'),
(2, 1, 5, 'Compra a proveedor Ferromax', 'proveedor', NOW() - INTERVAL '4 hours', 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'),
(4, 2, 2, 'Venta - Taller mecánico local', 'cliente', NOW() - INTERVAL '1 hour', 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'),
(3, 1, 8, 'Reposición de stock semanal', 'proveedor', NOW() - INTERVAL '6 hours', 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'),

-- Movimientos de AYER
(1, 1, 10, 'Compra mayorista - Descuento 15%', 'proveedor', NOW() - INTERVAL '1 day 3 hours', 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'),
(2, 2, 4, 'Venta - Carpintería San José', 'cliente', NOW() - INTERVAL '1 day 5 hours', 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'),
(4, 1, 3, 'Devolución por garantía', 'cliente', NOW() - INTERVAL '1 day 7 hours', 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'),

-- Movimientos de ANTEAYER  
(3, 2, 6, 'Venta mayorista - Ferretería rival', 'cliente', NOW() - INTERVAL '2 days 2 hours', 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'),
(1, 2, 2, 'Préstamo a sucursal hermana', 'interno', NOW() - INTERVAL '2 days 4 hours', 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'),
(2, 1, 12, 'Compra especial por temporada', 'proveedor', NOW() - INTERVAL '2 days 8 hours', 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'),

-- Movimientos hace 3 DÍAS
(4, 2, 1, 'Muestra para cliente potencial', 'cliente', NOW() - INTERVAL '3 days 1 hour', 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'),
(3, 1, 15, 'Llegada de contenedor importado', 'proveedor', NOW() - INTERVAL '3 days 6 hours', 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'),

-- Movimientos hace 4 DÍAS
(1, 1, 8, 'Reposición urgente - Stock agotado', 'proveedor', NOW() - INTERVAL '4 days 3 hours', 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'),
(2, 2, 7, 'Venta corporativa - Empresa constructora', 'cliente', NOW() - INTERVAL '4 days 5 hours', 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'),

-- Movimientos hace 5 DÍAS
(4, 1, 6, 'Compra con descuento promocional', 'proveedor', NOW() - INTERVAL '5 days 2 hours', 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47');

-- =====================================================
-- PASO 3: AGREGAR MÁS PRODUCTOS PARA ENRIQUECER EL DASHBOARD
-- =====================================================

INSERT INTO producto (
    codigo,
    nombre_producto, 
    descripcion,
    imagen,
    precio_venta, 
    precio_costo, 
    stock, 
    cantidad_vendidos,
    categoria_id,
    empresa_id, 
    marca_id,
    estado_id, 
    fecha_creacion, 
    fecha_modificacion
) VALUES 
('T001', 'Tornillos autorroscantes 6x1"', 'Caja x100 unidades, cabeza Phillips', 
 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8yNvO_Ht7GQo_8tR7Jc1eGLVgJjHs5E_Rkg&s',
 15.00, 8.50, 5, 45, 33, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47', 25, 1, NOW(), NOW()),

('P001', 'Pintura látex blanco 4L', 'Pintura lavable, alto rendimiento', 
 'https://www.ansilta.com/uploads/productos/imagenes/0_ansilta-latex-interior-blanco-4-litros-1.jpg',
 95.00, 68.00, 2, 28, 34, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47', 26, 1, NOW(), NOW()),

('C001', 'Cable eléctrico 2.5mm x metro', 'Cable THW-LS/THHW-LS 90°C', 
 'https://cdn.leroymerlin.com.pe/productos/20002554_01_XL.jpg',
 8.50, 5.20, 0, 15, 33, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47', 29, 1, NOW(), NOW())

ON CONFLICT DO NOTHING;

-- =====================================================
-- PASO 4: CONFIGURAR ESTOS NUEVOS PRODUCTOS COMO CRÍTICOS
-- =====================================================

-- Configurar aprovisionamiento para los nuevos productos
INSERT INTO aprovisionamiento (
    producto_id, 
    stock_actual,
    stock_minimo, 
    stock_maximo, 
    estado,
    fecha_actualizacion
)
SELECT 
    p.producto_id,
    p.stock as stock_actual,  -- Usar el stock actual del producto
    CASE 
        WHEN p.codigo = 'T001' THEN 10  -- Stock: 5, Mínimo: 10 = CRÍTICO
        WHEN p.codigo = 'P001' THEN 8   -- Stock: 2, Mínimo: 8 = CRÍTICO  
        WHEN p.codigo = 'C001' THEN 5   -- Stock: 0, Mínimo: 5 = CRÍTICO
    END as stock_minimo,
    CASE 
        WHEN p.codigo = 'T001' THEN 50
        WHEN p.codigo = 'P001' THEN 30
        WHEN p.codigo = 'C001' THEN 100
    END as stock_maximo,
    CASE 
        WHEN p.codigo = 'T001' THEN 'critico'  -- Stock: 5 < 10
        WHEN p.codigo = 'P001' THEN 'critico'  -- Stock: 2 < 8
        WHEN p.codigo = 'C001' THEN 'agotado'  -- Stock: 0 < 5
    END as estado,
    NOW()
FROM producto p
WHERE p.empresa_id = 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'
    AND p.codigo IN ('T001', 'P001', 'C001')
    AND NOT EXISTS (
        SELECT 1 FROM aprovisionamiento a WHERE a.producto_id = p.producto_id
    );

-- =====================================================
-- PASO 5: AGREGAR MOVIMIENTOS PARA LOS NUEVOS PRODUCTOS
-- =====================================================

INSERT INTO movimientos_inventario (
    producto_id,
    tipo_movimiento_id,
    cantidad,
    motivo,
    entidad_tipo,
    fecha_movimiento,
    empresa_id
)
SELECT 
    p.producto_id,
    2 as tipo_movimiento_id,  -- Asumiendo que 2 = salida
    CASE 
        WHEN p.codigo = 'T001' THEN 8   -- Salida que dejó stock bajo
        WHEN p.codigo = 'P001' THEN 5   -- Salida que dejó stock crítico
        WHEN p.codigo = 'C001' THEN 12  -- Salida que agotó stock
    END as cantidad,
    'Venta que generó stock crítico' as motivo,
    'cliente' as entidad_tipo,
    NOW() - INTERVAL '8 hours' as fecha_movimiento,
    'd03e9c21-1d2c-459f-ab01-4dc44b43bc47' as empresa_id
FROM producto p
WHERE p.empresa_id = 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'
    AND p.codigo IN ('T001', 'P001', 'C001');

-- =====================================================
-- VERIFICACIÓN: VER QUE TODO ESTÉ FUNCIONANDO
-- =====================================================

-- 1. Ver productos críticos (deberían ser 6 productos)
SELECT 
    p.producto_id,
    p.codigo,
    p.nombre_producto,
    p.stock,
    a.stock_minimo,
    CASE 
        WHEN p.stock = 0 THEN '🔴 AGOTADO'
        WHEN p.stock <= a.stock_minimo THEN '🟡 CRÍTICO'
        ELSE '🟢 NORMAL'
    END as estado_stock
FROM producto p
INNER JOIN aprovisionamiento a ON p.producto_id = a.producto_id
WHERE p.empresa_id = 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'
ORDER BY (p.stock::float / NULLIF(a.stock_minimo, 0)) ASC;

-- 2. Ver movimientos recientes (últimos 15)
SELECT 
    p.codigo,
    p.nombre_producto,
    mi.tipo_movimiento,
    mi.cantidad,
    mi.motivo,
    mi.fecha_movimiento,
    CASE 
        WHEN mi.fecha_movimiento::date = CURRENT_DATE THEN '📅 HOY'
        WHEN mi.fecha_movimiento::date = CURRENT_DATE - 1 THEN '📅 AYER'
        ELSE '📅 ' || to_char(mi.fecha_movimiento, 'DD/MM')
    END as cuando
FROM movimientos_inventario mi
INNER JOIN producto p ON mi.producto_id = p.producto_id
WHERE p.empresa_id = 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'
ORDER BY mi.fecha_movimiento DESC
LIMIT 15;

-- 3. Ver métricas del dashboard
SELECT 
    (SELECT COUNT(*) FROM producto WHERE empresa_id = 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47' AND estado_id = 1) as total_productos,
    
    (SELECT COUNT(DISTINCT p.producto_id) 
     FROM producto p INNER JOIN aprovisionamiento a ON p.producto_id = a.producto_id 
     WHERE p.empresa_id = 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47' AND p.stock <= a.stock_minimo) as productos_criticos,
    
    (SELECT COUNT(*) 
     FROM movimientos_inventario mi INNER JOIN producto p ON mi.producto_id = p.producto_id 
     WHERE p.empresa_id = 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47' AND DATE(mi.fecha_movimiento) = CURRENT_DATE) as movimientos_hoy,
    
    (SELECT ROUND(SUM(p.precio_costo * p.stock), 2) 
     FROM producto p 
     WHERE p.empresa_id = 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47' AND p.estado_id = 1) as valor_inventario_bs;