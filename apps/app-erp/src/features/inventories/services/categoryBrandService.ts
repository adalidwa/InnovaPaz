// Servicio para obtener categorías y marcas desde el backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export interface Category {
  categoria_id: number;
  nombre_categoria: string;
}

export interface Subcategory {
  categoria_id: number;
  nombre_categoria: string;
}

export interface Brand {
  marca_id: number;
  nombre: string;
}

export interface Attribute {
  atributo_id: number;
  nombre: string;
  tipo_atributo: 'texto' | 'número' | 'fecha' | 'selección';
  unidad_medida?: string;
  es_obligatorio: boolean;
}

export const categoryBrandService = {
  async getCategories(): Promise<Category[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories`);
      if (!res.ok) throw new Error('Error al obtener categorías');
      const data = await res.json();
      // Asume que el backend responde con { success, categories }
      return data.categories || [];
    } catch (err) {
      console.error('Error getCategories:', err);
      return [];
    }
  },

  async getSubcategories(parentCategoryId: number): Promise<Subcategory[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories/${parentCategoryId}/subcategories`);
      if (!res.ok) throw new Error('Error al obtener subcategorías');
      const data = await res.json();
      // Asume que el backend responde con { success, subcategories }
      return data.subcategories || [];
    } catch (err) {
      console.error('Error getSubcategories:', err);
      return [];
    }
  },

  async getBrands(): Promise<Brand[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/brands`);
      if (!res.ok) throw new Error('Error al obtener marcas');
      const data = await res.json();
      // Asume que el backend responde con { success, brands }
      return data.brands || [];
    } catch (err) {
      console.error('Error getBrands:', err);
      return [];
    }
  },

  async getAttributesByCategory(categoryId: number): Promise<Attribute[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories/${categoryId}/attributes`);
      if (!res.ok) throw new Error('Error al obtener atributos');
      const data = await res.json();
      // Asume que el backend responde con { success, attributes }
      return data.attributes || [];
    } catch (err) {
      console.error('Error getAttributesByCategory:', err);
      return [];
    }
  },
};
