-- ==============================================
--   COMPLETAR APROVISIONAMIENTO PARA PRODUCTOS CRÍTICOS
--   Basado en los productos existentes en tu BD
-- ==============================================

-- Productos críticos (stock actual < stock mínimo)
INSERT INTO aprovisionamiento (producto_id, stock_actual, stock_minimo, stock_maximo, estado) VALUES 
-- EMPRESA MARCO (Ferretería) - d03e9c21-1d2c-459f-ab01-4dc44b43bc47
(4, 10, 15, 40, 'critico'),    -- Amoladora: stock 10 < mínimo 15

-- EMPRESA MELONES (Minimarket) - ebc8d621-58ad-4951-a770-160010b8f7d0  
(9, 200, 150, 300, 'bajo'),    -- Pan Blanco: stock 200 > mínimo 150 pero cerca del límite
(11, 90, 100, 200, 'critico'), -- Leche PIL: stock 90 < mínimo 100
(13, 80, 90, 150, 'critico'),  -- Huevos: stock 80 < mínimo 90

-- EMPRESA HOLA (Licorería) - 5dc644b0-3ce9-4c41-a83d-c7da2962214d
(21, 40, 50, 100, 'critico'),  -- Queso Criollo: stock 40 < mínimo 50
(19, 59, 70, 120, 'critico'),  -- Mantequilla: stock 59 < mínimo 70
(25, 50, 60, 120, 'critico'),  -- Café Molido: stock 50 < mínimo 60

-- Productos con stock normal (para referencia)
(2, 18, 10, 50, 'normal'),     -- Martillo: stock normal
(3, 20, 15, 60, 'normal'),     -- Alicate: stock normal
(5, 100, 80, 200, 'normal'),   -- Coca Cola 500ml: stock normal
(6, 80, 60, 150, 'normal'),    -- Coca Cola 2L: stock normal
(8, 60, 40, 120, 'normal'),    -- Aceite Ideal: stock normal
(15, 120, 100, 250, 'normal'), -- Sprite: stock normal
(17, 150, 120, 300, 'normal'), -- Fideos: stock normal
(22, 70, 50, 150, 'normal');   -- Yogurt: stock normal

-- Actualizar el aprovisionamiento existente si es necesario
UPDATE aprovisionamiento 
SET estado = CASE 
    WHEN stock_actual < stock_minimo THEN 'critico'
    WHEN stock_actual <= (stock_minimo * 1.2) THEN 'bajo'
    ELSE 'normal'
END
WHERE aprovisionamiento_id = 1;

-- ==============================================
--                   RESUMEN
-- ==============================================

/*
PRODUCTOS CRÍTICOS CONFIGURADOS:

🔧 FERRETERÍA MARCO:
   - Taladro (ID: 1): Stock 15 < Mínimo 20 → CRÍTICO
   - Amoladora (ID: 4): Stock 10 < Mínimo 15 → CRÍTICO

🛒 MINIMARKET MELONES:
   - Leche PIL (ID: 11): Stock 90 < Mínimo 100 → CRÍTICO
   - Huevos (ID: 13): Stock 80 < Mínimo 90 → CRÍTICO
   - Pan Blanco (ID: 9): Stock 200 vs Mínimo 150 → BAJO

🍺 LICORERÍA HOLA:
   - Queso Criollo (ID: 21): Stock 40 < Mínimo 50 → CRÍTICO
   - Mantequilla (ID: 19): Stock 59 < Mínimo 70 → CRÍTICO
   - Café Molido (ID: 25): Stock 50 < Mínimo 60 → CRÍTICO

TOTAL: 6 productos críticos + 1 producto bajo
*/