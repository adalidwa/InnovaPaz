-- ================================================================
-- MIGRACIÓN: Actualizar tabla usuarios para soportar plantillas
-- ================================================================

-- Opción 1: Agregar columna para referenciar plantillas directamente
ALTER TABLE usuarios 
ADD COLUMN plantilla_rol_id INT REFERENCES roles_plantilla(plantilla_id) ON DELETE SET NULL;

-- Crear índice para la nueva relación
CREATE INDEX IF NOT EXISTS idx_usuarios_plantilla_rol ON usuarios(plantilla_rol_id);

-- Modificar la restricción para que rol_id sea opcional cuando se usa plantilla_rol_id
ALTER TABLE usuarios 
ALTER COLUMN rol_id DROP NOT NULL;

-- Agregar constraint para asegurar que al menos uno de los dos campos esté presente
ALTER TABLE usuarios 
ADD CONSTRAINT check_usuario_tiene_rol 
CHECK (
  (rol_id IS NOT NULL AND plantilla_rol_id IS NULL) OR 
  (rol_id IS NULL AND plantilla_rol_id IS NOT NULL)
);

-- Crear vista para obtener información completa del usuario con rol
CREATE OR REPLACE VIEW vista_usuarios_completa AS
SELECT 
  u.uid,
  u.empresa_id,
  u.nombre_completo,
  u.email,
  u.estado as estado_usuario,
  u.preferencias,
  u.fecha_creacion,
  u.avatar_url,
  u.avatar_public_id,
  
  -- Información del rol (personalizado o plantilla)
  COALESCE(r.nombre_rol, rp.nombre_rol) as nombre_rol,
  COALESCE(r.permisos, rp.permisos) as permisos,
  COALESCE(r.estado, 'activo') as estado_rol,
  
  -- Indicar si es rol personalizado o plantilla
  CASE 
    WHEN u.rol_id IS NOT NULL THEN 'personalizado'
    WHEN u.plantilla_rol_id IS NOT NULL THEN 'plantilla'
    ELSE 'sin_rol'
  END as tipo_rol,
  
  -- IDs para referencia
  u.rol_id,
  u.plantilla_rol_id,
  
  -- Información de la empresa
  e.nombre as nombre_empresa,
  te.tipo_empresa

FROM usuarios u
LEFT JOIN roles r ON u.rol_id = r.rol_id
LEFT JOIN roles_plantilla rp ON u.plantilla_rol_id = rp.plantilla_id
LEFT JOIN empresas e ON u.empresa_id = e.empresa_id
LEFT JOIN tipos_empresa te ON e.tipo_empresa_id = te.tipo_id;

-- Función para obtener usuario con rol completo
CREATE OR REPLACE FUNCTION obtener_usuario_con_rol(p_uid VARCHAR)
RETURNS TABLE(
  uid VARCHAR,
  empresa_id UUID,
  nombre_completo VARCHAR,
  email VARCHAR,
  estado_usuario VARCHAR,
  nombre_rol VARCHAR,
  permisos JSONB,
  tipo_rol VARCHAR,
  nombre_empresa VARCHAR,
  tipo_empresa VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    vuc.uid,
    vuc.empresa_id,
    vuc.nombre_completo,
    vuc.email,
    vuc.estado_usuario,
    vuc.nombre_rol,
    vuc.permisos,
    vuc.tipo_rol,
    vuc.nombre_empresa,
    vuc.tipo_empresa
  FROM vista_usuarios_completa vuc
  WHERE vuc.uid = p_uid;
END;
$$ LANGUAGE plpgsql;

-- Comentarios
COMMENT ON COLUMN usuarios.plantilla_rol_id IS 'Referencia a rol de plantilla (alternativo a rol_id)';
COMMENT ON VIEW vista_usuarios_completa IS 'Vista que combina información de usuarios con roles personalizados y plantillas';
COMMENT ON FUNCTION obtener_usuario_con_rol IS 'Función para obtener usuario con información completa de rol';

-- Verificar la nueva estructura
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
ORDER BY ordinal_position;