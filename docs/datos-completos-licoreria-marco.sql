-- ================================================================
-- DATOS DE PRUEBA PARA LICORERÍA "MARCO" 
-- EMPRESA: Marco (UUID: d03e9c21-1d2c-459f-ab01-4dc44b43bc47)
-- USUARIO: Anderson Checa Tito (ande@gmail.com)
-- TIPO: Licorería (tipo_empresa_id = 2)
-- ================================================================

-- 1️⃣ Insertar tipos de movimiento (si no existen)
INSERT INTO tipo_movimiento (nombre, tipo, descripcion) VALUES
('Entrada por compra', 'entrada', 'Ingreso de mercancía por compra a proveedor'),
('Salida por venta', 'salida', 'Salida de mercancía por venta a cliente'),
('Ajuste de inventario', 'ajuste', 'Ajuste de stock por diferencias de inventario'),
('Devolución cliente', 'entrada', 'Ingreso por devolución de cliente'),
('Merma', 'salida', 'Salida por productos dañados o vencidos'),
('Traspaso entrada', 'entrada', 'Entrada de mercancía por traspaso entre almacenes'),
('Traspaso salida', 'salida', 'Salida de mercancía por traspaso entre almacenes')
ON CONFLICT (nombre) DO NOTHING;

-- 2️⃣ Crear almacén para la licorería Marco (si no existe)
INSERT INTO almacenes (empresa_id, nombre, direccion, activo) VALUES
('d03e9c21-1d2c-459f-ab01-4dc44b43bc47', 'Almacén Principal - Licorería Marco', 'Local comercial principal', true)
ON CONFLICT DO NOTHING;

-- 3️⃣ Actualizar el producto existente para que sea más realista para una licorería
UPDATE producto SET 
  nombre_producto = 'Cerveza Pilsen Lata 330ml',
  descripcion = 'Cerveza rubia tradicional peruana en lata de 330ml',
  precio_venta = 2.50,
  stock = 15,
  imagen = 'https://res.cloudinary.com/drznmyqg8/image/upload/c_fill,w_400,h_400,q_auto,f_auto/v1234567890/innovapaz/products/cerveza-pilsen.jpg'
WHERE producto_id = 1;

-- 4️⃣ Crear productos adicionales para la licorería (usando categorías existentes)
-- NOTA: Ajusta los categoria_id, marca_id, estado_id según tu base de datos

INSERT INTO producto (
  nombre_producto, descripcion, precio_venta, precio_compra, stock, stock_minimo,
  categoria_id, marca_id, estado_id, empresa_id, codigo_producto, imagen
) VALUES
-- Cervezas y bebidas alcohólicas
('Whisky Old Parr 750ml', 'Whisky escocés de 12 años, botella de 750ml', 85.00, 68.00, 8, 12, 34, 1, 1, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47', 'WHY001', 'https://res.cloudinary.com/drznmyqg8/image/upload/c_fill,w_400,h_400,q_auto,f_auto/v1234567890/innovapaz/products/whisky-old-parr.jpg'),

('Ron Medellín Añejo 750ml', 'Ron colombiano añejo, botella de 750ml', 32.00, 24.00, 6, 15, 34, 1, 1, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47', 'RON001', 'https://res.cloudinary.com/drznmyqg8/image/upload/c_fill,w_400,h_400,q_auto,f_auto/v1234567890/innovapaz/products/ron-medellin.jpg'),

('Aguardiente Antioqueño 750ml', 'Aguardiente tradicional colombiano sin azúcar', 25.00, 18.00, 4, 20, 34, 1, 1, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47', 'AGU001', 'https://res.cloudinary.com/drznmyqg8/image/upload/c_fill,w_400,h_400,q_auto,f_auto/v1234567890/innovapaz/products/aguardiente-antioqueno.jpg'),

('Cerveza Corona Extra 355ml', 'Cerveza mexicana premium botella', 3.50, 2.80, 3, 24, 34, 1, 1, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47', 'CRV002', 'https://res.cloudinary.com/drznmyqg8/image/upload/c_fill,w_400,h_400,q_auto,f_auto/v1234567890/innovapaz/products/cerveza-corona.jpg'),

-- Snacks y acompañantes
('Papitas Margarita Natural', 'Papitas fritas naturales 150g', 3.50, 2.20, 2, 25, 34, 1, 1, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47', 'SNK001', 'https://res.cloudinary.com/drznmyqg8/image/upload/c_fill,w_400,h_400,q_auto,f_auto/v1234567890/innovapaz/products/papitas-margarita.jpg'),

('Maní Salado La Especial', 'Maní tostado y salado 200g', 4.00, 2.50, 1, 30, 34, 1, 1, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47', 'SNK002', 'https://res.cloudinary.com/drznmyqg8/image/upload/c_fill,w_400,h_400,q_auto,f_auto/v1234567890/innovapaz/products/mani-salado.jpg');

-- 5️⃣ Configurar aprovisionamiento para todos los productos
INSERT INTO aprovisionamiento (producto_id, stock_actual, stock_minimo, stock_maximo, estado) VALUES
(1, 15, 20, 120, 'critico'),   -- Cerveza Pilsen (crítico)
(2, 8, 12, 50, 'critico'),     -- Whisky (crítico)
(3, 6, 15, 60, 'critico'),     -- Ron (crítico)
(4, 4, 20, 80, 'critico'),     -- Aguardiente (crítico)
(5, 3, 24, 100, 'critico'),    -- Corona (crítico)
(6, 2, 25, 150, 'critico'),    -- Papitas (crítico)
(7, 1, 30, 200, 'critico')     -- Maní (crítico)
ON CONFLICT (producto_id) DO UPDATE SET
  stock_actual = EXCLUDED.stock_actual,
  stock_minimo = EXCLUDED.stock_minimo,
  stock_maximo = EXCLUDED.stock_maximo,
  estado = EXCLUDED.estado;

-- 6️⃣ Crear movimientos realistas para una licorería
INSERT INTO movimientos_inventario (
  producto_id, tipo_movimiento_id, cantidad, motivo, entidad_tipo, 
  fecha_movimiento, almacen_id, empresa_id
) VALUES
-- Movimientos de Cerveza Pilsen (producto_id = 1)
(1, 1, 36, 'Compra semanal cervezas Bavaria', 'proveedor', NOW() - INTERVAL '2 hours', 1, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'),
(1, 2, 12, 'Venta fin de semana fiesta universitaria', 'cliente', NOW() - INTERVAL '4 hours', 1, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'),
(1, 2, 6, 'Venta a tienda de barrio La Esquina', 'cliente', NOW() - INTERVAL '6 hours', 1, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'),
(1, 2, 8, 'Venta promoción 2x1', 'cliente', NOW() - INTERVAL '8 hours', 1, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'),

-- Movimientos de Whisky (producto_id = 2) 
(2, 1, 12, 'Compra whisky premium importador', 'proveedor', NOW() - INTERVAL '1 day', 1, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'),
(2, 2, 2, 'Venta cumpleaños ejecutivo', 'cliente', NOW() - INTERVAL '10 hours', 1, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'),
(2, 2, 1, 'Venta cliente VIP empresa', 'cliente', NOW() - INTERVAL '12 hours', 1, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'),
(2, 2, 1, 'Venta regalo aniversario', 'cliente', NOW() - INTERVAL '1 day 2 hours', 1, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'),

-- Movimientos de Ron (producto_id = 3)
(3, 1, 18, 'Reposición ron nacional distribuidor', 'proveedor', NOW() - INTERVAL '1 day 6 hours', 1, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'),
(3, 2, 8, 'Venta mayorista bar El Dorado', 'cliente', NOW() - INTERVAL '14 hours', 1, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'),
(3, 2, 4, 'Venta fiesta privada quinceañera', 'cliente', NOW() - INTERVAL '16 hours', 1, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'),

-- Movimientos de Aguardiente (producto_id = 4)
(4, 1, 24, 'Compra aguardiente tradicional', 'proveedor', NOW() - INTERVAL '2 days', 1, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'),
(4, 2, 12, 'Venta celebración día del padre', 'cliente', NOW() - INTERVAL '18 hours', 1, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'),
(4, 2, 5, 'Venta domicilio fin de semana', 'cliente', NOW() - INTERVAL '20 hours', 1, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'),
(4, 2, 3, 'Venta parranda amigos', 'cliente', NOW() - INTERVAL '1 day 4 hours', 1, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'),

-- Movimientos de Corona (producto_id = 5)
(5, 1, 24, 'Compra cerveza premium importada', 'proveedor', NOW() - INTERVAL '3 days', 1, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'),
(5, 2, 18, 'Venta evento empresarial tech', 'cliente', NOW() - INTERVAL '1 day 8 hours', 1, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'),
(5, 2, 3, 'Venta restaurante zona rosa', 'cliente', NOW() - INTERVAL '22 hours', 1, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'),

-- Movimientos de Snacks
(6, 2, 15, 'Venta snacks fin de semana', 'cliente', NOW() - INTERVAL '1 day 10 hours', 1, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'),
(6, 2, 8, 'Venta acompañamiento licores', 'cliente', NOW() - INTERVAL '1 day 12 hours', 1, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'),
(7, 2, 20, 'Venta maní estudiantes universidad', 'cliente', NOW() - INTERVAL '2 days 2 hours', 1, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'),

-- Movimientos de ajuste y mermas
(1, 5, 2, 'Latas abolladas transporte', 'interno', NOW() - INTERVAL '3 days', 1, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'),
(3, 3, -1, 'Ajuste inventario físico', 'interno', NOW() - INTERVAL '2 days 8 hours', 1, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'),
(7, 5, 3, 'Producto vencido', 'interno', NOW() - INTERVAL '4 days', 1, 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47');

-- ================================================================
-- VERIFICACIÓN Y PRUEBAS
-- ================================================================

-- Verificar productos de la licorería Marco
SELECT 
  p.producto_id, 
  p.nombre_producto, 
  p.stock, 
  p.precio_venta,
  c.nombre_categoria
FROM producto p
LEFT JOIN categorias c ON p.categoria_id = c.categoria_id
WHERE p.empresa_id = 'd03e9c21-1d2c-459f-ab01-4dc44b43bc47'
ORDER BY p.producto_id;

-- ================================================================
-- ENDPOINTS PARA PROBAR
-- ================================================================

-- 🔗 MOVIMIENTOS RECIENTES (deberías ver cervezas, licores, snacks):
-- http://localhost:4000/api/inventory/movements?empresa_id=d03e9c21-1d2c-459f-ab01-4dc44b43bc47&limit=15

-- 🔗 PRODUCTOS CRÍTICOS (deberías ver todos los productos con stock bajo):
-- http://localhost:4000/api/inventory/critical-products?empresa_id=d03e9c21-1d2c-459f-ab01-4dc44b43bc47

-- ================================================================
-- INSTRUCCIONES FINALES
-- ================================================================
-- 
-- 1. EJECUTA ESTE SCRIPT: Copia y pega en tu base de datos
-- 
-- 2. CONFIGURA CLOUDINARY:
--    - Ve a tu dashboard de Cloudinary
--    - Crea un upload preset llamado "innovapaz_products" 
--    - Configúralo como "Unsigned"
--    - Lee el archivo docs/cloudinary-setup.md para más detalles
--
-- 3. PRUEBA LA SUBIDA DE IMÁGENES:
--    - Ve al formulario de productos en tu app
--    - Usa el nuevo botón de subir imagen
--    - Las imágenes se subirán automáticamente a Cloudinary
--
-- 4. VERIFICA EL DASHBOARD:
--    - Movimientos Recientes: Ventas de cervezas, licores, snacks
--    - Productos Críticos: Todos los productos con stock bajo
--    - Ya no debería aparecer "undefined"
--
-- ================================================================