-- =====================================================
-- MIGRACIÓN: Agregar plantilla_id_origen a tabla roles
-- =====================================================
-- Este script agrega la columna plantilla_id_origen a la tabla roles
-- para relacionar roles personalizados con sus plantillas de origen

-- Verificar y agregar columna plantilla_id_origen si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'roles' 
        AND column_name = 'plantilla_id_origen'
    ) THEN
        ALTER TABLE roles ADD COLUMN plantilla_id_origen INTEGER;
        
        -- Agregar foreign key constraint
        ALTER TABLE roles 
        ADD CONSTRAINT fk_roles_plantilla_origen 
        FOREIGN KEY (plantilla_id_origen) 
        REFERENCES roles_plantilla(plantilla_id);
        
        RAISE NOTICE 'Columna plantilla_id_origen agregada exitosamente a la tabla roles';
    ELSE
        RAISE NOTICE 'La columna plantilla_id_origen ya existe en la tabla roles';
    END IF;
END $$;

-- Crear índice para mejorar performance en consultas
CREATE INDEX IF NOT EXISTS idx_roles_plantilla_origen 
ON roles(plantilla_id_origen);

-- Mostrar estructura actualizada de la tabla roles
\d+ roles;

COMMIT;