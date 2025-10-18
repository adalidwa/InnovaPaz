-- ================================================================
-- DATOS DE PRUEBA PARA TU BASE DE DATOS ACTUAL
-- EMPRESA: Ferretería El Tornillo Feliz (UUID: d03e9c21-1d2c-459f-ab01-4dc44b43bc47)
-- PRODUCTO: Taladro (ID: 1)
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

-- 2️⃣ Crear almacén principal para tu empresa
INSERT INTO almacenes (empresa_id, nombre, direccion, activo) VALUES
('d03e9c21-1d2c-459f-ab01-4dc44b43bc47', 'Almacén Principal', 'Dirección del almacén principal', true);

-- 3️⃣ Configurar aprovisionamiento (stock mínimo) para tu producto
INSERT INTO aprovisionamiento (producto_id, stock_actual, stock_minimo, stock_maximo, estado) VALUES
(1, 50, 20, 100, 'normal'); -- Tu taladro tiene stock 50, mínimo 20

-- 4️⃣ Insertar movimientos de inventario de prueba para tu producto
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
-- Entradas recientes del Taladro
(1, 1, 30, 'Compra a proveedor Bosch', 'proveedor', NOW() - INTERVAL '2 hours', 1, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'),
(1, 1, 25, 'Reposición de stock', 'proveedor', NOW() - INTERVAL '6 hours', 1, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'),
(1, 4, 2, 'Devolución de cliente por defecto', 'cliente', NOW() - INTERVAL '10 hours', 1, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'),
(1, 6, 10, 'Traspaso desde bodega', 'almacen', NOW() - INTERVAL '1 day', 1, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'),

-- Salidas recientes del Taladro
(1, 2, 5, 'Venta a constructor Juan Pérez', 'cliente', NOW() - INTERVAL '1 hour', 1, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'),
(1, 2, 8, 'Venta mayorista', 'cliente', NOW() - INTERVAL '4 hours', 1, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'),
(1, 2, 3, 'Venta a ferretería pequeña', 'cliente', NOW() - INTERVAL '8 hours', 1, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'),
(1, 5, 1, 'Producto dañado en transporte', 'interno', NOW() - INTERVAL '12 hours', 1, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'),
(1, 2, 15, 'Venta corporativa a empresa constructora', 'cliente', NOW() - INTERVAL '1 day 2 hours', 1, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'),

-- Movimientos adicionales para tener más historial
(1, 3, -2, 'Ajuste por inventario físico', 'interno', NOW() - INTERVAL '1 day 6 hours', 1, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'),
(1, 2, 4, 'Venta online', 'cliente', NOW() - INTERVAL '1 day 8 hours', 1, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'),
(1, 1, 20, 'Compra de emergencia', 'proveedor', NOW() - INTERVAL '2 days', 1, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'),
(1, 2, 6, 'Venta a taller mecánico', 'cliente', NOW() - INTERVAL '2 days 4 hours', 1, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'),
(1, 2, 2, 'Muestra para cliente potencial', 'cliente', NOW() - INTERVAL '2 days 8 hours', 1, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47');

-- 5️⃣ Para simular un producto crítico, vamos a reducir el stock del taladro
UPDATE producto SET stock = 15 WHERE producto_id = 1;  -- Ahora está por debajo del mínimo (20)

-- 6️⃣ Actualizar el stock actual en aprovisionamiento
UPDATE aprovisionamiento SET stock_actual = 15 WHERE producto_id = 1;

-- ================================================================
-- CONSULTAS DE PRUEBA - COPIA Y PEGA ESTAS URLS EN TU NAVEGADOR
-- ================================================================

-- 🔗 PROBAR ENDPOINT DE MOVIMIENTOS:
-- http://localhost:4000/api/inventory/movements?empresa_id=d03e9c21-1d2c-459f-ab01-4dc44b43bc47&limit=15

-- 🔗 PROBAR ENDPOINT DE PRODUCTOS CRÍTICOS:
-- http://localhost:4000/api/inventory/critical-products?empresa_id=d03e9c21-1d2c-459f-ab01-4dc44b43bc47

-- ================================================================
-- CONSULTAS SQL PARA VERIFICAR EN TU BASE DE DATOS
-- ================================================================

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
WHERE mi.empresa_id = 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'
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
WHERE p.empresa_id = 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'
  AND p.stock <= COALESCE(ap.stock_minimo, 10)
  AND p.estado_id = 1
ORDER BY (p.stock::float / COALESCE(ap.stock_minimo, 10)) ASC;

-- Verificar tu producto actual
SELECT * FROM producto WHERE producto_id = 1;

-- Verificar aprovisionamiento
SELECT * FROM aprovisionamiento WHERE producto_id = 1;

-- ================================================================
-- PASOS PARA PROBAR
-- ================================================================
-- 
-- 1. EJECUTA ESTE SCRIPT: Copia y pega todo este SQL en tu base de datos
-- 
-- 2. REINICIA EL BACKEND: Asegúrate de que el backend esté corriendo en puerto 4000
-- 
-- 3. PRUEBA LOS ENDPOINTS: Usa las URLs de arriba en tu navegador o Postman
-- 
-- 4. VERIFICA EL DASHBOARD: Ve a tu aplicación React y mira el Dashboard
-- 
-- 5. RESULTADO ESPERADO:
--    - "Movimientos Recientes" debe mostrar 15 movimientos del Taladro
--    - "Productos Críticos" debe mostrar el Taladro (stock 15 < mínimo 20)
-- 
-- ================================================================