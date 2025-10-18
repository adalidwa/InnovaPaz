-- ==============================================
--     SCRIPT DE DATOS DE SIMULACIÓN PARA INVENTARIO
--     Proyecto INNOVAPAZ - Módulo de Inventarios
-- ==============================================

-- Nota: Ejecutar este script DESPUÉS de crear las tablas principales
-- Este script genera datos de prueba para las funcionalidades:
-- 1. Movimientos Recientes
-- 2. Productos Críticos
-- 3. Dashboard de Inventarios

-- ==============================================
--           DATOS BÁSICOS REQUERIDOS
-- ==============================================

-- 1. Tipos de empresa
INSERT INTO tipos_empresa (tipo_empresa) VALUES 
('Ferretería'),
('Construcción'),
('Automotriz'),
('Electrónica'),
('General');

-- 2. Planes
INSERT INTO planes (nombre_plan, precio_mensual, limites) VALUES 
('Plan Básico', 50000, '{"usuarios": 5, "productos": 1000, "almacenes": 2}'),
('Plan Profesional', 100000, '{"usuarios": 15, "productos": 5000, "almacenes": 5}'),
('Plan Empresarial', 200000, '{"usuarios": 50, "productos": 20000, "almacenes": 10}');

-- 3. Empresa de prueba
INSERT INTO empresas (empresa_id, nombre, tipo_empresa_id, plan_id, estado_suscripcion) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Ferretería El Progreso', 1, 1, 'activo');

-- 4. Estados de producto
INSERT INTO estado_producto (nombre, descripcion) VALUES 
('Nuevo', 'Producto en estado nuevo'),
('Usado', 'Producto en estado usado'),
('Refurbished', 'Producto reacondicionado'),
('Dañado', 'Producto con daños'),
('Descontinuado', 'Producto descontinuado');

-- 5. Marcas
INSERT INTO marca (nombre, descripcion) VALUES 
('Bosch', 'Herramientas profesionales alemanas'),
('Black & Decker', 'Herramientas eléctricas'),
('Stanley', 'Herramientas manuales'),
('Makita', 'Herramientas industriales'),
('DeWalt', 'Herramientas de construcción'),
('Sin Marca', 'Productos genéricos');

-- 6. Categorías
INSERT INTO categorias (nombre_categoria, categoria_padre_id, nivel, tipo_empresa_id) VALUES 
('Herramientas Eléctricas', NULL, 1, 1),
('Herramientas Manuales', NULL, 1, 1),
('Materiales de Construcción', NULL, 1, 1),
('Ferretería General', NULL, 1, 1),
-- Subcategorías
('Taladros', 1, 2, 1),
('Amoladoras', 1, 2, 1),
('Sierras', 1, 2, 1),
('Llaves', 2, 2, 1),
('Destornilladores', 2, 2, 1);

-- 7. Almacenes
INSERT INTO almacenes (empresa_id, nombre, direccion, activo) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Almacén Principal', 'Av. Principales #123', true),
('550e8400-e29b-41d4-a716-446655440000', 'Almacén Sucursal Norte', 'Zona Norte, Calle 45', true),
('550e8400-e29b-41d4-a716-446655440000', 'Almacén Temporal', 'Depósito temporal', true);

-- 8. Tipos de movimiento
INSERT INTO tipo_movimiento (nombre, tipo, descripcion) VALUES 
('Entrada por Compra', 'entrada', 'Ingreso de productos por compra a proveedor'),
('Salida por Venta', 'salida', 'Salida de productos por venta a cliente'),
('Entrada por Devolución', 'entrada', 'Ingreso por devolución de cliente'),
('Salida por Devolución', 'salida', 'Salida por devolución a proveedor'),
('Entrada por Ajuste', 'entrada', 'Ajuste positivo de inventario'),
('Salida por Ajuste', 'salida', 'Ajuste negativo de inventario'),
('Entrada por Transferencia', 'entrada', 'Entrada por transferencia entre almacenes'),
('Salida por Transferencia', 'salida', 'Salida por transferencia entre almacenes');

-- ==============================================
--               PRODUCTOS DE PRUEBA
-- ==============================================

-- Productos con diferentes niveles de stock para simular críticos y normales
INSERT INTO producto (
    codigo, nombre_producto, descripcion, precio_venta, precio_costo, 
    stock, cantidad_vendidos, categoria_id, empresa_id, marca_id, estado_id
) VALUES 
-- PRODUCTOS CRÍTICOS (stock bajo)
('TAL001', 'Taladro Percutor 13mm', 'Taladro percutor con cable, 750W', 250000.00, 180000.00, 15, 25, 5, '550e8400-e29b-41d4-a716-446655440000', 1, 1),
('AMO001', 'Amoladora Angular 4.5"', 'Amoladora angular 850W', 180000.00, 120000.00, 10, 18, 6, '550e8400-e29b-41d4-a716-446655440000', 1, 1),
('SIE001', 'Sierra Circular 7.25"', 'Sierra circular 1400W', 320000.00, 240000.00, 8, 12, 7, '550e8400-e29b-41d4-a716-446655440000', 2, 1),
('LLA001', 'Juego de Llaves 8-19mm', 'Juego de llaves combinadas', 45000.00, 30000.00, 5, 30, 8, '550e8400-e29b-41d4-a716-446655440000', 3, 1),

-- PRODUCTOS CON STOCK NORMAL
('TAL002', 'Taladro Inalámbrico 12V', 'Taladro a batería con 2 baterías', 450000.00, 320000.00, 45, 15, 5, '550e8400-e29b-41d4-a716-446655440000', 4, 1),
('AMO002', 'Amoladora Pequeña 4"', 'Amoladora compacta 650W', 150000.00, 100000.00, 35, 22, 6, '550e8400-e29b-41d4-a716-446655440000', 5, 1),
('DES001', 'Set Destornilladores', 'Set de 12 destornilladores variados', 35000.00, 22000.00, 60, 45, 9, '550e8400-e29b-41d4-a716-446655440000', 3, 1),
('TAL003', 'Taladro Industrial 16mm', 'Taladro para uso industrial pesado', 850000.00, 650000.00, 25, 8, 5, '550e8400-e29b-41d4-a716-446655440000', 4, 1),
('LLA002', 'Llave Inglesa 12"', 'Llave inglesa ajustable cromada', 25000.00, 15000.00, 40, 35, 8, '550e8400-e29b-41d4-a716-446655440000', 3, 1),
('SIE002', 'Sierra de Mesa', 'Sierra de mesa profesional 1800W', 1200000.00, 900000.00, 12, 5, 7, '550e8400-e29b-41d4-a716-446655440000', 5, 1);

-- ==============================================
--          CONFIGURACIÓN DE APROVISIONAMIENTO
-- ==============================================

-- Configurar stocks mínimos y máximos para identificar productos críticos
INSERT INTO aprovisionamiento (producto_id, stock_actual, stock_minimo, stock_maximo, estado) VALUES 
-- Productos CRÍTICOS (stock actual < stock mínimo)
(1, 15, 20, 50, 'critico'),     -- Taladro Percutor: stock 15 < mínimo 20
(2, 10, 15, 40, 'critico'),     -- Amoladora Angular: stock 10 < mínimo 15
(3, 8, 12, 30, 'critico'),      -- Sierra Circular: stock 8 < mínimo 12
(4, 5, 10, 25, 'critico'),      -- Juego de Llaves: stock 5 < mínimo 10

-- Productos con stock BAJO pero no crítico
(5, 45, 30, 80, 'bajo'),        -- Taladro Inalámbrico: stock 45 > mínimo 30 pero cerca
(6, 35, 25, 60, 'normal'),      -- Amoladora Pequeña: stock normal

-- Productos con stock NORMAL
(7, 60, 40, 100, 'normal'),     -- Set Destornilladores
(8, 25, 15, 50, 'normal'),      -- Taladro Industrial
(9, 40, 30, 80, 'normal'),      -- Llave Inglesa
(10, 12, 10, 25, 'normal');     -- Sierra de Mesa

-- ==============================================
--            INVENTARIO POR ALMACÉN
-- ==============================================

-- Distribuir el inventario entre almacenes
INSERT INTO inventario (producto_id, almacen_id, cantidad_actual) VALUES 
-- Almacén Principal (ID: 1)
(1, 1, 10),   -- Taladro Percutor
(2, 1, 7),    -- Amoladora Angular
(3, 1, 5),    -- Sierra Circular
(4, 1, 3),    -- Juego de Llaves
(5, 1, 30),   -- Taladro Inalámbrico
(6, 1, 25),   -- Amoladora Pequeña
(7, 1, 40),   -- Set Destornilladores
(8, 1, 15),   -- Taladro Industrial
(9, 1, 25),   -- Llave Inglesa
(10, 1, 8),   -- Sierra de Mesa

-- Almacén Sucursal Norte (ID: 2)
(1, 2, 5),    -- Taladro Percutor
(2, 2, 3),    -- Amoladora Angular
(3, 2, 3),    -- Sierra Circular
(4, 2, 2),    -- Juego de Llaves
(5, 2, 15),   -- Taladro Inalámbrico
(6, 2, 10),   -- Amoladora Pequeña
(7, 2, 20),   -- Set Destornilladores
(8, 2, 10),   -- Taladro Industrial
(9, 2, 15),   -- Llave Inglesa
(10, 2, 4);   -- Sierra de Mesa

-- ==============================================
--         MOVIMIENTOS RECIENTES (ÚLTIMOS 7 DÍAS)
-- ==============================================

-- Movimientos del día actual y días anteriores
-- Usar fechas dinámicas basadas en CURRENT_TIMESTAMP

-- Movimientos de HOY
INSERT INTO movimientos_inventario (
    producto_id, tipo_movimiento_id, cantidad, motivo, 
    fecha_movimiento, almacen_id, empresa_id, entidad_id, entidad_tipo
) VALUES 
-- Salida de Taladro (como en la imagen)
(1, 2, 5, 'Venta a cliente - Factura #001234', 
 CURRENT_TIMESTAMP - INTERVAL '1 hour', 1, '550e8400-e29b-41d4-a716-446655440000', 1, 'venta'),

-- Entrada de Taladro (como en la imagen) 
(1, 1, 30, 'Compra a proveedor - Orden #ORD-2024-001', 
 CURRENT_TIMESTAMP - INTERVAL '2 hours', 1, '550e8400-e29b-41d4-a716-446655440000', 1, 'compra');

-- Movimientos de AYER
INSERT INTO movimientos_inventario (
    producto_id, tipo_movimiento_id, cantidad, motivo, 
    fecha_movimiento, almacen_id, empresa_id, entidad_id, entidad_tipo
) VALUES 
-- Salida de Taladro 
(1, 2, 8, 'Venta mayorista - Cliente VIP', 
 CURRENT_TIMESTAMP - INTERVAL '1 day 5 hours', 1, '550e8400-e29b-41d4-a716-446655440000', 2, 'venta'),

-- Entrada de Taladro
(1, 1, 25, 'Reposición de stock semanal', 
 CURRENT_TIMESTAMP - INTERVAL '1 day 8 hours', 1, '550e8400-e29b-41d4-a716-446655440000', 2, 'compra');

-- Movimientos de hace 2 días
INSERT INTO movimientos_inventario (
    producto_id, tipo_movimiento_id, cantidad, motivo, 
    fecha_movimiento, almacen_id, empresa_id, entidad_id, entidad_tipo
) VALUES 
-- Salida de Taladro
(1, 2, 3, 'Venta sucursal norte', 
 CURRENT_TIMESTAMP - INTERVAL '2 days 3 hours', 2, '550e8400-e29b-41d4-a716-446655440000', 3, 'venta'),

-- Salida de Taladro
(1, 2, 2, 'Venta a contratista', 
 CURRENT_TIMESTAMP - INTERVAL '2 days 7 hours', 1, '550e8400-e29b-41d4-a716-446655440000', 4, 'venta'),

-- Salida de Taladro
(1, 2, 1, 'Venta individual', 
 CURRENT_TIMESTAMP - INTERVAL '2 days 10 hours', 1, '550e8400-e29b-41d4-a716-446655440000', 5, 'venta');

-- Movimientos de otros productos (últimos días)
INSERT INTO movimientos_inventario (
    producto_id, tipo_movimiento_id, cantidad, motivo, 
    fecha_movimiento, almacen_id, empresa_id, entidad_id, entidad_tipo
) VALUES 
-- Amoladora Angular
(2, 2, 4, 'Venta combo herramientas', 
 CURRENT_TIMESTAMP - INTERVAL '1 day 2 hours', 1, '550e8400-e29b-41d4-a716-446655440000', 6, 'venta'),
(2, 1, 15, 'Entrada por compra mensual', 
 CURRENT_TIMESTAMP - INTERVAL '3 days', 1, '550e8400-e29b-41d4-a716-446655440000', 3, 'compra'),

-- Sierra Circular
(3, 2, 2, 'Venta a empresa constructora', 
 CURRENT_TIMESTAMP - INTERVAL '2 days', 1, '550e8400-e29b-41d4-a716-446655440000', 7, 'venta'),
(3, 1, 10, 'Reposición trimestral', 
 CURRENT_TIMESTAMP - INTERVAL '4 days', 1, '550e8400-e29b-41d4-a716-446655440000', 4, 'compra'),

-- Llaves
(4, 2, 3, 'Venta kit básico mecánico', 
 CURRENT_TIMESTAMP - INTERVAL '1 day 6 hours', 1, '550e8400-e29b-41d4-a716-446655440000', 8, 'venta'),
(4, 1, 8, 'Entrada por compra directa', 
 CURRENT_TIMESTAMP - INTERVAL '5 days', 1, '550e8400-e29b-41d4-a716-446655440000', 5, 'compra'),

-- Destornilladores
(7, 2, 5, 'Venta kit hogar', 
 CURRENT_TIMESTAMP - INTERVAL '3 hours', 1, '550e8400-e29b-41d4-a716-446655440000', 9, 'venta'),
(7, 1, 20, 'Compra mayorista', 
 CURRENT_TIMESTAMP - INTERVAL '6 days', 1, '550e8400-e29b-41d4-a716-446655440000', 6, 'compra');

-- ==============================================
--                   LOTES
-- ==============================================

-- Crear algunos lotes para productos (para trazabilidad)
INSERT INTO lotes (
    producto_id, almacen_id, codigo_lote, fecha_ingreso, 
    fecha_vencimiento, cantidad, precio_unitario, activo
) VALUES 
(1, 1, 'TAL001-L001-2024', CURRENT_DATE - INTERVAL '30 days', NULL, 20, 180000.00, true),
(1, 1, 'TAL001-L002-2024', CURRENT_DATE - INTERVAL '15 days', NULL, 15, 185000.00, true),
(2, 1, 'AMO001-L001-2024', CURRENT_DATE - INTERVAL '45 days', NULL, 15, 120000.00, true),
(3, 1, 'SIE001-L001-2024', CURRENT_DATE - INTERVAL '60 days', NULL, 12, 240000.00, true),
(4, 1, 'LLA001-L001-2024', CURRENT_DATE - INTERVAL '20 days', NULL, 10, 30000.00, true);

-- ==============================================
--                   NOTAS
-- ==============================================

/*
RESUMEN DE DATOS CREADOS:

PRODUCTOS CRÍTICOS (para la sección "Productos Críticos"):
- Taladro Percutor: Stock 15, Mínimo 20 → CRÍTICO
- Amoladora Angular: Stock 10, Mínimo 15 → CRÍTICO  
- Sierra Circular: Stock 8, Mínimo 12 → CRÍTICO
- Juego de Llaves: Stock 5, Mínimo 10 → CRÍTICO

MOVIMIENTOS RECIENTES (para la sección "Movimientos Recientes"):
- 7 entradas de diferentes productos en los últimos días
- 8 salidas de diferentes productos en los últimos días
- Movimientos distribuidos en las últimas 6 días
- Incluye los movimientos de "Taladro" que aparecen en tu imagen

PARA USAR ESTOS DATOS:
1. Ejecuta este script en tu base de datos después de crear las tablas
2. Cambia el UUID de empresa si necesitas uno específico
3. Los queries para obtener estos datos están listos para tu backend
4. Puedes agregar más movimientos copiando el patrón de INSERT

QUERIES ÚTILES PARA TU BACKEND:

-- Obtener productos críticos:
SELECT p.nombre_producto, p.stock, a.stock_minimo, a.estado 
FROM producto p 
JOIN aprovisionamiento a ON p.producto_id = a.producto_id 
WHERE a.estado = 'critico' AND p.empresa_id = '550e8400-e29b-41d4-a716-446655440000';

-- Obtener movimientos recientes:
SELECT p.nombre_producto, tm.nombre as tipo_movimiento, mi.cantidad, 
       mi.motivo, mi.fecha_movimiento
FROM movimientos_inventario mi
JOIN producto p ON mi.producto_id = p.producto_id
JOIN tipo_movimiento tm ON mi.tipo_movimiento_id = tm.tipo_movimiento_id
WHERE mi.empresa_id = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY mi.fecha_movimiento DESC
LIMIT 10;
*/