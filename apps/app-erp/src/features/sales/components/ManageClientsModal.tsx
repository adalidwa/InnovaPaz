import React, { useState, useEffect } from 'react';
import { Modal, Button } from '../../../components/common';
import { SalesService } from '../services/salesService';
import './ManageClientsModal.css';

interface ManageClientsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientStatusChanged?: () => void;
}

export const ManageClientsModal: React.FC<ManageClientsModalProps> = ({
  isOpen,
  onClose,
  onClientStatusChanged,
}) => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadAllClients();
    }
  }, [isOpen]);

  const loadAllClients = async () => {
    try {
      setLoading(true);
      // Llamar a un nuevo endpoint que devuelva todos los clientes sin filtrar
      const data = await SalesService.getAllClientsWithInactive();
      setClients(data);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (clientId: number, currentStatus: string) => {
    try {
      if (currentStatus === 'activo') {
        await SalesService.deleteClient(clientId);
      } else {
        await SalesService.activateClient(clientId);
      }
      await loadAllClients();
      onClientStatusChanged?.();
    } catch (error) {
      console.error('Error al cambiar estado del cliente:', error);
      alert('Error al cambiar el estado del cliente');
    }
  };

  const filteredClients = clients.filter((client) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'active' && client.estado === 'activo') ||
      (filter === 'inactive' && client.estado === 'inactivo');

    const matchesSearch =
      searchTerm === '' ||
      client.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.nit_ci?.includes(searchTerm);

    return matchesFilter && matchesSearch;
  });

  return (
    <Modal
      message=''
      isOpen={isOpen}
      onClose={onClose}
      title='Gestión de Clientes'
      size='large'
      showCancelButton={false}
    >
      <div className='manage-clients-modal'>
        {/* Filters */}
        <div className='manage-clients-modal__filters'>
          <div className='manage-clients-modal__search'>
            <input
              type='text'
              placeholder='Buscar cliente...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='manage-clients-modal__search-input'
            />
          </div>
          <div className='manage-clients-modal__filter-buttons'>
            <button
              className={`manage-clients-modal__filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Todos ({clients.length})
            </button>
            <button
              className={`manage-clients-modal__filter-btn ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              Activos ({clients.filter((c) => c.estado === 'activo').length})
            </button>
            <button
              className={`manage-clients-modal__filter-btn ${filter === 'inactive' ? 'active' : ''}`}
              onClick={() => setFilter('inactive')}
            >
              Inactivos ({clients.filter((c) => c.estado === 'inactivo').length})
            </button>
          </div>
        </div>

        {/* Clients List */}
        <div className='manage-clients-modal__content'>
          {loading ? (
            <div className='manage-clients-modal__loading'>Cargando clientes...</div>
          ) : filteredClients.length === 0 ? (
            <div className='manage-clients-modal__empty'>No se encontraron clientes</div>
          ) : (
            <div className='manage-clients-modal__list'>
              {filteredClients.map((client) => (
                <div key={client.cliente_id} className='manage-clients-modal__item'>
                  <div className='manage-clients-modal__item-info'>
                    <div className='manage-clients-modal__item-name'>
                      {client.nombre}
                      <span
                        className={`manage-clients-modal__status ${client.estado === 'activo' ? 'active' : 'inactive'}`}
                      >
                        {client.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <div className='manage-clients-modal__item-details'>
                      <span>NIT/CI: {client.nit_ci}</span>
                      <span>Teléfono: {client.telefono}</span>
                      {client.email && <span>Email: {client.email}</span>}
                    </div>
                  </div>
                  <div className='manage-clients-modal__item-actions'>
                    <Button
                      variant={client.estado === 'activo' ? 'accent' : 'success'}
                      size='small'
                      onClick={() => handleToggleStatus(client.cliente_id, client.estado)}
                    >
                      {client.estado === 'activo' ? 'Desactivar' : 'Activar'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='manage-clients-modal__footer'>
          <Button variant='secondary' size='medium' onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
};
