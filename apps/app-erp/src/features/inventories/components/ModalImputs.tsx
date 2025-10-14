import React, { useState, useEffect } from 'react';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import Button from '../../../components/common/Button';
import type { ProductFormData } from '../hooks/useProductsReal';
import { categoryBrandService } from '../services/categoryBrandService';
import type { Category, Subcategory, Brand } from '../services/categoryBrandService';
import './ModalImputs.css';

interface ModalImputsProps {
  onSave: (
    productData: ProductFormData
  ) => Promise<{ success: boolean; product?: any; error?: string }>;
  onCancel: () => void;
  loading?: boolean;
}

function ModalImputs({ onSave, onCancel, loading = false }: ModalImputsProps) {
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
    expirationDate: '',
    lot: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    // Cargar categorías y marcas al montar
    categoryBrandService.getCategories().then(setCategories);
    categoryBrandService.getBrands().then(setBrands);
  }, []);

  // Cargar subcategorías cuando se selecciona una categoría padre
  useEffect(() => {
    if (formData.parentCategory) {
      const parentCategoryId = parseInt(formData.parentCategory);
      categoryBrandService.getSubcategories(parentCategoryId).then(setSubcategories);
      // Limpiar la subcategoría seleccionada cuando cambia la categoría padre
      setFormData((prev) => ({ ...prev, category: '' }));
    } else {
      setSubcategories([]);
    }
  }, [formData.parentCategory]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ProductFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del producto es requerido';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'El código del producto es requerido';
    }

    if (!formData.parentCategory) {
      newErrors.parentCategory = 'La categoría principal es requerida';
    }

    if (!formData.category) {
      newErrors.category = 'La subcategoría es requerida';
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

  const resetForm = () => {
    setFormData({
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
      expirationDate: '',
      lot: '',
    });
    setSubcategories([]);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const result = await onSave(formData);
      if (result.success) {
        resetForm();
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

      <Select
        label='Categoría Principal'
        required
        placeholder='Seleccionar categoría principal'
        options={categories.map((cat) => ({
          value: cat.categoria_id.toString(),
          label: cat.nombre_categoria,
        }))}
        value={formData.parentCategory}
        onChange={handleSelectChange('parentCategory')}
      />
      {errors.parentCategory && <span className='error-message'>{errors.parentCategory}</span>}

      <Select
        label='Subcategoría'
        required
        placeholder={
          formData.parentCategory
            ? 'Seleccionar subcategoría'
            : 'Primero selecciona una categoría principal'
        }
        options={subcategories.map((subcat) => ({
          value: subcat.categoria_id.toString(),
          label: subcat.nombre_categoria,
        }))}
        value={formData.category}
        onChange={handleSelectChange('category')}
        disabled={!formData.parentCategory}
      />
      {errors.category && <span className='error-message'>{errors.category}</span>}

      <Select
        label='Marca'
        required
        placeholder='Seleccionar marca'
        options={brands.map((brand) => ({ value: brand.marca_id.toString(), label: brand.nombre }))}
        value={formData.brand || ''}
        onChange={handleSelectChange('brand' as keyof ProductFormData)}
      />
      {errors.brand && <span className='error-message'>{errors.brand}</span>}

      <Input
        label='Descripción'
        placeholder='Descripción del producto...'
        value={formData.description}
        onChange={handleInputChange('description')}
      />

      <Input
        label='Imagen (URL)'
        placeholder='https://...'
        value={formData.image || ''}
        onChange={handleInputChange('image' as keyof ProductFormData)}
      />
      {errors.image && <span className='error-message'>{errors.image}</span>}

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

      <Input
        label='Stock'
        required
        type='number'
        placeholder='0'
        value={formData.stock || ''}
        onChange={handleInputChange('stock')}
        min='0'
      />
      {errors.stock && <span className='error-message'>{errors.stock}</span>}

      <div className='form-section'>
        <h4 className='section-title'>Campos Específicos - Minimarket</h4>

        <div className='form-row'>
          <Input
            label='Fecha de Vencimiento'
            type='date'
            value={formData.expirationDate}
            onChange={handleInputChange('expirationDate')}
          />
          <Input
            label='Lote'
            placeholder='Ej: LOT2024001'
            value={formData.lot}
            onChange={handleInputChange('lot')}
          />
        </div>
      </div>

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
          {loading ? 'Guardando...' : 'Guardar Producto'}
        </Button>
      </div>
    </form>
  );
}

export default ModalImputs;
