import React, { useState, useEffect } from 'react';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import Button from '../../../components/common/Button';
import type { ProductFormData } from '../hooks/useProductsReal';
import type { ProductLegacy } from '../types/inventory';
import { categoryBrandService } from '../services/categoryBrandService';
import type { Category, Brand, Attribute } from '../services/categoryBrandService';
import './ModalImputs.css';

interface EditProductModalProps {
  product: ProductLegacy;
  onSave: (productData: ProductFormData) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
  loading?: boolean;
}

function EditProductModal({ product, onSave, onCancel, loading = false }: EditProductModalProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    code: '',
    parentCategory: '',
    category: '',
    brand: '',
    image: '',
    description: '',
    price: 0,
    cost: 0,
    stock: 0,
    marca_id: undefined,
    estado_id: undefined,
    dynamicAttributes: {},
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});

  // Estados para datos dinámicos
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);

  // Inicializar el formulario con los datos del producto
  useEffect(() => {
    if (product) {
      setFormData({
        id: product.id, // Preservar el ID del producto
        name: product.name,
        code: product.code,
        parentCategory: '', // Se cargará dinámicamente basado en la categoría
        category: product.categoria_id?.toString() || product.category,
        brand: product.marca_id?.toString() || '',
        image: product.image || '', // Cargar imagen existente
        description: product.description || '',
        price: product.price,
        cost: product.cost,
        stock: product.stock,
        marca_id: product.marca_id, // Preservar marca_id original
        estado_id: product.estado_id, // Preservar estado_id original
        dynamicAttributes: {},
      });
    }
  }, [product]);

  // Cargar categorías principales, marcas y datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [categoriesResponse, brandsResponse] = await Promise.all([
          categoryBrandService.getCategories(),
          categoryBrandService.getBrands(),
        ]);

        setParentCategories(categoriesResponse);
        setBrands(brandsResponse);

        // Si hay un producto, intentar cargar sus subcategorías y atributos
        if (product && product.category) {
          // Intentar encontrar la categoría padre basándose en la categoría actual
          // Por ahora, mantener vacío y que el usuario seleccione manualmente
          // TODO: Implementar lógica para determinar categoría padre desde el backend
        }
      } catch (error) {
        console.error('Error cargando datos iniciales:', error);
      }
    };

    if (product) {
      loadInitialData();
    }
  }, [product]);

  // Manejar cambio de categoría principal
  const handleParentCategoryChange = async (parentCategoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      parentCategory: parentCategoryId,
      category: '', // Reset subcategory
      dynamicAttributes: {}, // Reset attributes
    }));

    if (parentCategoryId) {
      try {
        const subcategoriesResponse = await categoryBrandService.getSubcategories(
          Number(parentCategoryId)
        );
        setSubcategories(subcategoriesResponse);
        setAttributes([]); // Clear attributes when parent category changes
      } catch (error) {
        console.error('Error cargando subcategorías:', error);
      }
    } else {
      setSubcategories([]);
      setAttributes([]);
    }
  };

  // Manejar cambio de subcategoría
  const handleSubcategoryChange = async (subcategoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      category: subcategoryId,
      dynamicAttributes: {}, // Reset attributes
    }));

    if (subcategoryId) {
      try {
        const attributesResponse = await categoryBrandService.getAttributesByCategory(
          Number(subcategoryId)
        );
        setAttributes(attributesResponse);
      } catch (error) {
        console.error('Error cargando atributos:', error);
      }
    } else {
      setAttributes([]);
    }
  };

  // Manejar cambio de atributo dinámico
  const handleDynamicAttributeChange = (attributeId: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      dynamicAttributes: {
        ...prev.dynamicAttributes,
        [attributeId]: value,
      },
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ProductFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del producto es requerido';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'El código del producto es requerido';
    }

    if (!formData.category) {
      newErrors.category = 'La categoría es requerida';
    }

    if (formData.price <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0';
    }

    if (formData.cost <= 0) {
      newErrors.cost = 'El costo debe ser mayor a 0';
    }

    if (formData.stock < 0) {
      newErrors.stock = 'El stock no puede ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const result = await onSave(formData);
      if (result.success) {
        onCancel(); // Cerrar el modal después de guardar exitosamente
      }
    }
  };

  const handleInputChange = (field: keyof ProductFormData) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Limpiar error del campo si existe
      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }));
      }
    };
  };

  const handleSelectChange = (field: keyof ProductFormData) => {
    return (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));

      // Limpiar error del campo si existe
      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }));
      }
    };
  };

  return (
    <form className='modal-form' onSubmit={handleSubmit}>
      <div className='form-row'>
        <Input
          label='Nombre del Producto'
          required
          placeholder='Ej: Coca Cola 500ml'
          value={formData.name}
          onChange={handleInputChange('name')}
        />
        <Input
          label='Código del Producto'
          required
          placeholder='Ej: COC500'
          value={formData.code}
          onChange={handleInputChange('code')}
        />
      </div>

      {errors.name && <span className='error-message'>{errors.name}</span>}
      {errors.code && <span className='error-message'>{errors.code}</span>}

      <div className='form-row'>
        <Select
          label='Categoría Principal'
          required
          placeholder='Seleccionar categoría principal'
          options={parentCategories.map((cat) => ({
            value: cat.categoria_id.toString(),
            label: cat.nombre_categoria,
          }))}
          value={formData.parentCategory}
          onChange={(e) => handleParentCategoryChange(e.target.value)}
        />

        <Select
          label='Subcategoría'
          required
          placeholder='Seleccionar subcategoría'
          options={subcategories.map((sub) => ({
            value: sub.categoria_id.toString(),
            label: sub.nombre_categoria,
          }))}
          value={formData.category}
          onChange={(e) => handleSubcategoryChange(e.target.value)}
          disabled={!formData.parentCategory}
        />
      </div>

      {errors.parentCategory && <span className='error-message'>{errors.parentCategory}</span>}
      {errors.category && <span className='error-message'>{errors.category}</span>}

      <div className='form-row'>
        <Select
          label='Marca'
          placeholder='Seleccionar marca'
          options={brands.map((brand) => ({
            value: brand.marca_id.toString(),
            label: brand.nombre,
          }))}
          value={formData.brand}
          onChange={handleSelectChange('brand')}
        />

        <Input
          label='Imagen URL'
          placeholder='https://ejemplo.com/imagen.jpg'
          value={formData.image}
          onChange={handleInputChange('image')}
        />
      </div>

      {errors.brand && <span className='error-message'>{errors.brand}</span>}
      {errors.image && <span className='error-message'>{errors.image}</span>}

      <Input
        label='Descripción'
        placeholder='Descripción del producto...'
        value={formData.description}
        onChange={handleInputChange('description')}
      />

      {/* Atributos dinámicos específicos de la categoría */}
      {attributes.length > 0 && (
        <div className='form-section'>
          <h4 className='section-title'>Atributos Específicos</h4>
          {attributes.map((attr) => {
            const value = formData.dynamicAttributes[attr.atributo_id] || '';

            return (
              <div key={attr.atributo_id} className='form-field'>
                <Input
                  label={`${attr.nombre}${attr.es_obligatorio ? ' *' : ''}${attr.unidad_medida ? ` (${attr.unidad_medida})` : ''}`}
                  type={
                    attr.tipo_atributo === 'número'
                      ? 'number'
                      : attr.tipo_atributo === 'fecha'
                        ? 'date'
                        : 'text'
                  }
                  placeholder={`Ingrese ${attr.nombre.toLowerCase()}`}
                  value={value}
                  onChange={(e) => handleDynamicAttributeChange(attr.atributo_id, e.target.value)}
                  required={attr.es_obligatorio}
                />
              </div>
            );
          })}
        </div>
      )}

      <div className='form-row'>
        <Input
          label='Precio de Venta (Bs.)'
          required
          type='number'
          placeholder='0.00'
          value={formData.price || ''}
          onChange={handleInputChange('price')}
          step='0.01'
          min='0'
        />
        <Input
          label='Costo (Bs.)'
          required
          type='number'
          placeholder='0.00'
          value={formData.cost || ''}
          onChange={handleInputChange('cost')}
          step='0.01'
          min='0'
        />
      </div>

      {errors.price && <span className='error-message'>{errors.price}</span>}
      {errors.cost && <span className='error-message'>{errors.cost}</span>}

      <div className='form-row'>
        <Input
          label='Stock Actual'
          required
          type='number'
          placeholder='0'
          value={formData.stock || ''}
          onChange={handleInputChange('stock')}
          min='0'
        />
      </div>

      {errors.stock && <span className='error-message'>{errors.stock}</span>}

      <div className='form-actions'>
        <Button
          variant='secondary'
          size='medium'
          type='button'
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button variant='primary' size='medium' type='submit' disabled={loading}>
          {loading ? 'Actualizando...' : 'Actualizar Producto'}
        </Button>
      </div>
    </form>
  );
}

export default EditProductModal;
