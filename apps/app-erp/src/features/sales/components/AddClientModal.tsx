import React from 'react';
import { Modal, Button, Input } from '../../../components/common';
import { useClientForm, useClients } from '../hooks/hooks';
import type { Client } from '../types';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientAdded?: (client: Client) => void;
}

export const AddClientModal: React.FC<AddClientModalProps> = ({
  isOpen,
  onClose,
  onClientAdded,
}) => {
  const { form, handleFormInputChange, resetForm } = useClientForm();
  const { addClient, validateClient } = useClients();
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

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
      await addClient(form);

      if (onClientAdded) {
        const newClient: Client = {
          ...form,
          id: Date.now(),
          lastPurchase: form.lastPurchase || new Date().toISOString().split('T')[0],
        };
        onClientAdded(newClient);
      }

      resetForm();
      onClose();
    } catch (err) {
      setError('Error al agregar el cliente. Por favor, intenta nuevamente.');
      console.error('Error adding client:', err);
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title='Agregar Nuevo Cliente'
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
              Tipo de Cliente *
            </label>
            <select
              value={form.type}
              onChange={(e) => {
                const event = {
                  target: { value: e.target.value },
                } as React.ChangeEvent<HTMLInputElement>;
                handleFormInputChange('type')(event);
              }}
              required
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
              <option value='regular'>Cliente Regular</option>
              <option value='corporate'>Empresa/Corporativo</option>
              <option value='wholesale'>Cliente Mayorista</option>
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
            {isSubmitting ? 'Guardando...' : 'Agregar Cliente'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
