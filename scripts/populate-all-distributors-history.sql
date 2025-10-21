-- Asegurar que todas las distribuidoras tengan historial de órdenes de compra

-- Primero, verificar los IDs de las distribuidoras
-- Asumiendo que las distribuidoras principales son:
-- CBN, Distribuidora Betalio, Miraflores Licores, Representaciones EMISA, etc.

-- Insertar órdenes de compra para todas las distribuidoras
-- Vamos a crear 2-3 órdenes por distribuidora

INSERT INTO purchase_orders (order_number, provider_id, order_date, delivery_date, status, total_amount, notes)
VALUES
-- Distribuidora Betalio (ID 2)
('PO-2025-011', 2, '2025-01-15', '2025-01-22', 'received', 12500.00, 'Orden de bebidas premium'),
('PO-2025-012', 2, '2025-02-01', '2025-02-08', 'pending', 8900.00, 'Reposición mensual'),

-- Miraflores Licores (ID 3)
('PO-2025-013', 3, '2025-01-18', '2025-01-25', 'received', 15300.00, 'Vinos y licores importados'),
('PO-2025-014', 3, '2025-02-05', NULL, 'pending', 11200.00, 'Pedido especial clientes'),

-- Representaciones EMISA (ID 4)
('PO-2025-015', 4, '2025-01-20', '2025-01-27', 'received', 9800.00, 'Whisky y cognac'),
('PO-2025-016', 4, '2025-02-10', NULL, 'pending', 13400.00, 'Productos premium'),

-- Licorería La Paz (ID 5)
('PO-2025-017', 5, '2025-01-22', '2025-01-29', 'received', 7600.00, 'Bebidas nacionales'),
('PO-2025-018', 5, '2025-02-12', NULL, 'pending', 9200.00, 'Restock general'),

-- Importadora Boliviana (ID 6)
('PO-2025-019', 6, '2025-01-25', '2025-02-01', 'received', 18500.00, 'Licores importados premium'),
('PO-2025-020', 6, '2025-02-15', NULL, 'pending', 14800.00, 'Orden especial eventos'),

-- Distribuidora Santa Cruz (ID 7)
('PO-2025-021', 7, '2025-01-28', '2025-02-04', 'received', 11200.00, 'Cervezas y bebidas'),
('PO-2025-022', 7, '2025-02-18', NULL, 'pending', 8900.00, 'Pedido mensual'),

-- Licores del Norte (ID 8)
('PO-2025-023', 8, '2025-02-01', '2025-02-08', 'received', 10500.00, 'Vinos y destilados'),
('PO-2025-024', 8, '2025-02-20', NULL, 'pending', 12300.00, 'Orden corporativa'),

-- Comercial Andina (ID 9)
('PO-2025-025', 9, '2025-02-03', '2025-02-10', 'received', 13700.00, 'Bebidas premium'),
('PO-2025-026', 9, '2025-02-22', NULL, 'pending', 9800.00, 'Reposición stock'),

-- Distribuciones Pacífico (ID 10)
('PO-2025-027', 10, '2025-02-05', '2025-02-12', 'received', 16200.00, 'Licores y vinos'),
('PO-2025-028', 10, '2025-02-25', NULL, 'pending', 11900.00, 'Pedido especial'),

-- Licorería El Porvenir (ID 11)
('PO-2025-029', 11, '2025-02-08', '2025-02-15', 'received', 8700.00, 'Bebidas populares'),
('PO-2025-030', 11, '2025-02-28', NULL, 'pending', 10400.00, 'Stock regular'),

-- Importaciones Del Sur (ID 12)
('PO-2025-031', 12, '2025-02-10', '2025-02-17', 'received', 19500.00, 'Importación directa'),
('PO-2025-032', 12, '2025-03-01', NULL, 'pending', 15600.00, 'Productos exclusivos'),

-- Distribuidora Oriente (ID 13)
('PO-2025-033', 13, '2025-02-12', '2025-02-19', 'received', 12800.00, 'Licores regionales'),
('PO-2025-034', 13, '2025-03-03', NULL, 'pending', 9500.00, 'Reposición mensual'),

-- Comercial Tropical (ID 14)
('PO-2025-035', 14, '2025-02-14', '2025-02-21', 'received', 11400.00, 'Bebidas tropicales'),
('PO-2025-036', 14, '2025-03-05', NULL, 'pending', 13200.00, 'Pedido verano'),

-- Licores Premium SA (ID 15)
('PO-2025-037', 15, '2025-02-16', '2025-02-23', 'received', 22500.00, 'Línea premium exclusiva'),
('PO-2025-038', 15, '2025-03-08', NULL, 'pending', 18900.00, 'Colección especial'),

-- Distribuidora Valle Alto (ID 16)
('PO-2025-039', 16, '2025-02-18', '2025-02-25', 'received', 9900.00, 'Productos locales'),
('PO-2025-040', 16, '2025-03-10', NULL, 'pending', 11700.00, 'Stock mensual'),

-- Importadora Cosmos (ID 17)
('PO-2025-041', 17, '2025-02-20', '2025-02-27', 'received', 17800.00, 'Importaciones europeas'),
('PO-2025-042', 17, '2025-03-12', NULL, 'pending', 14300.00, 'Vinos premium'),

-- Licorería Central (ID 18)
('PO-2025-043', 18, '2025-02-22', '2025-03-01', 'received', 10200.00, 'Bebidas variadas'),
('PO-2025-044', 18, '2025-03-15', NULL, 'pending', 12800.00, 'Pedido regular'),

-- Distribuciones Altiplano (ID 19)
('PO-2025-045', 19, '2025-02-24', '2025-03-03', 'received', 13500.00, 'Licores andinos'),
('PO-2025-046', 19, '2025-03-18', NULL, 'pending', 11100.00, 'Reposición stock'),

-- Comercial Horizonte (ID 20)
('PO-2025-047', 20, '2025-02-26', '2025-03-05', 'received', 15700.00, 'Bebidas premium'),
('PO-2025-048', 20, '2025-03-20', NULL, 'pending', 13900.00, 'Orden trimestral'),

-- Licores y Más (ID 21)
('PO-2025-049', 21, '2025-02-28', '2025-03-07', 'received', 11800.00, 'Variedad general'),
('PO-2025-050', 21, '2025-03-22', NULL, 'pending', 10600.00, 'Pedido mensual')

ON CONFLICT (order_number) DO NOTHING;

-- Agregar items a las órdenes (ejemplo con algunos productos)
INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_price, total)
SELECT 
  po.id,
  p.id,
  FLOOR(RANDOM() * 50 + 10)::int as quantity,
  p.price * 0.8 as unit_price,
  (FLOOR(RANDOM() * 50 + 10)::int * p.price * 0.8) as total
FROM purchase_orders po
CROSS JOIN LATERAL (
  SELECT id, price FROM products ORDER BY RANDOM() LIMIT 3
) p
WHERE po.order_number LIKE 'PO-2025-0%'
  AND NOT EXISTS (
    SELECT 1 FROM purchase_order_items poi WHERE poi.purchase_order_id = po.id
  )
LIMIT 150;

-- Verificar resultados
SELECT 
  p.name as distributor,
  COUNT(po.id) as order_count,
  SUM(CASE WHEN po.status = 'received' THEN 1 ELSE 0 END) as received,
  SUM(CASE WHEN po.status = 'pending' THEN 1 ELSE 0 END) as pending,
  COALESCE(SUM(po.total_amount), 0)::numeric(10,2) as total_purchases
FROM providers p
LEFT JOIN purchase_orders po ON p.id = po.provider_id
GROUP BY p.id, p.name
ORDER BY p.name;
