-- Script para crear usuario de prueba admin@innovapaz.com
-- Ejecutar en la base de datos PostgreSQL de producción

INSERT INTO usuarios (
    uid, 
    email, 
    nombre_completo, 
    password, 
    empresa_id, 
    rol_id, 
    estado, 
    fecha_creacion
) VALUES (
    'admin-test-uid-123',
    'admin@innovapaz.com',
    'Administrador de Prueba',
    'admin123',
    1, -- Asumiendo que existe empresa_id = 1
    1, -- Asumiendo que existe rol_id = 1 (Administrador)
    'activo',
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Verificar que se creó correctamente
SELECT uid, email, nombre_completo, empresa_id, rol_id, estado 
FROM usuarios 
WHERE email = 'admin@innovapaz.com';