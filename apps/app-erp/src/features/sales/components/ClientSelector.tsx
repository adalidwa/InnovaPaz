import { useState, useEffect, useRef } from 'react';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import SalesService from '../services/salesService';
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
  const [allClients, setAllClients] = useState<Client[]>([]);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Cliente genérico para ventas sin registro
  const genericClient: Client = {
    id: 20,
    name: 'Cliente General',
    email: '',
    phone: '',
    nit: '0',
  };

  // Cargar todos los clientes al montar
  useEffect(() => {
    loadAllClients();
  }, []);

  // Manejar click fuera del dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Buscar cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm.length > 0) {
      searchClients();
    } else {
      setClients(allClients.slice(0, 10));
    }
  }, [searchTerm, allClients]);

  const loadAllClients = async () => {
    try {
      setLoading(true);
      const data = await SalesService.getAllClients();
      setAllClients(data);
      setClients(data.slice(0, 10)); // Mostrar primeros 10
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      setAllClients([]);
    } finally {
      setLoading(false);
    }
  };

  const searchClients = () => {
    const searchLower = searchTerm.toLowerCase();
    const filtered = allClients.filter(
      (client) =>
        client.name.toLowerCase().includes(searchLower) ||
        client.nit.toLowerCase().includes(searchLower) ||
        (client.email && client.email.toLowerCase().includes(searchLower))
    );
    setClients(filtered.slice(0, 10)); // Limitar a 10 resultados
  };

  const handleSelectClient = (client: Client) => {
    onSelectClient(client);
    setSearchTerm('');
    setShowResults(false);
  };

  const handleClearClient = () => {
    onSelectClient(null);
    setSearchTerm('');
    setShowResults(false);
  };

  const handleUseGenericClient = () => {
    handleSelectClient(genericClient);
  };

  const handleInputFocus = () => {
    setShowResults(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowResults(true);
  };

  return (
    <div className='client-selector'>
      <label className='client-selector__label'>Cliente *</label>

      {!selectedClient ? (
        <>
          <div className='client-selector__search' ref={resultsRef}>
            <Input
              type='text'
              value={searchTerm}
              onChange={handleInputChange}
              placeholder='Buscar por nombre, NIT o email...'
              onFocus={handleInputFocus}
            />
            {loading && <span className='client-selector__loading'>Cargando...</span>}

            {showResults && (
              <div className='client-selector__results'>
                {clients.length > 0 ? (
                  <>
                    {clients.map((client) => (
                      <button
                        key={client.id}
                        className='client-selector__result-item'
                        onClick={() => handleSelectClient(client)}
                        type='button'
                      >
                        <div className='client-selector__result-name'>{client.name}</div>
                        <div className='client-selector__result-details'>
                          {client.nit && client.nit !== '0' && <span>NIT: {client.nit}</span>}
                          {client.phone && <span> • Tel: {client.phone}</span>}
                        </div>
                      </button>
                    ))}
                    {searchTerm && (
                      <div className='client-selector__results-footer'>
                        Mostrando {clients.length} resultado{clients.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </>
                ) : (
                  <div className='client-selector__no-results'>
                    {searchTerm ? 'No se encontraron clientes' : 'No hay clientes registrados'}
                  </div>
                )}
              </div>
            )}
          </div>

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
            <div className='client-selector__selected-details'>
              {selectedClient.nit && selectedClient.nit !== '0' && (
                <span>NIT: {selectedClient.nit}</span>
              )}
              {selectedClient.phone && <span> • Tel: {selectedClient.phone}</span>}
              {selectedClient.email && <span> • Email: {selectedClient.email}</span>}
            </div>
          </div>
          <button
            className='client-selector__clear-btn'
            onClick={handleClearClient}
            type='button'
            title='Cambiar cliente'
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default ClientSelector;
