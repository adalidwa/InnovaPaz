const pool = require('../db');

// Obtener todas las categorías principales (padres)
const getCategories = async (req, res, next) => {
  try {
    const categoriasPadre = await pool.query(
      'SELECT categoria_id, nombre_categoria FROM categorias WHERE estado = TRUE AND categoria_padre_id IS NULL ORDER BY nombre_categoria ASC'
    );
    res.json({ success: true, categories: categoriasPadre.rows });
  } catch (error) {
    console.error('Error al obtener categorías principales:', error);
    next(error);
  }
};

// Obtener subcategorías por categoría padre
const getSubcategories = async (req, res, next) => {
  try {
    const { parentId } = req.params;
    const subcategorias = await pool.query(
      'SELECT categoria_id, nombre_categoria FROM categorias WHERE estado = TRUE AND categoria_padre_id = $1 ORDER BY nombre_categoria ASC',
      [parentId]
    );
    res.json({ success: true, subcategories: subcategorias.rows });
  } catch (error) {
    console.error('Error al obtener subcategorías:', error);
    next(error);
  }
};

// Obtener todas las marcas
const getBrands = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT marca_id, nombre FROM marca ORDER BY nombre ASC');
    res.json({ success: true, brands: result.rows });
  } catch (error) {
    console.error('Error al obtener marcas:', error);
    next(error);
  }
};

// Obtener atributos específicos por categoría
const getAttributesByCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const atributos = await pool.query(
      `SELECT a.atributo_id, a.nombre, a.tipo_atributo, a.unidad_medida, a.es_obligatorio 
       FROM atributos a
       INNER JOIN categoria_atributo ca ON a.atributo_id = ca.atributo_id
       WHERE ca.categoria_id = $1 
       ORDER BY a.nombre ASC`,
      [categoryId]
    );
    res.json({ success: true, attributes: atributos.rows });
  } catch (error) {
    console.error('Error al obtener atributos por categoría:', error);
    next(error);
  }
};

module.exports = {
  getCategories,
  getSubcategories,
  getBrands,
  getAttributesByCategory,
};
