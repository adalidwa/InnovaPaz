-- ================================================================
-- MIGRACIÓN: Sistema de Roles con Plantillas
-- Fecha: 17 de octubre de 2025
-- Descripción: Refactorizar sistema de roles para usar plantillas
-- ================================================================

-- Paso 1: Crear tabla roles_plantilla para roles predeterminados
CREATE TABLE IF NOT EXISTS roles_plantilla (
    plantilla_id SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(100) NOT NULL,
    descripcion TEXT,
    tipo_empresa_id INT NOT NULL REFERENCES tipos_empresa(tipo_id) ON DELETE CASCADE,
    permisos JSONB NOT NULL,
    es_predeterminado BOOLEAN DEFAULT true,
    orden_visualizacion INT DEFAULT 0, -- Para ordenar roles en el frontend
    fecha_creacion TIMESTAMP DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_roles_plantilla_tipo_empresa ON roles_plantilla(tipo_empresa_id);
CREATE INDEX IF NOT EXISTS idx_roles_plantilla_predeterminado ON roles_plantilla(es_predeterminado);

-- Paso 2: Modificar tabla roles existente para roles personalizados
-- Agregar columna para referenciar plantilla origen (opcional)
ALTER TABLE roles 
ADD COLUMN IF NOT EXISTS plantilla_id_origen INT REFERENCES roles_plantilla(plantilla_id) ON DELETE SET NULL;

-- Agregar índice para la nueva relación
CREATE INDEX IF NOT EXISTS idx_roles_plantilla_origen ON roles(plantilla_id_origen);

-- Paso 3: Limpiar campos innecesarios de la tabla empresas
-- Eliminar campos que no se usan según la revisión
ALTER TABLE empresas 
DROP COLUMN IF EXISTS tamaño_empresa,
DROP COLUMN IF EXISTS email;

-- Paso 4: Insertar roles plantilla para cada tipo de empresa
INSERT INTO roles_plantilla (nombre_rol, descripcion, tipo_empresa_id, permisos, orden_visualizacion)
VALUES
-- MINIMARKET
('Administrador', 'Acceso total al sistema', (SELECT tipo_id FROM tipos_empresa WHERE tipo_empresa = 'Minimarket'), '{
  "ventas": {"crear": true, "leer": true, "actualizar": true, "eliminar": true},
  "compras": {"crear": true, "leer": true, "actualizar": true, "eliminar": true},
  "inventarios": {"crear": true, "leer": true, "actualizar": true, "eliminar": true},
  "usuarios": {"crear": true, "leer": true, "actualizar": true, "eliminar": true},
  "reportes": {"crear": true, "leer": true, "actualizar": true, "eliminar": true}
}'::jsonb, 1),

('Cajero', 'Realiza ventas y cobros', (SELECT tipo_id FROM tipos_empresa WHERE tipo_empresa = 'Minimarket'), '{
  "ventas": {"crear": true, "leer": true, "actualizar": false, "eliminar": false},
  "compras": {"crear": false, "leer": false, "actualizar": false, "eliminar": false},
  "inventarios": {"crear": false, "leer": true, "actualizar": false, "eliminar": false},
  "usuarios": {"crear": false, "leer": false, "actualizar": false, "eliminar": false},
  "reportes": {"crear": false, "leer": true, "actualizar": false, "eliminar": false}
}'::jsonb, 2),

('Encargado de Inventario', 'Controla existencias y realiza pedidos a proveedores', (SELECT tipo_id FROM tipos_empresa WHERE tipo_empresa = 'Minimarket'), '{
  "ventas": {"crear": false, "leer": true, "actualizar": false, "eliminar": false},
  "compras": {"crear": true, "leer": true, "actualizar": true, "eliminar": false},
  "inventarios": {"crear": true, "leer": true, "actualizar": true, "eliminar": false},
  "usuarios": {"crear": false, "leer": false, "actualizar": false, "eliminar": false},
  "reportes": {"crear": false, "leer": true, "actualizar": false, "eliminar": false}
}'::jsonb, 3),

('Contador', 'Registra movimientos financieros y controla el cierre diario', (SELECT tipo_id FROM tipos_empresa WHERE tipo_empresa = 'Minimarket'), '{
  "ventas": {"crear": false, "leer": true, "actualizar": false, "eliminar": false},
  "compras": {"crear": false, "leer": true, "actualizar": false, "eliminar": false},
  "inventarios": {"crear": false, "leer": true, "actualizar": false, "eliminar": false},
  "usuarios": {"crear": false, "leer": false, "actualizar": false, "eliminar": false},
  "reportes": {"crear": true, "leer": true, "actualizar": true, "eliminar": false}
}'::jsonb, 4),

('Vendedor / Reponedor', 'Atiende clientes, acomoda góndolas y actualiza precios', (SELECT tipo_id FROM tipos_empresa WHERE tipo_empresa = 'Minimarket'), '{
  "ventas": {"crear": true, "leer": true, "actualizar": true, "eliminar": false},
  "compras": {"crear": false, "leer": false, "actualizar": false, "eliminar": false},
  "inventarios": {"crear": false, "leer": true, "actualizar": true, "eliminar": false},
  "usuarios": {"crear": false, "leer": false, "actualizar": false, "eliminar": false},
  "reportes": {"crear": false, "leer": true, "actualizar": false, "eliminar": false}
}'::jsonb, 5),

-- LICORERIA
((SELECT tipo_id FROM tipos WHERE tipo_empresa = 'Licoreria'), 'Administrador', 'Acceso total al sistema', '{
  "ventas": {"crear": true, "leer": true, "actualizar": true, "eliminar": true},
  "compras": {"crear": true, "leer": true, "actualizar": true, "eliminar": true},
  "inventarios": {"crear": true, "leer": true, "actualizar": true, "eliminar": true},
  "usuarios": {"crear": true, "leer": true, "actualizar": true, "eliminar": true},
  "reportes": {"crear": true, "leer": true, "actualizar": true, "eliminar": true}
}'::jsonb, 1),

((SELECT tipo_id FROM tipos WHERE tipo_empresa = 'Licoreria'), 'Cajero / Dependiente', 'Realiza ventas y atiende clientes', '{
  "ventas": {"crear": true, "leer": true, "actualizar": false, "eliminar": false},
  "compras": {"crear": false, "leer": false, "actualizar": false, "eliminar": false},
  "inventarios": {"crear": false, "leer": true, "actualizar": false, "eliminar": false},
  "usuarios": {"crear": false, "leer": false, "actualizar": false, "eliminar": false},
  "reportes": {"crear": false, "leer": true, "actualizar": false, "eliminar": false}
}'::jsonb, 2),

((SELECT tipo_id FROM tipos WHERE tipo_empresa = 'Licoreria'), 'Encargado de Almacén', 'Supervisa el stock, fechas de vencimiento y control de lote', '{
  "ventas": {"crear": false, "leer": true, "actualizar": false, "eliminar": false},
  "compras": {"crear": true, "leer": true, "actualizar": true, "eliminar": false},
  "inventarios": {"crear": true, "leer": true, "actualizar": true, "eliminar": true},
  "usuarios": {"crear": false, "leer": false, "actualizar": false, "eliminar": false},
  "reportes": {"crear": false, "leer": true, "actualizar": false, "eliminar": false}
}'::jsonb, 3),

((SELECT tipo_id FROM tipos WHERE tipo_empresa = 'Licoreria'), 'Asistente Administrativo', 'Apoya en gestión de compras y registros', '{
  "ventas": {"crear": false, "leer": true, "actualizar": false, "eliminar": false},
  "compras": {"crear": true, "leer": true, "actualizar": true, "eliminar": false},
  "inventarios": {"crear": false, "leer": true, "actualizar": false, "eliminar": false},
  "usuarios": {"crear": false, "leer": false, "actualizar": false, "eliminar": false},
  "reportes": {"crear": true, "leer": true, "actualizar": false, "eliminar": false}
}'::jsonb, 4),

((SELECT tipo_id FROM tipos WHERE tipo_empresa = 'Licoreria'), 'Encargado Comercial', 'Diseña promociones y coordina ventas', '{
  "ventas": {"crear": true, "leer": true, "actualizar": true, "eliminar": false},
  "compras": {"crear": false, "leer": true, "actualizar": false, "eliminar": false},
  "inventarios": {"crear": false, "leer": true, "actualizar": false, "eliminar": false},
  "usuarios": {"crear": false, "leer": false, "actualizar": false, "eliminar": false},
  "reportes": {"crear": true, "leer": true, "actualizar": false, "eliminar": false}
}'::jsonb, 5),

-- FERRETERIA
((SELECT tipo_id FROM tipos WHERE tipo_empresa = 'Ferreteria'), 'Administrador', 'Acceso total al sistema', '{
  "ventas": {"crear": true, "leer": true, "actualizar": true, "eliminar": true},
  "compras": {"crear": true, "leer": true, "actualizar": true, "eliminar": true},
  "inventarios": {"crear": true, "leer": true, "actualizar": true, "eliminar": true},
  "usuarios": {"crear": true, "leer": true, "actualizar": true, "eliminar": true},
  "reportes": {"crear": true, "leer": true, "actualizar": true, "eliminar": true}
}'::jsonb, 1),

((SELECT tipo_id FROM tipos WHERE tipo_empresa = 'Ferreteria'), 'Cajero', 'Realiza cobros y cierre de caja', '{
  "ventas": {"crear": true, "leer": true, "actualizar": false, "eliminar": false},
  "compras": {"crear": false, "leer": false, "actualizar": false, "eliminar": false},
  "inventarios": {"crear": false, "leer": true, "actualizar": false, "eliminar": false},
  "usuarios": {"crear": false, "leer": false, "actualizar": false, "eliminar": false},
  "reportes": {"crear": false, "leer": true, "actualizar": false, "eliminar": false}
}'::jsonb, 2),

((SELECT tipo_id FROM tipos WHERE tipo_empresa = 'Ferreteria'), 'Vendedor Técnico', 'Asesora clientes sobre herramientas y materiales', '{
  "ventas": {"crear": true, "leer": true, "actualizar": true, "eliminar": false},
  "compras": {"crear": false, "leer": false, "actualizar": false, "eliminar": false},
  "inventarios": {"crear": false, "leer": true, "actualizar": false, "eliminar": false},
  "usuarios": {"crear": false, "leer": false, "actualizar": false, "eliminar": false},
  "reportes": {"crear": false, "leer": true, "actualizar": false, "eliminar": false}
}'::jsonb, 3),

((SELECT tipo_id FROM tipos WHERE tipo_empresa = 'Ferreteria'), 'Encargado de Proveeduría', 'Gestiona compras y control de stock', '{
  "ventas": {"crear": false, "leer": true, "actualizar": false, "eliminar": false},
  "compras": {"crear": true, "leer": true, "actualizar": true, "eliminar": true},
  "inventarios": {"crear": true, "leer": true, "actualizar": true, "eliminar": false},
  "usuarios": {"crear": false, "leer": false, "actualizar": false, "eliminar": false},
  "reportes": {"crear": false, "leer": true, "actualizar": false, "eliminar": false}
}'::jsonb, 4),

((SELECT tipo_id FROM tipos WHERE tipo_empresa = 'Ferreteria'), 'Asistente Administrativo', 'Maneja facturación y documentos de venta', '{
  "ventas": {"crear": false, "leer": true, "actualizar": true, "eliminar": false},
  "compras": {"crear": false, "leer": true, "actualizar": false, "eliminar": false},
  "inventarios": {"crear": false, "leer": true, "actualizar": false, "eliminar": false},
  "usuarios": {"crear": false, "leer": false, "actualizar": false, "eliminar": false},
  "reportes": {"crear": true, "leer": true, "actualizar": false, "eliminar": false}
}'::jsonb, 5);

-- Paso 5: Crear vista para obtener roles disponibles por empresa
-- Esta vista combina roles plantilla y roles personalizados
CREATE OR REPLACE VIEW vista_roles_empresa AS
SELECT 
  'plantilla' as tipo_rol,
  rp.plantilla_id as id_rol,
  rp.nombre_rol,
  rp.descripcion,
  rp.permisos,
  rp.es_predeterminado,
  rp.orden_visualizacion,
  te.tipo_empresa,
  te.tipo_id as tipo_empresa_id,
  NULL as empresa_id, -- Las plantillas no pertenecen a una empresa específica
  'activo' as estado,
  rp.fecha_creacion
FROM roles_plantilla rp
JOIN tipos_empresa te ON rp.tipo_empresa_id = te.tipo_id

UNION ALL

SELECT 
  'personalizado' as tipo_rol,
  r.rol_id as id_rol,
  r.nombre_rol,
  'Rol personalizado' as descripcion,
  r.permisos,
  r.es_predeterminado,
  999 as orden_visualizacion, -- Los roles personalizados van al final
  te.tipo_empresa,
  e.tipo_empresa_id,
  r.empresa_id,
  r.estado,
  r.fecha_creacion
FROM roles r
JOIN empresas e ON r.empresa_id = e.empresa_id
JOIN tipos_empresa te ON e.tipo_empresa_id = te.tipo_id
WHERE r.estado = 'activo';

-- Paso 6: Función para obtener roles disponibles para una empresa específica
CREATE OR REPLACE FUNCTION obtener_roles_disponibles_empresa(
  p_empresa_id UUID,
  p_limite_plan INT DEFAULT NULL
)
RETURNS TABLE(
  tipo_rol VARCHAR,
  id_rol INT,
  nombre_rol VARCHAR,
  descripcion TEXT,
  permisos JSONB,
  es_predeterminado BOOLEAN,
  orden_visualizacion INT,
  puede_usar BOOLEAN
) AS $$
DECLARE
  v_tipo_empresa_id INT;
  v_contador_plantilla INT := 0;
BEGIN
  -- Obtener tipo de empresa
  SELECT tipo_empresa_id INTO v_tipo_empresa_id 
  FROM empresas WHERE empresa_id = p_empresa_id;

  -- Retornar roles disponibles
  RETURN QUERY
  SELECT 
    vre.tipo_rol::VARCHAR,
    vre.id_rol,
    vre.nombre_rol::VARCHAR,
    vre.descripcion,
    vre.permisos,
    vre.es_predeterminado,
    vre.orden_visualizacion,
    CASE 
      WHEN vre.tipo_rol = 'personalizado' THEN true
      WHEN p_limite_plan IS NULL THEN true
      WHEN vre.tipo_rol = 'plantilla' AND vre.orden_visualizacion <= COALESCE(p_limite_plan, 999) THEN true
      ELSE false
    END as puede_usar
  FROM vista_roles_empresa vre
  WHERE (vre.tipo_empresa_id = v_tipo_empresa_id AND vre.empresa_id IS NULL) -- Plantillas del tipo correcto
     OR (vre.empresa_id = p_empresa_id) -- Roles personalizados de la empresa
  ORDER BY vre.orden_visualizacion, vre.nombre_rol;
END;
$$ LANGUAGE plpgsql;

-- Paso 7: Crear índices adicionales para optimizar rendimiento
CREATE INDEX IF NOT EXISTS idx_empresas_tipo_empresa ON empresas(tipo_empresa_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_empresa_rol ON usuarios(empresa_id, rol_id);

-- Paso 8: Comentarios en las tablas
COMMENT ON TABLE roles_plantilla IS 'Plantillas de roles predeterminados por tipo de empresa';
COMMENT ON COLUMN roles_plantilla.plantilla_id IS 'ID único de la plantilla de rol';
COMMENT ON COLUMN roles_plantilla.tipo_empresa_id IS 'Tipo de empresa al que pertenece esta plantilla';
COMMENT ON COLUMN roles_plantilla.orden_visualizacion IS 'Orden para mostrar roles según límite del plan';

COMMENT ON COLUMN roles.plantilla_id_origen IS 'Referencia a la plantilla de rol desde la cual se creó este rol personalizado (si aplica)';

COMMENT ON VIEW vista_roles_empresa IS 'Vista que combina roles plantilla y personalizados para facilitar consultas';
COMMENT ON FUNCTION obtener_roles_disponibles_empresa IS 'Función que retorna roles disponibles para una empresa según su tipo y plan';

-- ================================================================
-- VERIFICACIONES FINALES
-- ================================================================

-- Verificar que se crearon las plantillas correctamente
DO $$
DECLARE
  total_plantillas INT;
  total_tipos INT;
BEGIN
  SELECT COUNT(*) INTO total_plantillas FROM roles_plantilla;
  SELECT COUNT(*) INTO total_tipos FROM tipos_empresa;
  
  RAISE NOTICE 'Migración completada:';
  RAISE NOTICE '- Plantillas de roles creadas: %', total_plantillas;
  RAISE NOTICE '- Tipos de empresa: %', total_tipos;
  RAISE NOTICE '- Se esperan % plantillas (5 roles × % tipos)', (total_tipos * 5), total_tipos;
  
  IF total_plantillas != (total_tipos * 5) THEN
    RAISE WARNING 'El número de plantillas no coincide con lo esperado. Verificar datos.';
  END IF;
END $$;