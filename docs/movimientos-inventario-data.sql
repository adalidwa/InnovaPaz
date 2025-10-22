-- ================================================================
-- DATOS DE PRUEBA PARA MOVIMIENTOS DE INVENTARIO Y PRODUCTOS CRÍTICOS
-- ================================================================

-- 1️⃣ Insertar tipos de movimiento
INSERT INTO tipo_movimiento (nombre, tipo, descripcion) VALUES
('Entrada por compra', 'entrada', 'Ingreso de mercancía por compra a proveedor'),
('Salida por venta', 'salida', 'Salida de mercancía por venta a cliente'),
('Ajuste de inventario', 'ajuste', 'Ajuste de stock por diferencias de inventario'),
('Devolución cliente', 'entrada', 'Ingreso por devolución de cliente'),
('Merma', 'salida', 'Salida por productos dañados o vencidos'),
('Traspaso entrada', 'entrada', 'Entrada de mercancía por traspaso entre almacenes'),
('Traspaso salida', 'salida', 'Salida de mercancía por traspaso entre almacenes');

-- 2️⃣ Crear almacén principal para las empresas
INSERT INTO almacenes (empresa_id, nombre, direccion, activo) VALUES
('0f27a6ee-a329-4555-8dff-076fc7c02306', 'Almacén Principal', 'Dirección del almacén principal', true);

-- 3️⃣ Configurar aprovisionamiento (stock mínimo) para algunos productos
-- Nota: Necesitas ajustar los producto_id según los productos que tengas en tu BD
INSERT INTO aprovisionamiento (producto_id, stock_actual, stock_minimo, stock_maximo, estado) VALUES
(1, 15, 20, 100, 'bajo'),
(2, 5, 25, 150, 'critico'),
(3, 8, 30, 200, 'critico'),
(4, 45, 50, 300, 'bajo'),
(5, 2, 15, 80, 'critico');

-- 4️⃣ Insertar movimientos de inventario de prueba
-- IMPORTANTE: Ajusta los producto_id, almacen_id y empresa_id según tu BD

-- Movimientos de entrada (compras)
INSERT INTO movimientos_inventario (
  producto_id, 
  tipo_movimiento_id, 
  cantidad, 
  motivo, 
  entidad_tipo, 
  fecha_movimiento, 
  almacen_id,
  empresa_id
) VALUES
-- Entradas recientes
(1, 1, 50, 'Compra a proveedor ABC', 'proveedor', NOW() - INTERVAL '2 hours', 1, '0f27a6ee-a329-4555-8dff-076fc7c02306'),
(2, 1, 30, 'Compra a proveedor XYZ', 'proveedor', NOW() - INTERVAL '4 hours', 1, '0f27a6ee-a329-4555-8dff-076fc7c02306'),
(3, 1, 25, 'Compra a proveedor DEF', 'proveedor', NOW() - INTERVAL '6 hours', 1, '0f27a6ee-a329-4555-8dff-076fc7c02306'),
(4, 6, 15, 'Traspaso desde sucursal', 'almacen', NOW() - INTERVAL '8 hours', 1, '0f27a6ee-a329-4555-8dff-076fc7c02306'),
(5, 4, 3, 'Devolución de cliente', 'cliente', NOW() - INTERVAL '10 hours', 1, '0f27a6ee-a329-4555-8dff-076fc7c02306'),

-- Salidas recientes
(1, 2, 12, 'Venta a cliente #001', 'cliente', NOW() - INTERVAL '1 hour', 1, '0f27a6ee-a329-4555-8dff-076fc7c02306'),
(2, 2, 8, 'Venta a cliente #002', 'cliente', NOW() - INTERVAL '3 hours', 1, '0f27a6ee-a329-4555-8dff-076fc7c02306'),
(3, 2, 5, 'Venta mayorista', 'cliente', NOW() - INTERVAL '5 hours', 1, '0f27a6ee-a329-4555-8dff-076fc7c02306'),
(4, 5, 10, 'Productos dañados', 'interno', NOW() - INTERVAL '7 hours', 1, '0f27a6ee-a329-4555-8dff-076fc7c02306'),
(5, 2, 2, 'Venta a cliente #003', 'cliente', NOW() - INTERVAL '9 hours', 1, '0f27a6ee-a329-4555-8dff-076fc7c02306'),

-- Movimientos adicionales para tener más data
(1, 2, 20, 'Venta corporativa', 'cliente', NOW() - INTERVAL '12 hours', 1, '0f27a6ee-a329-4555-8dff-076fc7c02306'),
(2, 1, 40, 'Reposición de stock', 'proveedor', NOW() - INTERVAL '1 day', 1, '0f27a6ee-a329-4555-8dff-076fc7c02306'),
(3, 2, 15, 'Venta especial', 'cliente', NOW() - INTERVAL '1 day 2 hours', 1, '0f27a6ee-a329-4555-8dff-076fc7c02306'),
(4, 3, 5, 'Ajuste de inventario', 'interno', NOW() - INTERVAL '1 day 4 hours', 1, '0f27a6ee-a329-4555-8dff-076fc7c02306'),
(5, 2, 1, 'Muestra gratis', 'cliente', NOW() - INTERVAL '1 day 6 hours', 1, '0f27a6ee-a329-4555-8dff-076fc7c02306');

-- 5️⃣ Actualizar el stock actual de productos para reflejar los movimientos
-- IMPORTANTE: Ajusta según tus productos reales
UPDATE producto SET stock = 15 WHERE producto_id = 1;  -- Producto con stock bajo
UPDATE producto SET stock = 5 WHERE producto_id = 2;   -- Producto crítico
UPDATE producto SET stock = 8 WHERE producto_id = 3;   -- Producto crítico
UPDATE producto SET stock = 45 WHERE producto_id = 4;  -- Producto con stock bajo
UPDATE producto SET stock = 2 WHERE producto_id = 5;   -- Producto crítico

-- ================================================================
-- CONSULTAS DE VERIFICACIÓN
-- ================================================================

-- Verificar tipos de movimiento creados
SELECT * FROM tipo_movimiento ORDER BY tipo_movimiento_id;

-- Verificar movimientos creados (últimos 15)
SELECT 
  mi.movimiento_id,
  p.nombre_producto,
  tm.nombre as tipo_movimiento,
  tm.tipo,
  mi.cantidad,
  mi.fecha_movimiento,
  mi.motivo,
  mi.entidad_tipo
FROM movimientos_inventario mi
JOIN producto p ON mi.producto_id = p.producto_id
JOIN tipo_movimiento tm ON mi.tipo_movimiento_id = tm.tipo_movimiento_id
WHERE mi.empresa_id = '0f27a6ee-a329-4555-8dff-076fc7c02306'
ORDER BY mi.fecha_movimiento DESC
LIMIT 15;

-- Verificar productos críticos
SELECT 
  p.producto_id,
  p.nombre_producto,
  p.stock,
  COALESCE(ap.stock_minimo, 10) as stock_minimo,
  c.nombre_categoria as categoria,
  p.imagen
FROM producto p
LEFT JOIN aprovisionamiento ap ON p.producto_id = ap.producto_id
LEFT JOIN categorias c ON p.categoria_id = c.categoria_id
WHERE p.empresa_id = '0f27a6ee-a329-4555-8dff-076fc7c02306'
  AND p.stock <= COALESCE(ap.stock_minimo, 10)
  AND p.estado_id = 1
ORDER BY (p.stock::float / COALESCE(ap.stock_minimo, 10)) ASC;

-- Verificar almacenes
SELECT * FROM almacenes WHERE empresa_id = '0f27a6ee-a329-4555-8dff-076fc7c02306';

-- ================================================================
-- NOTAS IMPORTANTES
-- ================================================================
-- 
-- 1. AJUSTAR IDs: Debes cambiar los producto_id (1,2,3,4,5) por los IDs reales 
--    de los productos en tu base de datos.
--
-- 2. EMPRESA_ID: Cambia '0f27a6ee-a329-4555-8dff-076fc7c02306' por el ID real 
--    de tu empresa de prueba.
--
-- 3. ALMACEN_ID: El almacén se crea automáticamente con ID 1, pero verifica 
--    que coincida con el usado en los movimientos.
--
-- 4. EJECUTAR PASO A PASO: Ejecuta primero las inserciones de tipos de movimiento
--    y almacenes, luego los movimientos, y finalmente las actualizaciones de stock.
--
-- 5. VERIFICAR PRODUCTOS: Asegúrate de que tienes productos creados antes de
--    ejecutar este script.
--
-- ================================================================
