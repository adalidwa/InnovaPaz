import React from 'react';
import { Modal, Button, Input, Table, Pagination, StatusTag } from '../../../components/common';
import { useHistory, useClients, formatCurrency, formatDate } from '../hooks/hooks';

interface ClientHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId?: number | null;
}

export const ClientHistoryModal: React.FC<ClientHistoryModalProps> = ({
  isOpen,
  onClose,
  clientId,
}) => {
  const { clients } = useClients();
  const {
    selectedClientId,
    currentHistoryItems,
    searchTerm,
    currentPage,
    totalPages,
    getTotalAmount,
    getStatusColor,
    getTypeIcon,
    getStatusText,
    selectClient,
    clearSelection,
    handleSearchChange,
    handlePageChange,
  } = useHistory();

  // Si se pasa un clientId, seleccionarlo automáticamente
  React.useEffect(() => {
    if (clientId && clientId !== selectedClientId) {
      selectClient(clientId);
    }
  }, [clientId, selectedClientId, selectClient]);

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  const columns = [
    {
      key: 'date',
      label: 'Fecha',
      render: (item: any) => formatDate(item.date),
    },
    {
      key: 'type',
      label: 'Tipo',
      render: (item: any) => (
        <div className='flex items-center space-x-2'>
          <span>{getTypeIcon(item.type)}</span>
          <span className='capitalize'>{item.type}</span>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Descripción',
    },
    {
      key: 'amount',
      label: 'Monto',
      render: (item: any) => formatCurrency(item.amount),
    },
    {
      key: 'status',
      label: 'Estado',
      render: (item: any) => {
        const colors = getStatusColor(item.status);
        return (
          <StatusTag
            text={getStatusText(item.status)}
            textColor={colors.text}
            backgroundColor={colors.bg}
          />
        );
      },
    },
  ];

  const handleClose = () => {
    clearSelection();
    onClose();
  };

  return (
    <Modal
      message=''
      isOpen={isOpen}
      onClose={handleClose}
      title='Historial de Cliente'
      size='large'
    >
      <div className='space-y-4'>
        {!selectedClient ? (
          <div className='text-center py-8'>
            <div className='text-gray-500 mb-4'>Selecciona un cliente para ver su historial</div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto'>
              {clients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => selectClient(client.id)}
                  className='p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
                >
                  <div className='font-medium text-gray-900'>{client.name}</div>
                  <div className='text-sm text-gray-500'>NIT: {client.nit}</div>
                  <div className='text-sm text-gray-500'>{client.phone}</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Información del cliente seleccionado */}
            <div className='bg-gray-50 p-4 rounded-lg'>
              <div className='flex justify-between items-start'>
                <div>
                  <h3 className='text-lg font-semibold text-gray-900'>{selectedClient.name}</h3>
                  <div className='text-sm text-gray-600 space-y-1'>
                    <div>NIT: {selectedClient.nit}</div>
                    <div>Teléfono: {selectedClient.phone}</div>
                    <div>Email: {selectedClient.email}</div>
                    <div>Tipo: {selectedClient.type}</div>
                  </div>
                </div>
                <div className='text-right'>
                  <div className='text-sm text-gray-600'>Total Transacciones:</div>
                  <div className='text-lg font-semibold text-green-600'>
                    {formatCurrency(getTotalAmount())}
                  </div>
                  <div className='text-sm text-gray-600 mt-2'>
                    Límite de Crédito: {formatCurrency(selectedClient.creditLimit)}
                  </div>
                  <div className='text-sm text-gray-600'>
                    Deuda Actual: {formatCurrency(selectedClient.currentDebt)}
                  </div>
                </div>
              </div>
              <Button variant='secondary' size='small' onClick={clearSelection} className='mt-3'>
                Cambiar Cliente
              </Button>
            </div>

            {/* Búsqueda */}
            <div className='flex justify-between items-center'>
              <Input
                type='text'
                placeholder='Buscar en el historial...'
                value={searchTerm}
                onChange={handleSearchChange}
                className='max-w-md'
              />
            </div>

            {/* Tabla de historial */}
            <div className='space-y-4'>
              <Table
                data={currentHistoryItems}
                columns={columns}
                emptyMessage='No se encontró historial para este cliente'
              />

              {totalPages > 1 && (
                <div className='flex justify-center'>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>
          </>
        )}

        <div className='flex justify-end pt-4'>
          <Button variant='secondary' onClick={handleClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
};
