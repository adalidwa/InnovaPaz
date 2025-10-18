-- ================================================================
-- TABLA DE INVITACIONES
-- ================================================================
-- Almacena las invitaciones enviadas a nuevos usuarios

CREATE TABLE IF NOT EXISTS invitaciones (
  invitacion_id SERIAL PRIMARY KEY,
  empresa_id UUID NOT NULL REFERENCES empresas(empresa_id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  rol_id INTEGER NOT NULL REFERENCES roles(rol_id) ON DELETE CASCADE,
  invitado_por VARCHAR(100) NOT NULL REFERENCES usuarios(uid) ON DELETE SET NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  estado VARCHAR(50) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aceptada', 'expirada', 'cancelada')),
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  fecha_expiracion TIMESTAMP NOT NULL,
  fecha_aceptacion TIMESTAMP,
  CONSTRAINT unique_pending_invitation UNIQUE (empresa_id, email, estado)
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_invitaciones_token ON invitaciones(token);
CREATE INDEX IF NOT EXISTS idx_invitaciones_email ON invitaciones(email);
CREATE INDEX IF NOT EXISTS idx_invitaciones_empresa ON invitaciones(empresa_id);
CREATE INDEX IF NOT EXISTS idx_invitaciones_estado ON invitaciones(estado);

-- Comentarios para documentación
COMMENT ON TABLE invitaciones IS 'Almacena invitaciones enviadas a nuevos usuarios para unirse a una empresa';
COMMENT ON COLUMN invitaciones.token IS 'Token único para aceptar la invitación (usado en el link del correo)';
COMMENT ON COLUMN invitaciones.estado IS 'Estado de la invitación: pendiente, aceptada, expirada, cancelada';
COMMENT ON COLUMN invitaciones.fecha_expiracion IS 'Fecha en que expira la invitación (típicamente 7 días después de creada)';

-- Trigger para limpiar invitaciones expiradas automáticamente
CREATE OR REPLACE FUNCTION actualizar_invitaciones_expiradas()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE invitaciones
  SET estado = 'expirada'
  WHERE estado = 'pendiente'
    AND fecha_expiracion < NOW();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_invitaciones_expiradas
  AFTER INSERT OR UPDATE ON invitaciones
  FOR EACH STATEMENT
  EXECUTE FUNCTION actualizar_invitaciones_expiradas();

-- Consulta de ejemplo para ver invitaciones pendientes
-- SELECT 
--   i.invitacion_id,
--   i.email,
--   e.nombre as empresa,
--   r.nombre_rol,
--   u.nombre as invitado_por,
--   i.fecha_creacion,
--   i.fecha_expiracion,
--   i.estado
-- FROM invitaciones i
-- JOIN empresas e ON i.empresa_id = e.empresa_id
-- JOIN roles r ON i.rol_id = r.rol_id
-- JOIN usuarios u ON i.invitado_por = u.usuario_id
-- WHERE i.estado = 'pendiente'
-- ORDER BY i.fecha_creacion DESC;
