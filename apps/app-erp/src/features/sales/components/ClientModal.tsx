import React from 'react';
import { Modal, Button, Input } from '../../../components/common';
import { useClientForm, useClients } from '../hooks/hooks';
import SalesService from '../services/salesService';
import type { Client } from '../types';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client | null;
  onSuccess?: () => void;
}

export const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  client = null,
  onSuccess,
}) => {
  const isEditMode = !!client;
  const { form, handleFormInputChange, resetForm, loadClient, updateField } = useClientForm();
  const { addClient, updateClient, validateClient } = useClients();
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [categories, setCategories] = React.useState<any[]>([]);

  // Cargar categorías disponibles
  React.useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await SalesService.getAllCategories();
        console.log('Categorías cargadas:', cats);
        setCategories(cats);
      } catch (err) {
        console.error('Error cargando categorías:', err);
      }
    };
    loadCategories();
  }, []);

  // Cargar datos del cliente cuando se abre en modo edición
  React.useEffect(() => {
    if (isOpen && client) {
      loadClient(client);
    } else if (isOpen && !client) {
      resetForm();
    }
  }, [isOpen, client, loadClient, resetForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    const validation = validateClient(form);
    if (validation) {
      setError(validation);
      setIsSubmitting(false);
      return;
    }

    try {
      if (isEditMode && client) {
        console.log('Actualizando cliente:', form);
        await updateClient(client.id, form);
        console.log('Cliente actualizado exitosamente');
      } else {
        console.log('Agregando cliente:', form);
        await addClient(form);
        console.log('Cliente agregado exitosamente');
      }

      resetForm();
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('❌ Error:', err);
      const errorMsg = err?.message || err?.toString() || 'Error desconocido';
      setError(`Error al ${isEditMode ? 'actualizar' : 'agregar'} el cliente: ${errorMsg}`);
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

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    console.log('Valor seleccionado (raw):', value);

    if (value === '' || value === 'undefined') {
      console.log('Estableciendo categoryId como undefined');
      updateField('categoryId', undefined);
    } else {
      const numValue = parseInt(value, 10);
      console.log('Estableciendo categoryId como:', numValue);
      updateField('categoryId', numValue);
    }
  };

  return (
    <Modal
      message=''
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? 'Editar Cliente' : 'Agregar Nuevo Cliente'}
      size='large'
      showCancelButton={false}
    >
      <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
        {error && (
          <div
            style={{
              padding: '12px',
              backgroundColor: '#fee',
              border: '1px solid #fcc',
              borderRadius: '6px',
              color: '#c33',
              marginBottom: '20px',
              fontSize: '14px',
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
            marginBottom: '16px',
          }}
        >
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: 'var(--pri-900)',
                fontSize: '14px',
              }}
            >
              Nombre del Cliente *
            </label>
            <Input
              type='text'
              value={form.name}
              onChange={handleFormInputChange('name')}
              placeholder='Ingrese el nombre completo'
              required
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--pri-300)',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: 'var(--pri-900)',
                fontSize: '14px',
              }}
            >
              NIT/CI *
            </label>
            <Input
              type='text'
              value={form.nit}
              onChange={handleFormInputChange('nit')}
              placeholder='Ej: 1234567890'
              maxLength={13}
              required
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--pri-300)',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: 'var(--pri-900)',
                fontSize: '14px',
              }}
            >
              Teléfono *
            </label>
            <Input
              type='text'
              value={form.phone}
              onChange={handleFormInputChange('phone')}
              placeholder='Ej: 77888999'
              maxLength={8}
              required
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--pri-300)',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: 'var(--pri-900)',
                fontSize: '14px',
              }}
            >
              Email
            </label>
            <Input
              type='email'
              value={form.email}
              onChange={handleFormInputChange('email')}
              placeholder='cliente@email.com'
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--pri-300)',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: 'var(--pri-900)',
                fontSize: '14px',
              }}
            >
              Categoría de Cliente
            </label>
            <select
              value={form.categoryId || ''}
              onChange={handleCategoryChange}
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--pri-300)',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white',
                cursor: 'pointer',
              }}
            >
              <option value=''>Sin categoría</option>
              {categories.map((cat) => (
                <option
                  key={cat.categoria_cliente_id || cat.id}
                  value={cat.categoria_cliente_id || cat.id}
                >
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: 'var(--pri-900)',
                fontSize: '14px',
              }}
            >
              Límite de Crédito (Bs.)
            </label>
            <Input
              type='number'
              value={form.creditLimit.toString()}
              onChange={handleFormInputChange('creditLimit')}
              placeholder='0.00'
              min='0'
              step='0.01'
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--pri-300)',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              color: 'var(--pri-900)',
              fontSize: '14px',
            }}
          >
            Dirección
          </label>
          <Input
            type='text'
            value={form.address}
            onChange={handleFormInputChange('address')}
            placeholder='Dirección completa del cliente'
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid var(--pri-300)',
              borderRadius: '6px',
              fontSize: '14px',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            paddingTop: '16px',
            borderTop: '1px solid var(--pri-200)',
          }}
        >
          <Button
            type='button'
            variant='secondary'
            onClick={handleClose}
            disabled={isSubmitting}
            size='medium'
          >
            Cancelar
          </Button>
          <Button type='submit' variant='primary' disabled={isSubmitting} size='medium'>
            {isSubmitting ? 'Guardando...' : isEditMode ? 'Actualizar Cliente' : 'Agregar Cliente'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
