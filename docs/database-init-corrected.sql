-- ==========================================================
-- 🚀 SCRIPT CORREGIDO PARA INICIALIZAR BASE DE DATOS
-- 3 TIPOS DE EMPRESA: MINIMARKET, LICORERÍA, FERRETERÍA
-- ==========================================================

-- 1. Insertar tipos de empresa
INSERT INTO tipo_empresa (tipo_empresa) VALUES 
('Minimarket'),
('Licoreria'),
('Ferretería');

-- 2. Insertar planes con los límites exactos proporcionados
INSERT INTO planes (nombre_plan, precio_mensual, limites) VALUES 
('Plan Básico', 10, '{"miembros": 2, "productos": 150, "transacciones": 250}'),
('Plan Estándar', 50, '{"miembros": 10, "productos": 5000, "transacciones": 10000}'),
('Plan Premium', 90, '{"miembros": -1, "productos": -1, "transacciones": -1}');

-- 3. Insertar estados de producto
INSERT INTO estado_producto (nombre, descripcion) VALUES 
('Activo', 'Producto disponible para venta'),
('Inactivo', 'Producto no disponible');

-- ==========================================================
-- 🍺 DATOS PARA EMPRESA DE TIPO "LICORERÍA"
-- ==========================================================

-- Insertar empresa tipo Licorería
INSERT INTO empresas (nombre, tipo_empresa_id, plan_id, estado_suscripcion) 
VALUES ('Licoreria Los Angeles', 2, 2, 'activo');

-- Insertar marcas para licorería
INSERT INTO marca (nombre, descripcion) VALUES
('Johnnie Walker', 'Whisky escocés de renombre mundial, ideal para degustación y cocteles'),
('Casa Real', 'Ron premium de origen latinoamericano, suave y aromático'),
('Coca Cola Company', 'Bebidas gaseosas carbonatadas, clásicas y refrescantes'),
('Cañerito', 'Ron artesanal con sabor intenso y tradicional'),
('Kaiman', 'Ron de alta calidad, ideal para coctelería y consumo directo'),
('PEPSI', 'Bebidas gaseosas carbonatadas, refrescantes y con sabor característico');

-- Insertar categorías para licorería
INSERT INTO categorias (
  nombre_categoria,
  categoria_padre_id,
  nivel,
  estado,
  tipo_empresa_id
) VALUES
-- Categoría principal Bebidas Alcohólicas
('Bebidas Alcohólicas', NULL, 1, TRUE, 2),
('Cervezas', 1, 2, TRUE, 2),
('Licores', 1, 2, TRUE, 2),
('Vinos', 1, 2, TRUE, 2),

-- Categoría principal Bebidas Gaseosas
('Bebidas Gaseosas', NULL, 1, TRUE, 2),
('Coca Cola', 5, 2, TRUE, 2),
('Pepsi', 5, 2, TRUE, 2),
('Fanta', 5, 2, TRUE, 2),
('Sprite', 5, 2, TRUE, 2),
('Inca Kola', 5, 2, TRUE, 2);

-- Insertar atributos principales (SOLO UNA VEZ)
INSERT INTO atributos (nombre, tipo_atributo, unidad_medida, es_obligatorio) VALUES
('Grado alcohólico', 'número', '%', TRUE),
('Volumen', 'número', 'ml', TRUE),
('País de origen', 'texto', NULL, FALSE),
('Tipo de bebida', 'texto', NULL, TRUE),
('Fecha de vencimiento', 'fecha', NULL, FALSE),
('Lote', 'texto', NULL, FALSE),
('Peso neto', 'número', 'g', FALSE),
('Marca', 'texto', NULL, TRUE),
('Temperatura de almacenamiento', 'número', '°C', FALSE),
('Tipo de envase', 'texto', NULL, FALSE),
('Material', 'texto', NULL, FALSE),
('Color', 'texto', NULL, FALSE),
('Tamaño', 'texto', NULL, FALSE),
('Voltaje', 'número', 'V', FALSE),
('Potencia', 'número', 'W', FALSE);

-- Relacionar categorías de licorería con atributos
-- Para categorías de bebidas alcohólicas
INSERT INTO categoria_atributo (categoria_id, atributo_id, es_predeterminado) 
SELECT c.categoria_id, a.atributo_id, TRUE
FROM categorias c
CROSS JOIN atributos a
WHERE c.nombre_categoria IN ('Cervezas', 'Licores', 'Vinos')
  AND c.estado = TRUE
  AND a.nombre IN ('Grado alcohólico', 'Volumen', 'País de origen', 'Tipo de bebida', 'Fecha de vencimiento', 'Lote');

-- Para categorías de bebidas gaseosas
INSERT INTO categoria_atributo (categoria_id, atributo_id, es_predeterminado) 
SELECT c.categoria_id, a.atributo_id, TRUE
FROM categorias c
CROSS JOIN atributos a
WHERE c.nombre_categoria IN ('Coca Cola', 'Pepsi', 'Fanta', 'Sprite', 'Inca Kola')
  AND c.estado = TRUE
  AND a.nombre IN ('Volumen', 'Fecha de vencimiento', 'Lote');

-- ==========================================================
-- 🛒 DATOS PARA EMPRESA DE TIPO "MINIMARKET"
-- ==========================================================

-- Insertar empresa tipo Minimarket
INSERT INTO empresas (nombre, tipo_empresa_id, plan_id, estado_suscripcion)
VALUES ('Minimarket San Miguel', 1, 1, 'activo');

-- Insertar marcas comunes en Minimarket
INSERT INTO marca (nombre, descripcion) VALUES
('Nestlé', 'Productos alimenticios y lácteos de amplia variedad'),
('Pil', 'Lácteos bolivianos: leche, yogurt, quesos y mantequilla'),
('Fino', 'Aceites comestibles y productos derivados'),
('Arcor', 'Golosinas, snacks y productos de panadería'),
('Sobao', 'Panificados, galletas y tortas frescas'),
('La Suprema', 'Productos de limpieza y cuidado del hogar');

-- Insertar categorías específicas para Minimarket
INSERT INTO categorias (
  nombre_categoria,
  categoria_padre_id,
  nivel,
  estado,
  tipo_empresa_id
) VALUES
-- Categoría principal Alimentos
('Alimentos', NULL, 1, TRUE, 1),
('Abarrotes', 11, 2, TRUE, 1),
('Snacks', 11, 2, TRUE, 1),
('Galletas', 11, 2, TRUE, 1),
('Cereales', 11, 2, TRUE, 1),

-- Categoría principal Lácteos
('Lácteos', NULL, 1, TRUE, 1),
('Leche', 16, 2, TRUE, 1),
('Yogurt', 16, 2, TRUE, 1),
('Quesos', 16, 2, TRUE, 1),

-- Categoría principal Bebidas
('Bebidas', NULL, 1, TRUE, 1),
('Gaseosas', 20, 2, TRUE, 1),
('Jugos', 20, 2, TRUE, 1),
('Agua', 20, 2, TRUE, 1),

-- Categoría principal Limpieza
('Limpieza', NULL, 1, TRUE, 1),
('Detergentes', 24, 2, TRUE, 1),
('Desinfectantes', 24, 2, TRUE, 1),
('Suavizantes', 24, 2, TRUE, 1);

-- Relacionar categorías de minimarket con atributos
-- Alimentos y Lácteos
INSERT INTO categoria_atributo (categoria_id, atributo_id, es_predeterminado)
SELECT c.categoria_id, a.atributo_id, TRUE
FROM categorias c
CROSS JOIN atributos a
WHERE c.nombre_categoria IN ('Abarrotes', 'Snacks', 'Galletas', 'Cereales', 'Leche', 'Yogurt', 'Quesos')
  AND a.nombre IN ('Fecha de vencimiento', 'Peso neto', 'Lote', 'Marca');

-- Bebidas
INSERT INTO categoria_atributo (categoria_id, atributo_id, es_predeterminado)
SELECT c.categoria_id, a.atributo_id, TRUE
FROM categorias c
CROSS JOIN atributos a
WHERE c.nombre_categoria IN ('Gaseosas', 'Jugos', 'Agua')
  AND a.nombre IN ('Volumen', 'Fecha de vencimiento', 'Tipo de envase', 'Marca', 'Lote');

-- Limpieza
INSERT INTO categoria_atributo (categoria_id, atributo_id, es_predeterminado)
SELECT c.categoria_id, a.atributo_id, TRUE
FROM categorias c
CROSS JOIN atributos a
WHERE c.nombre_categoria IN ('Detergentes', 'Desinfectantes', 'Suavizantes')
  AND a.nombre IN ('Volumen', 'Marca', 'Lote', 'Tipo de envase');

-- ==========================================================
-- 🔧 DATOS PARA EMPRESA DE TIPO "FERRETERÍA"
-- ==========================================================

-- Insertar empresa Ferretería
INSERT INTO empresas (nombre, tipo_empresa_id, plan_id, estado_suscripcion)
VALUES ('Ferretería El Tornillo Feliz', 3, 2, 'activo');

-- Insertar marcas comunes de ferretería
INSERT INTO marca (nombre, descripcion) VALUES
('Truper', 'Herramientas manuales y eléctricas de uso profesional'),
('Stanley', 'Herramientas y accesorios de alta calidad'),
('Bosch', 'Herramientas eléctricas y productos industriales'),
('Makita', 'Línea profesional de herramientas eléctricas'),
('DeWalt', 'Herramientas de construcción y carpintería'),
('Sika', 'Productos químicos para construcción y selladores');

-- Insertar categorías para ferretería
INSERT INTO categorias (
  nombre_categoria,
  categoria_padre_id,
  nivel,
  estado,
  tipo_empresa_id
) VALUES
-- Nivel 1: Principales
('Herramientas', NULL, 1, TRUE, 3),
('Construcción', NULL, 1, TRUE, 3),
('Pinturas', NULL, 1, TRUE, 3),
('Electricidad', NULL, 1, TRUE, 3),
('Plomería', NULL, 1, TRUE, 3),

-- Nivel 2: Subcategorías (ajustando IDs correctos)
('Herramientas Manuales', 28, 2, TRUE, 3),
('Herramientas Eléctricas', 28, 2, TRUE, 3),
('Cables y Conductores', 31, 2, TRUE, 3),
('Tuberías y Accesorios', 32, 2, TRUE, 3),
('Selladores y Adhesivos', 30, 2, TRUE, 3),
('Cementos y Morteros', 29, 2, TRUE, 3);

-- Relacionar categorías de ferretería con atributos
-- Herramientas manuales
INSERT INTO categoria_atributo (categoria_id, atributo_id, es_predeterminado)
SELECT c.categoria_id, a.atributo_id, TRUE
FROM categorias c
CROSS JOIN atributos a
WHERE c.nombre_categoria = 'Herramientas Manuales'
  AND a.nombre IN ('Marca', 'Material', 'Peso neto', 'Tamaño', 'Color');

-- Herramientas eléctricas
INSERT INTO categoria_atributo (categoria_id, atributo_id, es_predeterminado)
SELECT c.categoria_id, a.atributo_id, TRUE
FROM categorias c
CROSS JOIN atributos a
WHERE c.nombre_categoria = 'Herramientas Eléctricas'
  AND a.nombre IN ('Marca', 'Peso neto', 'Tamaño', 'Voltaje', 'Potencia');

-- Selladores y adhesivos
INSERT INTO categoria_atributo (categoria_id, atributo_id, es_predeterminado)
SELECT c.categoria_id, a.atributo_id, TRUE
FROM categorias c
CROSS JOIN atributos a
WHERE c.nombre_categoria = 'Selladores y Adhesivos'
  AND a.nombre IN ('Marca', 'Color', 'Peso neto', 'Fecha de vencimiento');

-- Tuberías y accesorios
INSERT INTO categoria_atributo (categoria_id, atributo_id, es_predeterminado)
SELECT c.categoria_id, a.atributo_id, TRUE
FROM categorias c
CROSS JOIN atributos a
WHERE c.nombre_categoria = 'Tuberías y Accesorios'
  AND a.nombre IN ('Marca', 'Material', 'Tamaño', 'Peso neto');

-- Cementos y morteros
INSERT INTO categoria_atributo (categoria_id, atributo_id, es_predeterminado)
SELECT c.categoria_id, a.atributo_id, TRUE
FROM categorias c
CROSS JOIN atributos a
WHERE c.nombre_categoria = 'Cementos y Morteros'
  AND a.nombre IN ('Marca', 'Peso neto', 'Color');

-- ==========================================================
-- ✅ VERIFICACIÓN FINAL
-- ==========================================================

-- Verificar que las relaciones se crearon correctamente
SELECT 
  c.nombre_categoria AS categoria,
  a.nombre AS atributo,
  a.tipo_atributo,
  a.unidad_medida,
  a.es_obligatorio,
  ca.es_predeterminado,
  te.tipo_empresa AS tipo_empresa
FROM categoria_atributo ca
JOIN categorias c ON c.categoria_id = ca.categoria_id
JOIN atributos a ON a.atributo_id = ca.atributo_id
JOIN tipo_empresa te ON te.tipo_empresa_id = c.tipo_empresa_id
ORDER BY te.tipo_empresa, c.nombre_categoria, a.nombre;

-- Verificar empresas creadas
SELECT 
  e.nombre AS empresa,
  te.tipo_empresa,
  p.nombre_plan,
  p.precio_mensual,
  e.estado_suscripcion
FROM empresas e
JOIN tipo_empresa te ON te.tipo_empresa_id = e.tipo_empresa_id
JOIN planes p ON p.plan_id = e.plan_id;

-- Contar categorías por tipo de empresa
SELECT 
  te.tipo_empresa,
  COUNT(*) AS total_categorias,
  COUNT(CASE WHEN c.nivel = 1 THEN 1 END) AS categorias_principales,
  COUNT(CASE WHEN c.nivel = 2 THEN 1 END) AS subcategorias
FROM categorias c
JOIN tipo_empresa te ON te.tipo_empresa_id = c.tipo_empresa_id
GROUP BY te.tipo_empresa
ORDER BY te.tipo_empresa;