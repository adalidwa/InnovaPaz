import React from 'react';
import { IoSearch, IoAdd, IoClose, IoPeople, IoAnalytics } from 'react-icons/io5';

// Imports locales
import './ProvidersPage.css';
import { useProviders, useHistory, useModal, useProviderForm, type Provider } from '../hooks/hooks';

// Imports de componentes
import TitleDescription from '../../../components/common/TitleDescription';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import Pagination from '../../../components/common/Pagination';
import ProviderCard from '../components/ProviderCard';

const PAGE_INFO = {
  title: 'Gestión de Proveedores',
  description: 'Administra tus proveedores y evalúa su desempeño',
};

const ProvidersPage: React.FC = () => {
  // Hooks para proveedores
  const {
    currentProviders,
    filteredProviders,
    searchTerm,
    currentPage,
    totalPages,
    addProvider,
    validateProvider,
    handleSearchChange,
    handlePageChange,
    ITEMS_PER_PAGE,
  } = useProviders();

  // Hooks para historial
  const {
    selectedProviderId,
    historyData,
    currentHistoryItems,
    searchTerm: historySearchTerm,
    currentPage: historyCurrentPage,
    totalPages: historyTotalPages,
    getTotalAmount,
    getStatusColor,
    getTypeIcon,
    getStatusText,
    selectProvider,
    clearSelection,
    handleSearchChange: handleHistorySearchChange,
    handlePageChange: handleHistoryPageChange,
    formatCurrency,
    formatDate,
    HISTORY_ITEMS_PER_PAGE,
  } = useHistory();

  // Hooks para modales
  const {
    showAddModal,
    showHistoryModal,
    openAddModal,
    closeAddModal,
    openHistoryModal,
    closeHistoryModal,
  } = useModal();

  // Hook para formulario
  const { form, resetForm, handleFormInputChange } = useProviderForm();

  // Handlers
  const handleProviderClick = (provider: Provider): void => {
    selectProvider(provider.id);
    openHistoryModal();
  };

  const handleAddProvider = (): void => {
    resetForm();
    openAddModal();
  };

  const handleSaveProvider = (): void => {
    const newProvider = {
      title: form.title.trim(),
      description: form.description.trim(),
      nit: form.nit,
      contact: form.contact.trim(),
      phone: form.phone,
      email: form.email.trim(),
      address: form.address.trim(),
    };

    const validationError = validateProvider(newProvider);

    if (validationError) {
      alert(validationError);
      return;
    }

    addProvider(newProvider);
    closeAddModal();
  };

  const getSelectedProvider = (): Provider | null => {
    return currentProviders.find((p) => p.id === selectedProviderId) || null;
  };

  return (
    <div className='providers-page'>
      <div className='providers-header'>
        <div className='providersTitleSection'>
          <TitleDescription
            title={PAGE_INFO.title}
            description={PAGE_INFO.description}
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

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredProviders.length}
            itemsPerPage={ITEMS_PER_PAGE}
            itemName='proveedores'
            onPageChange={handlePageChange}
          />
        )}

        {currentProviders.length === 0 && (
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

      {showAddModal && (
        <div className='modalOverlay'>
          <div className='providerModal'>
            <div className='providerModalHeader'>
              <h3>Agregar Nuevo Proveedor</h3>
              <button className='providerModalClose' onClick={closeAddModal} type='button'>
                <IoClose size={20} />
              </button>
            </div>

            <div className='providerModalBody'>
              {[
                {
                  key: 'title',
                  label: 'Nombre de la Empresa',
                  placeholder: 'Ingrese el nombre de la empresa',
                },
                {
                  key: 'description',
                  label: 'Descripción',
                  placeholder: 'Descripción de productos/servicios',
                },
                {
                  key: 'nit',
                  label: 'NIT',
                  placeholder: 'Ej: 1234567890',
                  maxLength: 13,
                  pattern: '[0-9]*',
                },
                {
                  key: 'contact',
                  label: 'Persona de Contacto',
                  placeholder: 'Nombre del contacto principal',
                },
                {
                  key: 'phone',
                  label: 'Teléfono',
                  placeholder: 'Ej: 77999888',
                  maxLength: 8,
                  pattern: '[0-9]*',
                },
                { key: 'email', label: 'Email', placeholder: 'ejemplo@empresa.bo', type: 'email' },
                { key: 'address', label: 'Dirección', placeholder: 'Dirección física (opcional)' },
              ].map(({ key, label, placeholder, maxLength, pattern, type = 'text' }) => (
                <div key={key} className='providerModalField'>
                  <label>{label}:</label>
                  <Input
                    type={type}
                    value={form[key as keyof typeof form]}
                    onChange={handleFormInputChange(key as keyof typeof form)}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    pattern={pattern}
                    className='providerModalInput'
                  />
                </div>
              ))}
            </div>

            <div className='providerModalFooter'>
              <div className='providerModalMainButtons'>
                <Button variant='secondary' onClick={closeAddModal} className='providerModalButton'>
                  Cancelar
                </Button>
                <Button
                  variant='primary'
                  onClick={handleSaveProvider}
                  className='providerModalButton'
                >
                  Agregar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showHistoryModal && getSelectedProvider() && (
        <div className='modalOverlay'>
          <div className='historyModal'>
            <div className='historyModalHeader'>
              <div className='historyModalTitle'>
                <IoPeople size={24} color='var(--pri-600)' />
                <div>
                  <h3>{getSelectedProvider()?.title}</h3>
                  <p className='historyModalSubtitle'>Historial de Transacciones</p>
                </div>
              </div>
              <button
                className='historyModalClose'
                onClick={() => {
                  clearSelection();
                  closeHistoryModal();
                }}
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
                  <div className='historyStatValue'>{historyData.length}</div>
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
                            {getStatusText(item.status)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {historyData.length === 0 && (
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

            {historyTotalPages > 1 && (
              <div className='historyModalPagination'>
                <Pagination
                  currentPage={historyCurrentPage}
                  totalPages={historyTotalPages}
                  totalItems={historyData.length}
                  itemsPerPage={HISTORY_ITEMS_PER_PAGE}
                  itemName='transacciones'
                  onPageChange={handleHistoryPageChange}
                />
              </div>
            )}

            <div className='historyModalFooter'>
              <Button
                variant='secondary'
                onClick={() => {
                  clearSelection();
                  closeHistoryModal();
                }}
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
};

export default ProvidersPage;
