import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Input, Table, Pagination, StatusTag } from '../../../components/common';
import { formatCurrency, formatDate } from '../utils';
import { useClients } from '../hooks/hooks';
import SalesService from '../services/salesService';
import type { Sale } from '../types';

interface ClientHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId?: number | null;
}

interface HistoryItem {
  date: string;
  type: 'sale' | 'payment' | 'credit';
  description: string;
  amount: number;
  status: 'completed' | 'pending' | 'cancelled';
}

export const ClientHistoryModal: React.FC<ClientHistoryModalProps> = ({
  isOpen,
  onClose,
  clientId,
}) => {
  const { clients } = useClients();
  const [selectedClientId, setSelectedClientId] = useState<number | null>(clientId || null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Cargar ventas del cliente seleccionado
  useEffect(() => {
    if (selectedClientId) {
      loadClientSales(selectedClientId);
    }
  }, [selectedClientId]);

  // Si se pasa un clientId como prop, seleccionarlo automáticamente
  useEffect(() => {
    if (clientId && clientId !== selectedClientId) {
      setSelectedClientId(clientId);
    }
  }, [clientId]);

  const loadClientSales = async (clientId: number) => {
    try {
      setLoading(true);
      const clientSales = await SalesService.getSalesByClient(clientId);
      setSales(clientSales);
    } catch (error) {
      console.error('Error al cargar ventas del cliente:', error);
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  // Convertir ventas a items de historial
  const historyItems: HistoryItem[] = useMemo(() => {
    return sales.map((sale) => ({
      date: sale.date,
      type: 'sale' as const,
      description: `Venta #${sale.id} - ${sale.products.length} productos`,
      amount: sale.total,
      status: sale.status,
    }));
  }, [sales]);

  // Filtrar items por búsqueda
  const filteredItems = useMemo(() => {
    if (!searchTerm) return historyItems;
    const searchLower = searchTerm.toLowerCase();
    return historyItems.filter(
      (item) =>
        item.description.toLowerCase().includes(searchLower) || item.date.includes(searchLower)
    );
  }, [historyItems, searchTerm]);

  // Paginación
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentHistoryItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  const getTotalAmount = () => {
    return filteredItems.reduce((sum, item) => sum + item.amount, 0);
  };

  const getStatusColor = (status: string): { text: string; bg: string } => {
    switch (status) {
      case 'completed':
        return { text: 'var(--success)', bg: 'var(--success-bg)' };
      case 'pending':
        return { text: 'var(--warning)', bg: 'var(--warning-bg)' };
      case 'cancelled':
        return { text: 'var(--danger)', bg: 'var(--danger-bg)' };
      default:
        return { text: 'var(--gray-700)', bg: 'var(--gray-100)' };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sale':
        return '💰';
      case 'payment':
        return '💳';
      case 'credit':
        return '📋';
      default:
        return '📄';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const selectClient = (clientId: number) => {
    setSelectedClientId(clientId);
    setSearchTerm('');
    setCurrentPage(1);
  };

  const clearSelection = () => {
    setSelectedClientId(null);
    setSales([]);
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleClose = () => {
    clearSelection();
    onClose();
  };

  const columns = [
    {
      key: 'date',
      header: 'Fecha',
      render: (item: HistoryItem) => formatDate(item.date),
    },
    {
      key: 'type',
      header: 'Tipo',
      render: (item: HistoryItem) => (
        <div className='flex items-center space-x-2'>
          <span>{getTypeIcon(item.type)}</span>
          <span className='capitalize'>{item.type === 'sale' ? 'Venta' : item.type}</span>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Descripción',
    },
    {
      key: 'amount',
      header: 'Monto',
      render: (item: HistoryItem) => formatCurrency(item.amount),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (item: HistoryItem) => {
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

            {/* Estado de carga */}
            {loading ? (
              <div className='text-center py-8 text-gray-500'>Cargando historial...</div>
            ) : (
              <>
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
                        totalItems={historyItems.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </div>
              </>
            )}
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
