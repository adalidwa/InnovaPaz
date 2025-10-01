import { useState } from 'react';
import '../../../assets/styles/theme.css';
import './ProvidersPage.css';
import ProviderCard from '../components/ProviderCard';
import TitleDescription from '../../../components/common/TitleDescription';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import Pagination from '../../../components/common/Pagination';
import { IoSearch, IoAdd, IoClose, IoPeople, IoAnalytics } from 'react-icons/io5';

interface Provider {
  id: number;
  title: string;
  description: string;
  nit: string;
  contact: string;
  phone: string;
  email?: string;
  address?: string;
}

interface HistoryItem {
  id: number;
  date: string;
  type: 'purchase' | 'order' | 'payment';
  description: string;
  amount: number;
  status: 'completed' | 'pending' | 'cancelled';
}

const pageInfo = {
  title: 'Gestión de Proveedores',
  description: 'Administra tus proveedores y evalúa su desempeño',
};

const providersData: Provider[] = [
  {
    id: 1,
    title: 'Embotelladora Boliviana',
    description: 'Define umbrales de stock para reabastecimiento automático',
    nit: '5555555555',
    contact: 'Carlos Mamani',
    phone: '77999888',
    email: 'carlos@embotelladora.bo',
    address: 'Av. América 1234, La Paz',
  },
  {
    id: 2,
    title: 'Distribuidora Altiplano',
    description: 'Proveedor especializado en productos de consumo masivo',
    nit: '1234567890',
    contact: 'María Gonzales',
    phone: '78123456',
    email: 'maria@altiplano.bo',
    address: 'Calle Comercio 567, El Alto',
  },
  {
    id: 3,
    title: 'Alimentos del Valle S.R.L.',
    description: 'Distribuidor de productos alimenticios frescos y conservados',
    nit: '9876543210',
    contact: 'José Vargas',
    phone: '79654321',
    email: 'jose@alimentosvalle.bo',
    address: 'Zona Sur 890, Cochabamba',
  },
  {
    id: 4,
    title: 'Comercial Paceña',
    description: 'Importador y distribuidor de productos internacionales',
    nit: '4567891230',
    contact: 'Ana Quispe',
    phone: '76987654',
    email: 'ana@pacena.bo',
    address: 'Centro Histórico 321, La Paz',
  },
  {
    id: 5,
    title: 'Lacteos Santa Cruz',
    description: 'Especialista en productos lácteos y derivados',
    nit: '7890123456',
    contact: 'Roberto Silva',
    phone: '75456789',
    email: 'roberto@lacteos.bo',
    address: 'Plan 3000, Santa Cruz',
  },
  {
    id: 6,
    title: 'Bebidas Refrescantes Ltda.',
    description: 'Distribuidor exclusivo de bebidas carbonatadas y jugos',
    nit: '3216549870',
    contact: 'Carmen Rodríguez',
    phone: '74789123',
    email: 'carmen@bebidas.bo',
    address: 'Villa Fátima, La Paz',
  },
];

const generateHistoryData = (providerId: number): HistoryItem[] => {
  const histories: Record<number, HistoryItem[]> = {
    1: [
      {
        id: 101,
        date: '2024-09-25',
        type: 'purchase',
        description: 'Compra CocaCola 2L - 200 unidades',
        amount: 15400.5,
        status: 'completed',
      },
      {
        id: 102,
        date: '2024-09-20',
        type: 'order',
        description: 'Orden bebidas gaseosas #OC-789',
        amount: 8750.0,
        status: 'pending',
      },
      {
        id: 103,
        date: '2024-09-15',
        type: 'payment',
        description: 'Pago factura #EMB-001198',
        amount: 12300.75,
        status: 'completed',
      },
      {
        id: 104,
        date: '2024-09-10',
        type: 'purchase',
        description: 'Restock bebidas prioritarias',
        amount: 23500.2,
        status: 'completed',
      },
      {
        id: 105,
        date: '2024-09-05',
        type: 'order',
        description: 'Orden especial eventos #OC-756',
        amount: 6890.4,
        status: 'cancelled',
      },
      {
        id: 106,
        date: '2024-08-30',
        type: 'purchase',
        description: 'Compra agua mineral - 500 unidades',
        amount: 4500.0,
        status: 'completed',
      },
      {
        id: 107,
        date: '2024-08-25',
        type: 'payment',
        description: 'Pago adelanto próxima orden',
        amount: 10000.0,
        status: 'completed',
      },
      {
        id: 108,
        date: '2024-08-20',
        type: 'order',
        description: 'Pedido temporada verano #OC-890',
        amount: 18200.5,
        status: 'completed',
      },
    ],
    2: [
      {
        id: 201,
        date: '2024-09-28',
        type: 'purchase',
        description: 'Compra productos limpieza varios',
        amount: 9800.3,
        status: 'completed',
      },
      {
        id: 202,
        date: '2024-09-22',
        type: 'order',
        description: 'Orden productos consumo masivo #OC-892',
        amount: 15600.8,
        status: 'pending',
      },
      {
        id: 203,
        date: '2024-09-18',
        type: 'payment',
        description: 'Pago factura mensual #ALT-2024-09',
        amount: 22400.6,
        status: 'completed',
      },
      {
        id: 204,
        date: '2024-09-12',
        type: 'purchase',
        description: 'Restock productos higiene personal',
        amount: 11200.45,
        status: 'completed',
      },
      {
        id: 205,
        date: '2024-09-08',
        type: 'order',
        description: 'Pedido especial descuentos #OC-845',
        amount: 7300.2,
        status: 'completed',
      },
      {
        id: 206,
        date: '2024-09-03',
        type: 'purchase',
        description: 'Compra detergentes industriales',
        amount: 13450.75,
        status: 'completed',
      },
    ],
  };

  return (
    histories[providerId] || [
      {
        id: providerId * 100 + 1,
        date: '2024-09-20',
        type: 'purchase',
        description: 'Compra productos varios',
        amount: 8500.0,
        status: 'completed',
      },
      {
        id: providerId * 100 + 2,
        date: '2024-09-15',
        type: 'order',
        description: 'Orden de compra estándar',
        amount: 5200.3,
        status: 'pending',
      },
      {
        id: providerId * 100 + 3,
        date: '2024-09-10',
        type: 'payment',
        description: 'Pago factura mensual',
        amount: 12800.75,
        status: 'completed',
      },
    ]
  );
};

const ITEMS_PER_PAGE = 10;
const HISTORY_ITEMS_PER_PAGE = 5;

function ProvidersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [providers, setProviders] = useState(providersData);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);

  // History modal states
  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const [historyCurrentPage, setHistoryCurrentPage] = useState(1);

  // Add provider form
  const [addForm, setAddForm] = useState({
    title: '',
    description: '',
    nit: '',
    contact: '',
    phone: '',
    email: '',
    address: '',
  });

  const filteredProviders = providers.filter(
    (provider) =>
      provider.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.nit.includes(searchTerm)
  );

  const filteredHistoryData = historyData.filter(
    (item) =>
      item.description.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
      item.status.toLowerCase().includes(historySearchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProviders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProviders = filteredProviders.slice(startIndex, endIndex);

  // History pagination
  const historyTotalPages = Math.ceil(filteredHistoryData.length / HISTORY_ITEMS_PER_PAGE);
  const historyStartIndex = (historyCurrentPage - 1) * HISTORY_ITEMS_PER_PAGE;
  const historyEndIndex = historyStartIndex + HISTORY_ITEMS_PER_PAGE;
  const currentHistoryItems = filteredHistoryData.slice(historyStartIndex, historyEndIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleHistoryPageChange = (page: number) => {
    setHistoryCurrentPage(page);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleHistorySearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHistorySearchTerm(e.target.value);
    setHistoryCurrentPage(1);
  };

  const generateNewId = () => {
    return Math.max(...providers.map((p) => p.id)) + 1;
  };

  const handleProviderClick = (provider: Provider) => {
    setSelectedProvider(provider);
    setHistoryData(generateHistoryData(provider.id));
    setHistorySearchTerm('');
    setHistoryCurrentPage(1);
    setShowHistoryModal(true);
  };

  const handleAddProvider = () => {
    setAddForm({
      title: '',
      description: '',
      nit: '',
      contact: '',
      phone: '',
      email: '',
      address: '',
    });
    setShowAddModal(true);
  };

  const handleSaveAdd = () => {
    if (addForm.title.trim() && addForm.nit.trim() && addForm.contact.trim()) {
      const newProvider: Provider = {
        id: generateNewId(),
        title: addForm.title,
        description: addForm.description,
        nit: addForm.nit,
        contact: addForm.contact,
        phone: addForm.phone,
        email: addForm.email,
        address: addForm.address,
      };
      setProviders([...providers, newProvider]);
      setShowAddModal(false);
    }
  };

  const getStatusColor = (status: HistoryItem['status']) => {
    switch (status) {
      case 'completed':
        return { bg: 'var(--sec-100)', text: 'var(--sec-800)' };
      case 'pending':
        return { bg: 'var(--warning-100)', text: 'var(--warning-800)' };
      case 'cancelled':
        return { bg: 'var(--acc-100)', text: 'var(--acc-800)' };
      default:
        return { bg: 'var(--pri-100)', text: 'var(--pri-800)' };
    }
  };

  const getTypeIcon = (type: HistoryItem['type']) => {
    switch (type) {
      case 'purchase':
        return '🛒';
      case 'order':
        return '📋';
      case 'payment':
        return '💰';
      default:
        return '📄';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-BO');
  };

  const getTotalAmount = () => {
    return filteredHistoryData
      .filter((item) => item.status === 'completed')
      .reduce((total, item) => total + item.amount, 0);
  };

  return (
    <div className='providers-page'>
      <div className='providers-header'>
        <div className='providersTitleSection'>
          <TitleDescription
            title={pageInfo.title}
            description={pageInfo.description}
            titleSize={32}
            descriptionSize={16}
          />
          <Button
            variant='primary'
            onClick={handleAddProvider}
            icon={<IoAdd />}
            className='addProviderButton'
          >
            Nuevo Proveedor
          </Button>
        </div>
        <div className='providers-search'>
          <Input
            placeholder='Buscar proveedores...'
            value={searchTerm}
            onChange={handleSearchChange}
            leftIcon={<IoSearch color='var(--pri-500)' />}
            className='search-input'
          />
        </div>
      </div>

      <div className='providers-content'>
        <div className='providers-grid'>
          {currentProviders.map((provider) => (
            <ProviderCard
              key={provider.id}
              title={provider.title}
              description={provider.description}
              nit={provider.nit}
              contact={provider.contact}
              phone={provider.phone}
              buttonText='Ver historial'
              buttonVariant='primary'
              onButtonClick={() => handleProviderClick(provider)}
              titleSize={20}
              descriptionSize={14}
            />
          ))}
        </div>

        {filteredProviders.length > ITEMS_PER_PAGE && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredProviders.length}
            itemsPerPage={ITEMS_PER_PAGE}
            itemName='proveedores'
            onPageChange={handlePageChange}
          />
        )}

        {filteredProviders.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '3rem',
              color: 'var(--pri-600)',
              fontSize: '1.125rem',
            }}
          >
            No se encontraron proveedores que coincidan con tu búsqueda.
          </div>
        )}
      </div>

      {/* Modal Agregar Proveedor */}
      {showAddModal && (
        <div className='modalOverlay'>
          <div className='providerModal'>
            <div className='providerModalHeader'>
              <h3>Agregar Nuevo Proveedor</h3>
              <button
                className='providerModalClose'
                onClick={() => setShowAddModal(false)}
                type='button'
              >
                <IoClose size={20} />
              </button>
            </div>
            <div className='providerModalBody'>
              <div className='providerModalField'>
                <label>Nombre de la Empresa:</label>
                <Input
                  type='text'
                  value={addForm.title}
                  onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                  placeholder='Ingrese el nombre de la empresa'
                  className='providerModalInput'
                />
              </div>
              <div className='providerModalField'>
                <label>Descripción:</label>
                <Input
                  type='text'
                  value={addForm.description}
                  onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                  placeholder='Descripción de productos/servicios'
                  className='providerModalInput'
                />
              </div>
              <div className='providerModalField'>
                <label>NIT:</label>
                <Input
                  type='text'
                  value={addForm.nit}
                  onChange={(e) => setAddForm({ ...addForm, nit: e.target.value })}
                  placeholder='Número de Identificación Tributaria'
                  className='providerModalInput'
                />
              </div>
              <div className='providerModalField'>
                <label>Persona de Contacto:</label>
                <Input
                  type='text'
                  value={addForm.contact}
                  onChange={(e) => setAddForm({ ...addForm, contact: e.target.value })}
                  placeholder='Nombre del contacto principal'
                  className='providerModalInput'
                />
              </div>
              <div className='providerModalField'>
                <label>Teléfono:</label>
                <Input
                  type='text'
                  value={addForm.phone}
                  onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                  placeholder='Número de teléfono'
                  className='providerModalInput'
                />
              </div>
              <div className='providerModalField'>
                <label>Email:</label>
                <Input
                  type='email'
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder='Correo electrónico (opcional)'
                  className='providerModalInput'
                />
              </div>
              <div className='providerModalField'>
                <label>Dirección:</label>
                <Input
                  type='text'
                  value={addForm.address}
                  onChange={(e) => setAddForm({ ...addForm, address: e.target.value })}
                  placeholder='Dirección física (opcional)'
                  className='providerModalInput'
                />
              </div>
            </div>
            <div className='providerModalFooter'>
              <div className='providerModalMainButtons'>
                <Button
                  variant='secondary'
                  onClick={() => setShowAddModal(false)}
                  className='providerModalButton'
                >
                  Cancelar
                </Button>
                <Button variant='primary' onClick={handleSaveAdd} className='providerModalButton'>
                  Agregar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Historial Proveedor */}
      {showHistoryModal && selectedProvider && (
        <div className='modalOverlay'>
          <div className='historyModal'>
            <div className='historyModalHeader'>
              <div className='historyModalTitle'>
                <IoPeople size={24} color='var(--pri-600)' />
                <div>
                  <h3>{selectedProvider.title}</h3>
                  <p className='historyModalSubtitle'>Historial de Transacciones</p>
                </div>
              </div>
              <button
                className='historyModalClose'
                onClick={() => setShowHistoryModal(false)}
                type='button'
              >
                <IoClose size={20} />
              </button>
            </div>

            <div className='historyModalStats'>
              <div className='historyStat'>
                <div className='historyStatIcon'>
                  <IoAnalytics color='var(--sec-600)' />
                </div>
                <div className='historyStatContent'>
                  <div className='historyStatValue'>{formatCurrency(getTotalAmount())}</div>
                  <div className='historyStatLabel'>Total Compras</div>
                </div>
              </div>
              <div className='historyStat'>
                <div className='historyStatIcon'>📦</div>
                <div className='historyStatContent'>
                  <div className='historyStatValue'>{filteredHistoryData.length}</div>
                  <div className='historyStatLabel'>Transacciones</div>
                </div>
              </div>
            </div>

            <div className='historyModalSearch'>
              <Input
                placeholder='Buscar en el historial...'
                value={historySearchTerm}
                onChange={handleHistorySearchChange}
                leftIcon={<IoSearch color='var(--pri-500)' />}
                className='search-input'
              />
            </div>

            <div className='historyModalBody'>
              <div className='historyList'>
                {currentHistoryItems.map((item) => {
                  const statusColors = getStatusColor(item.status);
                  return (
                    <div key={item.id} className='historyItem'>
                      <div className='historyItemIcon'>{getTypeIcon(item.type)}</div>
                      <div className='historyItemContent'>
                        <div className='historyItemHeader'>
                          <div className='historyItemDescription'>{item.description}</div>
                          <div className='historyItemAmount'>{formatCurrency(item.amount)}</div>
                        </div>
                        <div className='historyItemFooter'>
                          <div className='historyItemDate'>{formatDate(item.date)}</div>
                          <div
                            className='historyItemStatus'
                            style={{
                              backgroundColor: statusColors.bg,
                              color: statusColors.text,
                            }}
                          >
                            {item.status === 'completed'
                              ? 'Completado'
                              : item.status === 'pending'
                                ? 'Pendiente'
                                : 'Cancelado'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredHistoryData.length === 0 && (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: 'var(--pri-600)',
                    fontSize: '1rem',
                  }}
                >
                  No se encontraron transacciones que coincidan con tu búsqueda.
                </div>
              )}
            </div>

            {filteredHistoryData.length > HISTORY_ITEMS_PER_PAGE && (
              <div className='historyModalPagination'>
                <Pagination
                  currentPage={historyCurrentPage}
                  totalPages={historyTotalPages}
                  totalItems={filteredHistoryData.length}
                  itemsPerPage={HISTORY_ITEMS_PER_PAGE}
                  itemName='transacciones'
                  onPageChange={handleHistoryPageChange}
                />
              </div>
            )}

            <div className='historyModalFooter'>
              <Button
                variant='secondary'
                onClick={() => setShowHistoryModal(false)}
                className='historyModalButton'
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProvidersPage;
