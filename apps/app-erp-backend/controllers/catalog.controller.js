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

module.exports = {
  getCategories,
  getSubcategories,
  getBrands,
};
