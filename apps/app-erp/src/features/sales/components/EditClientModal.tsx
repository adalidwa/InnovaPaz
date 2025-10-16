import React from 'react';
import { Modal, Button, Input, Select } from '../../../components/common';
import { useClientForm, useClients, type Client } from '../hooks/hooks';

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onClientUpdated?: (client: Client) => void;
}

export const EditClientModal: React.FC<EditClientModalProps> = ({
  isOpen,
  onClose,
  client,
  onClientUpdated,
}) => {
  const { form, handleFormInputChange, resetForm, loadClient } = useClientForm();
  const { updateClient, validateClient } = useClients();
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const clientTypeOptions = [
    { value: 'regular', label: 'Cliente Regular' },
    { value: 'corporate', label: 'Empresa/Corporativo' },
    { value: 'wholesale', label: 'Cliente Mayorista' },
  ];

  // Cargar datos del cliente cuando se abre el modal
  React.useEffect(() => {
    if (client && isOpen) {
      loadClient(client);
      setError(null);
    }
  }, [client, isOpen, loadClient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting || !client) return;

    setIsSubmitting(true);
    setError(null);

    const validation = validateClient(form);
    if (validation) {
      setError(validation);
      setIsSubmitting(false);
      return;
    }

    try {
      const updatedClient: Client = {
        ...client,
        ...form,
      };

      updateClient(client.id, form);

      if (onClientUpdated) {
        onClientUpdated(updatedClient);
      }

      onClose();
    } catch (err) {
      setError('Error al actualizar el cliente. Por favor, intenta nuevamente.');
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

  if (!client) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title='Editar Cliente'>
      <form onSubmit={handleSubmit} className='space-y-4'>
        {error && (
          <div className='p-3 bg-red-100 border border-red-300 rounded-md text-red-700 text-sm'>
            {error}
          </div>
        )}

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Input
            label='Nombre del Cliente *'
            type='text'
            value={form.name}
            onChange={handleFormInputChange('name')}
            placeholder='Ingrese el nombre completo'
            required
            disabled={isSubmitting}
          />

          <Input
            label='NIT *'
            type='text'
            value={form.nit}
            onChange={handleFormInputChange('nit')}
            placeholder='Ej: 1234567890'
            maxLength={13}
            required
            disabled={isSubmitting}
          />

          <Input
            label='Teléfono *'
            type='text'
            value={form.phone}
            onChange={handleFormInputChange('phone')}
            placeholder='Ej: 77888999'
            maxLength={8}
            required
            disabled={isSubmitting}
          />

          <Input
            label='Email'
            type='email'
            value={form.email}
            onChange={handleFormInputChange('email')}
            placeholder='cliente@email.com'
            disabled={isSubmitting}
          />

          <Select
            label='Tipo de Cliente *'
            value={form.type}
            onChange={(value) => handleFormInputChange('type')({ target: { value } } as any)}
            options={clientTypeOptions}
            required
            disabled={isSubmitting}
          />

          <Input
            label='Límite de Crédito (Bs.)'
            type='number'
            value={form.creditLimit.toString()}
            onChange={handleFormInputChange('creditLimit')}
            placeholder='0.00'
            min='0'
            step='0.01'
            disabled={isSubmitting}
          />

          <Input
            label='Deuda Actual (Bs.)'
            type='number'
            value={form.currentDebt.toString()}
            onChange={handleFormInputChange('currentDebt')}
            placeholder='0.00'
            min='0'
            step='0.01'
            disabled={isSubmitting}
          />
        </div>

        <Input
          label='Dirección'
          type='text'
          value={form.address}
          onChange={handleFormInputChange('address')}
          placeholder='Dirección completa del cliente'
          disabled={isSubmitting}
        />

        <div className='flex justify-end space-x-3 pt-4'>
          <Button type='button' variant='secondary' onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type='submit' variant='primary' disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Actualizar Cliente'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
