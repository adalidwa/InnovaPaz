-- ================================================================
-- MIGRACIÓN CORREGIDA: Insertar plantillas de roles
-- ================================================================

-- Limpiar plantillas existentes si las hay
DELETE FROM roles_plantilla WHERE es_predeterminado = true;

-- MINIMARKET - 5 roles
INSERT INTO roles_plantilla (nombre_rol, descripcion, tipo_empresa_id, permisos, orden_visualizacion)
SELECT 'Administrador', 'Acceso total al sistema', tipo_id, 
'{
  "ventas": {"crear": true, "leer": true, "actualizar": true, "eliminar": true},
  "compras": {"crear": true, "leer": true, "actualizar": true, "eliminar": true},
  "inventarios": {"crear": true, "leer": true, "actualizar": true, "eliminar": true},
  "usuarios": {"crear": true, "leer": true, "actualizar": true, "eliminar": true},
  "reportes": {"crear": true, "leer": true, "actualizar": true, "eliminar": true}
}'::jsonb, 1
FROM tipos_empresa WHERE tipo_empresa = 'Minimarket';

INSERT INTO roles_plantilla (nombre_rol, descripcion, tipo_empresa_id, permisos, orden_visualizacion)
SELECT 'Cajero', 'Realiza ventas y cobros', tipo_id,
'{
  "ventas": {"crear": true, "leer": true, "actualizar": false, "eliminar": false},
  "compras": {"crear": false, "leer": false, "actualizar": false, "eliminar": false},
  "inventarios": {"crear": false, "leer": true, "actualizar": false, "eliminar": false},
  "usuarios": {"crear": false, "leer": false, "actualizar": false, "eliminar": false},
  "reportes": {"crear": false, "leer": true, "actualizar": false, "eliminar": false}
}'::jsonb, 2
FROM tipos_empresa WHERE tipo_empresa = 'Minimarket';

INSERT INTO roles_plantilla (nombre_rol, descripcion, tipo_empresa_id, permisos, orden_visualizacion)
SELECT 'Encargado de Inventario', 'Controla existencias y realiza pedidos a proveedores', tipo_id,
'{
  "ventas": {"crear": false, "leer": true, "actualizar": false, "eliminar": false},
  "compras": {"crear": true, "leer": true, "actualizar": true, "eliminar": false},
  "inventarios": {"crear": true, "leer": true, "actualizar": true, "eliminar": false},
  "usuarios": {"crear": false, "leer": false, "actualizar": false, "eliminar": false},
  "reportes": {"crear": false, "leer": true, "actualizar": false, "eliminar": false}
}'::jsonb, 3
FROM tipos_empresa WHERE tipo_empresa = 'Minimarket';

INSERT INTO roles_plantilla (nombre_rol, descripcion, tipo_empresa_id, permisos, orden_visualizacion)
SELECT 'Contador', 'Registra movimientos financieros y controla el cierre diario', tipo_id,
'{
  "ventas": {"crear": false, "leer": true, "actualizar": false, "eliminar": false},
  "compras": {"crear": false, "leer": true, "actualizar": false, "eliminar": false},
  "inventarios": {"crear": false, "leer": true, "actualizar": false, "eliminar": false},
  "usuarios": {"crear": false, "leer": false, "actualizar": false, "eliminar": false},
  "reportes": {"crear": true, "leer": true, "actualizar": true, "eliminar": false}
}'::jsonb, 4
FROM tipos_empresa WHERE tipo_empresa = 'Minimarket';

INSERT INTO roles_plantilla (nombre_rol, descripcion, tipo_empresa_id, permisos, orden_visualizacion)
SELECT 'Vendedor / Reponedor', 'Atiende clientes, acomoda góndolas y actualiza precios', tipo_id,
'{
  "ventas": {"crear": true, "leer": true, "actualizar": true, "eliminar": false},
  "compras": {"crear": false, "leer": false, "actualizar": false, "eliminar": false},
  "inventarios": {"crear": false, "leer": true, "actualizar": true, "eliminar": false},
  "usuarios": {"crear": false, "leer": false, "actualizar": false, "eliminar": false},
  "reportes": {"crear": false, "leer": true, "actualizar": false, "eliminar": false}
}'::jsonb, 5
FROM tipos_empresa WHERE tipo_empresa = 'Minimarket';

-- LICORERIA - 5 roles
INSERT INTO roles_plantilla (nombre_rol, descripcion, tipo_empresa_id, permisos, orden_visualizacion)
SELECT 'Administrador', 'Acceso total al sistema', tipo_id,
'{
  "ventas": {"crear": true, "leer": true, "actualizar": true, "eliminar": true},
  "compras": {"crear": true, "leer": true, "actualizar": true, "eliminar": true},
  "inventarios": {"crear": true, "leer": true, "actualizar": true, "eliminar": true},
  "usuarios": {"crear": true, "leer": true, "actualizar": true, "eliminar": true},
  "reportes": {"crear": true, "leer": true, "actualizar": true, "eliminar": true}
}'::jsonb, 1
FROM tipos_empresa WHERE tipo_empresa = 'Licoreria';

INSERT INTO roles_plantilla (nombre_rol, descripcion, tipo_empresa_id, permisos, orden_visualizacion)
SELECT 'Cajero / Dependiente', 'Realiza ventas y atiende clientes', tipo_id,
'{
  "ventas": {"crear": true, "leer": true, "actualizar": false, "eliminar": false},
  "compras": {"crear": false, "leer": false, "actualizar": false, "eliminar": false},
  "inventarios": {"crear": false, "leer": true, "actualizar": false, "eliminar": false},
  "usuarios": {"crear": false, "leer": false, "actualizar": false, "eliminar": false},
  "reportes": {"crear": false, "leer": true, "actualizar": false, "eliminar": false}
}'::jsonb, 2
FROM tipos_empresa WHERE tipo_empresa = 'Licoreria';

INSERT INTO roles_plantilla (nombre_rol, descripcion, tipo_empresa_id, permisos, orden_visualizacion)
SELECT 'Encargado de Almacén', 'Supervisa el stock, fechas de vencimiento y control de lote', tipo_id,
'{
  "ventas": {"crear": false, "leer": true, "actualizar": false, "eliminar": false},
  "compras": {"crear": true, "leer": true, "actualizar": true, "eliminar": false},
  "inventarios": {"crear": true, "leer": true, "actualizar": true, "eliminar": true},
  "usuarios": {"crear": false, "leer": false, "actualizar": false, "eliminar": false},
  "reportes": {"crear": false, "leer": true, "actualizar": false, "eliminar": false}
}'::jsonb, 3
FROM tipos_empresa WHERE tipo_empresa = 'Licoreria';

INSERT INTO roles_plantilla (nombre_rol, descripcion, tipo_empresa_id, permisos, orden_visualizacion)
SELECT 'Asistente Administrativo', 'Apoya en gestión de compras y registros', tipo_id,
'{
  "ventas": {"crear": false, "leer": true, "actualizar": false, "eliminar": false},
  "compras": {"crear": true, "leer": true, "actualizar": true, "eliminar": false},
  "inventarios": {"crear": false, "leer": true, "actualizar": false, "eliminar": false},
  "usuarios": {"crear": false, "leer": false, "actualizar": false, "eliminar": false},
  "reportes": {"crear": true, "leer": true, "actualizar": false, "eliminar": false}
}'::jsonb, 4
FROM tipos_empresa WHERE tipo_empresa = 'Licoreria';

INSERT INTO roles_plantilla (nombre_rol, descripcion, tipo_empresa_id, permisos, orden_visualizacion)
SELECT 'Encargado Comercial', 'Diseña promociones y coordina ventas', tipo_id,
'{
  "ventas": {"crear": true, "leer": true, "actualizar": true, "eliminar": false},
  "compras": {"crear": false, "leer": true, "actualizar": false, "eliminar": false},
  "inventarios": {"crear": false, "leer": true, "actualizar": false, "eliminar": false},
  "usuarios": {"crear": false, "leer": false, "actualizar": false, "eliminar": false},
  "reportes": {"crear": true, "leer": true, "actualizar": false, "eliminar": false}
}'::jsonb, 5
FROM tipos_empresa WHERE tipo_empresa = 'Licoreria';

-- FERRETERIA - 5 roles
INSERT INTO roles_plantilla (nombre_rol, descripcion, tipo_empresa_id, permisos, orden_visualizacion)
SELECT 'Administrador', 'Acceso total al sistema', tipo_id,
'{
  "ventas": {"crear": true, "leer": true, "actualizar": true, "eliminar": true},
  "compras": {"crear": true, "leer": true, "actualizar": true, "eliminar": true},
  "inventarios": {"crear": true, "leer": true, "actualizar": true, "eliminar": true},
  "usuarios": {"crear": true, "leer": true, "actualizar": true, "eliminar": true},
  "reportes": {"crear": true, "leer": true, "actualizar": true, "eliminar": true}
}'::jsonb, 1
FROM tipos_empresa WHERE tipo_empresa = 'Ferreteria';

INSERT INTO roles_plantilla (nombre_rol, descripcion, tipo_empresa_id, permisos, orden_visualizacion)
SELECT 'Cajero', 'Realiza cobros y cierre de caja', tipo_id,
'{
  "ventas": {"crear": true, "leer": true, "actualizar": false, "eliminar": false},
  "compras": {"crear": false, "leer": false, "actualizar": false, "eliminar": false},
  "inventarios": {"crear": false, "leer": true, "actualizar": false, "eliminar": false},
  "usuarios": {"crear": false, "leer": false, "actualizar": false, "eliminar": false},
  "reportes": {"crear": false, "leer": true, "actualizar": false, "eliminar": false}
}'::jsonb, 2
FROM tipos_empresa WHERE tipo_empresa = 'Ferreteria';

INSERT INTO roles_plantilla (nombre_rol, descripcion, tipo_empresa_id, permisos, orden_visualizacion)
SELECT 'Vendedor Técnico', 'Asesora clientes sobre herramientas y materiales', tipo_id,
'{
  "ventas": {"crear": true, "leer": true, "actualizar": true, "eliminar": false},
  "compras": {"crear": false, "leer": false, "actualizar": false, "eliminar": false},
  "inventarios": {"crear": false, "leer": true, "actualizar": false, "eliminar": false},
  "usuarios": {"crear": false, "leer": false, "actualizar": false, "eliminar": false},
  "reportes": {"crear": false, "leer": true, "actualizar": false, "eliminar": false}
}'::jsonb, 3
FROM tipos_empresa WHERE tipo_empresa = 'Ferreteria';

INSERT INTO roles_plantilla (nombre_rol, descripcion, tipo_empresa_id, permisos, orden_visualizacion)
SELECT 'Encargado de Proveeduría', 'Gestiona compras y control de stock', tipo_id,
'{
  "ventas": {"crear": false, "leer": true, "actualizar": false, "eliminar": false},
  "compras": {"crear": true, "leer": true, "actualizar": true, "eliminar": true},
  "inventarios": {"crear": true, "leer": true, "actualizar": true, "eliminar": false},
  "usuarios": {"crear": false, "leer": false, "actualizar": false, "eliminar": false},
  "reportes": {"crear": false, "leer": true, "actualizar": false, "eliminar": false}
}'::jsonb, 4
FROM tipos_empresa WHERE tipo_empresa = 'Ferreteria';

INSERT INTO roles_plantilla (nombre_rol, descripcion, tipo_empresa_id, permisos, orden_visualizacion)
SELECT 'Asistente Administrativo', 'Maneja facturación y documentos de venta', tipo_id,
'{
  "ventas": {"crear": false, "leer": true, "actualizar": true, "eliminar": false},
  "compras": {"crear": false, "leer": true, "actualizar": false, "eliminar": false},
  "inventarios": {"crear": false, "leer": true, "actualizar": false, "eliminar": false},
  "usuarios": {"crear": false, "leer": false, "actualizar": false, "eliminar": false},
  "reportes": {"crear": true, "leer": true, "actualizar": false, "eliminar": false}
}'::jsonb, 5
FROM tipos_empresa WHERE tipo_empresa = 'Ferreteria';

-- Verificar inserción
SELECT 
    rp.plantilla_id,
    rp.nombre_rol,
    te.tipo_empresa,
    rp.orden_visualizacion
FROM roles_plantilla rp
JOIN tipos_empresa te ON rp.tipo_empresa_id = te.tipo_id
ORDER BY te.tipo_empresa, rp.orden_visualizacion;