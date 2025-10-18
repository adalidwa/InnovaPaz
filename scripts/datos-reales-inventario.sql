-- ==============================================
--     DATOS REALES PARA INVENTARIOS
--     Basado en las empresas existentes en tu BD
-- ==============================================

-- EMPRESAS EXISTENTES QUE USAREMOS:
-- d03e9c21-1d2c-459f-ab01-4dc44b43bc47 (Marco - Ferretería)
-- ebc8d621-58ad-4951-a770-160010b8f7d0 (Melones - Minimarket)
-- 5dc644b0-3ce9-4c41-a83d-c7da2962214d (hola - Licorería)

-- ==============================================
--           1. TIPOS DE MOVIMIENTO
-- ==============================================

INSERT INTO tipo_movimiento (nombre, tipo, descripcion) VALUES 
('Entrada por Compra', 'entrada', 'Ingreso de productos por compra a proveedor'),
('Salida por Venta', 'salida', 'Salida de productos por venta a cliente'),
('Entrada por Ajuste', 'entrada', 'Ajuste positivo de inventario'),
('Salida por Ajuste', 'salida', 'Ajuste negativo de inventario'),
('Entrada por Devolución', 'entrada', 'Ingreso por devolución de cliente'),
('Salida por Devolución', 'salida', 'Salida por devolución a proveedor');

-- ==============================================
--           2. PRODUCTOS POR EMPRESA
-- ==============================================

-- ============= EMPRESA MARCO (Ferretería) =============
INSERT INTO producto (
    codigo, nombre_producto, descripcion, precio_venta, precio_costo, 
    stock, cantidad_vendidos, categoria_id, empresa_id, marca_id, estado_id
) VALUES 
-- Herramientas (usando las marcas y categorías existentes)
('TAL001', 'Taladro Percutor Bosch 13mm', 'Taladro percutor profesional 750W', 280000.00, 200000.00, 12, 8, 34, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47', 15, 1),
('AMO001', 'Amoladora Stanley 4.5"', 'Amoladora angular 850W', 180000.00, 120000.00, 8, 15, 34, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47', 14, 1),
('LLA001', 'Juego Llaves Truper', 'Set completo de llaves 8-19mm', 45000.00, 30000.00, 15, 22, 33, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47', 13, 1),
('DES001', 'Destornilladores Stanley', 'Set de 12 destornilladores', 35000.00, 25000.00, 25, 18, 33, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47', 14, 1),
('SEL001', 'Sellador Sika', 'Sellador multiuso transparente', 25000.00, 18000.00, 5, 12, 37, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47', 18, 1);

-- ============= EMPRESA MELONES (Minimarket) =============
INSERT INTO producto (
    codigo, nombre_producto, descripcion, precio_venta, precio_costo, 
    stock, cantidad_vendidos, categoria_id, empresa_id, marca_id, estado_id
) VALUES 
-- Alimentos y bebidas (usando categorías existentes)
('COC001', 'Coca Cola 500ml', 'Gaseosa Coca Cola 500ml', 8.00, 5.50, 48, 120, 6, 'ebc8d621-58ad-4951-a770-160010b8f7d0', 3, 1),
('LEC001', 'Leche Pil 1L', 'Leche entera Pil 1 litro', 12.00, 9.00, 24, 80, 17, 'ebc8d621-58ad-4951-a770-160010b8f7d0', 8, 1),
('PAN001', 'Pan Sobao', 'Pan fresco del día', 2.50, 1.80, 10, 200, 14, 'ebc8d621-58ad-4951-a770-160010b8f7d0', 11, 1),
('ACE001', 'Aceite Fino 1L', 'Aceite vegetal Fino 1 litro', 18.00, 14.00, 15, 45, 12, 'ebc8d621-58ad-4951-a770-160010b8f7d0', 9, 1),
('DET001', 'Detergente La Suprema', 'Detergente en polvo 1kg', 15.00, 11.00, 8, 30, 25, 'ebc8d621-58ad-4951-a770-160010b8f7d0', 12, 1);

-- ============= EMPRESA HOLA (Licorería) =============
INSERT INTO producto (
    codigo, nombre_producto, descripcion, precio_venta, precio_costo, 
    stock, cantidad_vendidos, categoria_id, empresa_id, marca_id, estado_id
) VALUES 
-- Bebidas alcohólicas (usando categorías existentes)
('WHI001', 'Johnnie Walker Red', 'Whisky escocés 750ml', 180000.00, 140000.00, 6, 25, 3, '5dc644b0-3ce9-4c41-a83d-c7da2962214d', 1, 1),
('RON001', 'Casa Real Añejo', 'Ron premium 750ml', 85000.00, 65000.00, 12, 18, 3, '5dc644b0-3ce9-4c41-a83d-c7da2962214d', 2, 1),
('RON002', 'Cañerito Tradicional', 'Ron artesanal 750ml', 45000.00, 32000.00, 8, 30, 3, '5dc644b0-3ce9-4c41-a83d-c7da2962214d', 4, 1),
('COC002', 'Coca Cola 2L', 'Gaseosa familiar 2 litros', 15.00, 11.00, 20, 85, 6, '5dc644b0-3ce9-4c41-a83d-c7da2962214d', 3, 1),
('PEP001', 'Pepsi 500ml', 'Gaseosa Pepsi 500ml', 7.50, 5.50, 32, 95, 7, '5dc644b0-3ce9-4c41-a83d-c7da2962214d', 6, 1);

-- ==============================================
--         3. APROVISIONAMIENTO (PRODUCTOS CRÍTICOS)
-- ==============================================

-- Actualizar el existente y agregar más
UPDATE aprovisionamiento SET 
    stock_actual = 12, 
    stock_minimo = 15, 
    stock_maximo = 50,
    estado = 'critico'
WHERE aprovisionamiento_id = 1;

-- Agregar más productos críticos
INSERT INTO aprovisionamiento (producto_id, stock_actual, stock_minimo, stock_maximo, estado) VALUES 
-- Ferretería Marco - Productos críticos
(2, 8, 12, 30, 'critico'),    -- Amoladora: stock 8 < mínimo 12
(5, 5, 10, 25, 'critico'),    -- Sellador: stock 5 < mínimo 10

-- Minimarket Melones - Productos críticos  
(8, 10, 15, 50, 'critico'),   -- Pan: stock 10 < mínimo 15
(10, 8, 12, 30, 'critico'),   -- Detergente: stock 8 < mínimo 12

-- Licorería Hola - Productos críticos
(11, 6, 10, 25, 'critico'),   -- Johnnie Walker: stock 6 < mínimo 10
(13, 8, 12, 30, 'critico'),   -- Cañerito: stock 8 < mínimo 12

-- Productos con stock normal
(3, 15, 10, 40, 'normal'),    -- Llaves: stock normal
(4, 25, 20, 60, 'normal'),    -- Destornilladores: stock normal
(6, 48, 30, 80, 'normal'),    -- Coca Cola: stock normal
(7, 24, 20, 60, 'normal'),    -- Leche: stock normal
(9, 15, 12, 40, 'normal'),    -- Aceite: stock normal
(12, 12, 8, 25, 'normal'),    -- Casa Real: stock normal
(14, 20, 15, 50, 'normal'),   -- Coca Cola 2L: stock normal
(15, 32, 25, 70, 'normal');   -- Pepsi: stock normal

-- ==============================================
--         4. ALMACENES ADICIONALES
-- ==============================================

-- Agregar almacenes para las otras empresas
INSERT INTO almacenes (empresa_id, nombre, direccion, activo) VALUES 
('ebc8d621-58ad-4951-a770-160010b8f7d0', 'Almacén Principal Melones', 'Local principal Melones', true),
('5dc644b0-3ce9-4c41-a83d-c7da2962214d', 'Almacén Principal Hola', 'Depósito principal licorería', true);

-- ==============================================
--         5. INVENTARIO POR ALMACÉN
-- ==============================================

INSERT INTO inventario (producto_id, almacen_id, cantidad_actual) VALUES 
-- Almacén Marco (almacen_id = 1)
(1, 1, 12),   -- Taladro
(2, 1, 8),    -- Amoladora
(3, 1, 15),   -- Llaves
(4, 1, 25),   -- Destornilladores
(5, 1, 5),    -- Sellador

-- Almacén Melones (almacen_id = 2)
-- Nota: Usar el ID que se genere automáticamente, probablemente 2
(6, 2, 48),   -- Coca Cola 500ml
(7, 2, 24),   -- Leche
(8, 2, 10),   -- Pan
(9, 2, 15),   -- Aceite
(10, 2, 8),   -- Detergente

-- Almacén Hola (almacen_id = 3)
-- Nota: Usar el ID que se genere automáticamente, probablemente 3
(11, 3, 6),   -- Johnnie Walker
(12, 3, 12),  -- Casa Real
(13, 3, 8),   -- Cañerito
(14, 3, 20),  -- Coca Cola 2L
(15, 3, 32);  -- Pepsi

-- ==============================================
--         6. MOVIMIENTOS RECIENTES
-- ==============================================

-- Movimientos de HOY para todas las empresas
INSERT INTO movimientos_inventario (
    producto_id, tipo_movimiento_id, cantidad, motivo, 
    fecha_movimiento, almacen_id, empresa_id, entidad_id, entidad_tipo
) VALUES 
-- FERRETERÍA MARCO - Movimientos de hoy
(1, 2, 3, 'Venta a contratista', 
 CURRENT_TIMESTAMP - INTERVAL '2 hours', 1, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47', 1, 'venta'),
(2, 1, 15, 'Compra semanal herramientas', 
 CURRENT_TIMESTAMP - INTERVAL '4 hours', 1, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47', 1, 'compra'),

-- MINIMARKET MELONES - Movimientos de hoy  
(6, 2, 24, 'Venta del día', 
 CURRENT_TIMESTAMP - INTERVAL '1 hour', 2, 'ebc8d621-58ad-4951-a770-160010b8f7d0', 9, 'venta'),
(7, 1, 12, 'Reposición lácteos', 
 CURRENT_TIMESTAMP - INTERVAL '3 hours', 2, 'ebc8d621-58ad-4951-a770-160010b8f7d0', 2, 'compra'),

-- LICORERÍA HOLA - Movimientos de hoy
(11, 2, 2, 'Venta premium', 
 CURRENT_TIMESTAMP - INTERVAL '30 minutes', 3, '5dc644b0-3ce9-4c41-a83d-c7da2962214d', 1, 'venta'),
(13, 2, 5, 'Venta fin de semana', 
 CURRENT_TIMESTAMP - INTERVAL '5 hours', 3, '5dc644b0-3ce9-4c41-a83d-c7da2962214d', 2, 'venta');

-- Movimientos de AYER
INSERT INTO movimientos_inventario (
    producto_id, tipo_movimiento_id, cantidad, motivo, 
    fecha_movimiento, almacen_id, empresa_id, entidad_id, entidad_tipo
) VALUES 
-- Ferretería Marco
(3, 2, 8, 'Venta mayorista', 
 CURRENT_TIMESTAMP - INTERVAL '1 day 6 hours', 1, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47', 2, 'venta'),
(1, 1, 10, 'Entrada por compra', 
 CURRENT_TIMESTAMP - INTERVAL '1 day 8 hours', 1, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47', 3, 'compra'),

-- Minimarket Melones
(8, 2, 15, 'Venta pan fresco', 
 CURRENT_TIMESTAMP - INTERVAL '1 day 2 hours', 2, 'ebc8d621-58ad-4951-a770-160010b8f7d0', 10, 'venta'),
(9, 1, 6, 'Reposición aceites', 
 CURRENT_TIMESTAMP - INTERVAL '1 day 7 hours', 2, 'ebc8d621-58ad-4951-a770-160010b8f7d0', 4, 'compra'),

-- Licorería Hola
(12, 2, 3, 'Venta Casa Real', 
 CURRENT_TIMESTAMP - INTERVAL '1 day 4 hours', 3, '5dc644b0-3ce9-4c41-a83d-c7da2962214d', 3, 'venta'),
(14, 1, 12, 'Entrada gaseosas', 
 CURRENT_TIMESTAMP - INTERVAL '1 day 9 hours', 3, '5dc644b0-3ce9-4c41-a83d-c7da2962214d', 5, 'compra');

-- Movimientos de hace 2-3 días
INSERT INTO movimientos_inventario (
    producto_id, tipo_movimiento_id, cantidad, motivo, 
    fecha_movimiento, almacen_id, empresa_id, entidad_id, entidad_tipo
) VALUES 
(4, 2, 10, 'Venta herramientas básicas', 
 CURRENT_TIMESTAMP - INTERVAL '2 days 3 hours', 1, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47', 4, 'venta'),
(10, 2, 5, 'Venta productos limpieza', 
 CURRENT_TIMESTAMP - INTERVAL '2 days 5 hours', 2, 'ebc8d621-58ad-4951-a770-160010b8f7d0', 11, 'venta'),
(15, 2, 18, 'Venta gaseosas', 
 CURRENT_TIMESTAMP - INTERVAL '3 days 2 hours', 3, '5dc644b0-3ce9-4c41-a83d-c7da2962214d', 6, 'venta');

-- ==============================================
--                   NOTAS
-- ==============================================

/*
RESUMEN DE DATOS CREADOS CON TUS EMPRESAS REALES:

🏢 EMPRESA MARCO (Ferretería):
   - 5 productos de herramientas
   - 2 productos críticos (Amoladora, Sellador)
   - Movimientos de herramientas

🏪 EMPRESA MELONES (Minimarket):  
   - 5 productos de alimentos/limpieza
   - 2 productos críticos (Pan, Detergente)
   - Movimientos de productos básicos

🍺 EMPRESA HOLA (Licorería):
   - 5 productos de bebidas alcohólicas
   - 2 productos críticos (Johnnie Walker, Cañerito)  
   - Movimientos de licores y gaseosas

📊 PRODUCTOS CRÍTICOS TOTALES: 6 productos
📦 MOVIMIENTOS RECIENTES: 15 movimientos en últimos 3 días
🏭 ALMACENES: 3 almacenes (1 por empresa)

PARA PROBAR:
1. Ejecuta este script en tu base de datos
2. Usa los queries del archivo anterior
3. Cambia el empresa_id en los queries por:
   - Marco: 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'
   - Melones: 'ebc8d621-58ad-4951-a770-160010b8f7d0'  
   - Hola: '5dc644b0-3ce9-4c41-a83d-c7da2962214d'
*/