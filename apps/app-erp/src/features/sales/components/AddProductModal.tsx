import React from 'react';
import { Modal, Button, Input } from '../../../components/common';
import { useProductForm, type Product } from '../hooks/hooks';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded?: (product: Product) => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onProductAdded,
}) => {
  const { form, updateField, resetForm } = useProductForm();
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    const validation = null as string | null;
    if (validation) {
      setError(validation);
      setIsSubmitting(false);
      return;
    }

    try {
      const newProduct: Product = {
        ...form,
        id: Date.now(), // Temporal, será reemplazado por generateId en el hook
        status:
          form.stock < form.minStock
            ? 'Crítico'
            : form.stock < form.minStock * 1.5
              ? 'Bajo Stock'
              : 'Disponible',
      };

      // TODO: integrate addProduct via products context

      if (onProductAdded) {
        onProductAdded(newProduct);
      }

      resetForm();
      onClose();
    } catch (err) {
      setError('Error al agregar el producto. Por favor, intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      setError(null);
      onClose();
    }
  };

  const handleInputChange =
    (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
      let value: string | number = e.target.value;

      if (['price', 'cost', 'stock', 'minStock', 'maxStock'].includes(field)) {
        value = Math.max(0, parseFloat(value) || 0);
      } else {
        value = value.toString().trim();
      }

      updateField(field, value);
    };

  return (
    <Modal message='' isOpen={isOpen} onClose={handleClose} title='Agregar Nuevo Producto'>
      <form onSubmit={handleSubmit} className='space-y-4'>
        {error && (
          <div className='p-3 bg-red-100 border border-red-300 rounded-md text-red-700 text-sm'>
            {error}
          </div>
        )}

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Input
            label='Nombre del Producto *'
            type='text'
            value={form.name}
            onChange={handleInputChange('name')}
            placeholder='Ej: CocaCola 2L'
            required
            disabled={isSubmitting}
          />

          <Input
            label='Código del Producto *'
            type='text'
            value={form.code}
            onChange={handleInputChange('code')}
            placeholder='Ej: CC2L001'
            required
            disabled={isSubmitting}
          />

          <Input
            label='Categoría *'
            type='text'
            value={form.category}
            onChange={handleInputChange('category')}
            placeholder='Ej: Bebidas'
            required
            disabled={isSubmitting}
          />

          <Input
            label='Precio de Venta (Bs.) *'
            type='number'
            value={form.price.toString()}
            onChange={handleInputChange('price')}
            placeholder='0.00'
            min='0'
            step='0.01'
            required
            disabled={isSubmitting}
          />

          <Input
            label='Costo del Producto (Bs.)'
            type='number'
            value={form.cost.toString()}
            onChange={handleInputChange('cost')}
            placeholder='0.00'
            min='0'
            step='0.01'
            disabled={isSubmitting}
          />

          <Input
            label='Stock Actual *'
            type='number'
            value={form.stock.toString()}
            onChange={handleInputChange('stock')}
            placeholder='0'
            min='0'
            required
            disabled={isSubmitting}
          />

          <Input
            label='Stock Mínimo *'
            type='number'
            value={form.minStock.toString()}
            onChange={handleInputChange('minStock')}
            placeholder='0'
            min='0'
            required
            disabled={isSubmitting}
          />

          <Input
            label='Stock Máximo *'
            type='number'
            value={form.maxStock.toString()}
            onChange={handleInputChange('maxStock')}
            placeholder='0'
            min='0'
            required
            disabled={isSubmitting}
          />
        </div>

        <div className='flex justify-end space-x-3 pt-4'>
          <Button type='button' variant='secondary' onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type='submit' variant='primary' disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Agregar Producto'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
