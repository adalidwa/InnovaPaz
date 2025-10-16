import { useState, useEffect } from 'react';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import './ClientSelector.css';

export interface Client {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  nit?: string;
}

interface ClientSelectorProps {
  onSelectClient: (client: Client | null) => void;
  selectedClient?: Client | null;
}

function ClientSelector({ onSelectClient, selectedClient }: ClientSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);

  // Cliente genérico para ventas sin registro
  const genericClient: Client = {
    id: 1,
    name: 'Cliente General',
    email: '',
    phone: '',
    nit: '',
  };

  useEffect(() => {
    if (searchTerm.length > 2) {
      searchClients();
    } else {
      setClients([]);
      setShowResults(false);
    }
  }, [searchTerm]);

  const searchClients = async () => {
    try {
      setLoading(true);
      // TODO: Implementar búsqueda real de clientes cuando el backend lo soporte
      // const results = await SalesService.searchClients(searchTerm);

      // Mock temporal
      const mockClients: Client[] = [
        {
          id: 2,
          name: 'Juan Pérez',
          email: 'juan@email.com',
          phone: '70123456',
          nit: '1234567',
        },
        {
          id: 3,
          name: 'María García',
          email: 'maria@email.com',
          phone: '71234567',
          nit: '7654321',
        },
      ].filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

      setClients(mockClients);
      setShowResults(true);
    } catch (error) {
      console.error('Error al buscar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectClient = (client: Client) => {
    onSelectClient(client);
    setSearchTerm(client.name);
    setShowResults(false);
  };

  const handleClearClient = () => {
    onSelectClient(null);
    setSearchTerm('');
    setClients([]);
    setShowResults(false);
  };

  const handleUseGenericClient = () => {
    handleSelectClient(genericClient);
  };

  return (
    <div className='client-selector'>
      <label className='client-selector__label'>Cliente</label>

      {!selectedClient ? (
        <>
          <div className='client-selector__search'>
            <Input
              type='text'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder='Buscar cliente por nombre o NIT...'
              onFocus={() => searchTerm.length > 2 && setShowResults(true)}
            />
            {loading && <span className='client-selector__loading'>Buscando...</span>}
          </div>

          {showResults && clients.length > 0 && (
            <div className='client-selector__results'>
              {clients.map((client) => (
                <button
                  key={client.id}
                  className='client-selector__result-item'
                  onClick={() => handleSelectClient(client)}
                >
                  <div className='client-selector__result-name'>{client.name}</div>
                  <div className='client-selector__result-details'>
                    {client.nit && <span>NIT: {client.nit}</span>}
                    {client.phone && <span>Tel: {client.phone}</span>}
                  </div>
                </button>
              ))}
            </div>
          )}

          <Button
            variant='secondary'
            size='small'
            onClick={handleUseGenericClient}
            className='client-selector__generic-btn'
          >
            Usar Cliente General
          </Button>
        </>
      ) : (
        <div className='client-selector__selected'>
          <div className='client-selector__selected-info'>
            <strong>{selectedClient.name}</strong>
            {selectedClient.nit && <span>NIT: {selectedClient.nit}</span>}
            {selectedClient.phone && <span>Tel: {selectedClient.phone}</span>}
          </div>
          <button className='client-selector__clear-btn' onClick={handleClearClient}>
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default ClientSelector;
