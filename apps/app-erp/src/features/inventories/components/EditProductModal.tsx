import React, { useState, useEffect } from 'react';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import Button from '../../../components/common/Button';
import type { ProductFormData } from '../hooks/useProducts';
import type { Product } from '../types/inventory';
import './ModalImputs.css';

interface EditProductModalProps {
  product: Product;
  onSave: (productData: ProductFormData) => { success: boolean; error?: string };
  onCancel: () => void;
  loading?: boolean;
}

function EditProductModal({ product, onSave, onCancel, loading = false }: EditProductModalProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    code: '',
    category: '',
    description: '',
    price: 0,
    cost: 0,
    stock: 0,
    minStock: 0,
    expirationDate: '',
    lot: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});

  // Inicializar el formulario con los datos del producto
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        code: product.code,
        category: product.category,
        description: product.description || '',
        price: product.price,
        cost: product.cost,
        stock: product.stock,
        minStock: product.minStock,
        expirationDate: product.expirationDate || '',
        lot: product.lot || '',
      });
    }
  }, [product]);

  const categorias = [
    { value: 'Bebidas', label: 'Bebidas' },
    { value: 'Alimentos', label: 'Alimentos' },
    { value: 'Limpieza', label: 'Limpieza' },
    { value: 'Higiene Personal', label: 'Higiene Personal' },
    { value: 'Lácteos', label: 'Lácteos' },
    { value: 'Snacks', label: 'Snacks' },
  ];

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

    if (formData.minStock < 0) {
      newErrors.minStock = 'El stock mínimo no puede ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const result = onSave(formData);
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

      <Select
        label='Categoría'
        required
        placeholder='Seleccionar categoría'
        options={categorias}
        value={formData.category}
        onChange={handleSelectChange('category')}
      />

      {errors.category && <span className='error-message'>{errors.category}</span>}

      <Input
        label='Descripción'
        placeholder='Descripción del producto...'
        value={formData.description}
        onChange={handleInputChange('description')}
      />

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
        <Input
          label='Stock Mínimo'
          required
          type='number'
          placeholder='0'
          value={formData.minStock || ''}
          onChange={handleInputChange('minStock')}
          min='0'
        />
      </div>

      {errors.stock && <span className='error-message'>{errors.stock}</span>}
      {errors.minStock && <span className='error-message'>{errors.minStock}</span>}

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
          {loading ? 'Actualizando...' : 'Actualizar Producto'}
        </Button>
      </div>
    </form>
  );
}

export default EditProductModal;
