import { useClients } from '../hooks/hooks';
import { AddClientModal } from './AddClientModal';
import Table, { type TableColumn, type TableAction } from '../../../components/common/Table';
import Button from '../../../components/common/Button';
import TitleDescription from '../../../components/common/TitleDescription';
import Modal from '../../../components/common/Modal';
import './ClientsTable.css';
import { useState } from 'react';

interface ClientsTableProps {
  onAddClient?: () => void;
  onManageCategories?: () => void;
}

function ClientsTable({ onAddClient, onManageCategories }: ClientsTableProps) {
  const { currentClients, loading, deleteClient } = useClients();

  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);

  const handleEditClient = (client: any) => {
    console.log('Editando cliente:', client);
    // TODO: Implementar edición de cliente
  };

  const handleDeleteClient = async (client: any) => {
    if (window.confirm(`¿Está seguro de eliminar al cliente ${client.name}?`)) {
      try {
        await deleteClient(client.id);
      } catch (error) {
        alert('Error al eliminar cliente');
      }
    }
  };

  const handleAddNewClient = () => {
    if (onAddClient) {
      onAddClient();
    } else {
      setIsAddClientModalOpen(true);
    }
  };

  const handleManageCategories = () => {
    if (onManageCategories) {
      onManageCategories();
    } else {
      setIsCategoriesModalOpen(true);
    }
  };

  const handleCloseAddClientModal = () => {
    setIsAddClientModalOpen(false);
  };

  const handleCloseCategoriesModal = () => {
    setIsCategoriesModalOpen(false);
  };

  const handleClientAdded = () => {
    // El hook useClients ya actualiza la lista automáticamente
    setIsAddClientModalOpen(false);
  };

  const renderCategoryTag = (type: string) => {
    const getCategoryClass = (t: string) => {
      switch (t) {
        case 'corporate':
          return 'clients-table__category clients-table__category--vip';
        case 'wholesale':
          return 'clients-table__category clients-table__category--wholesale';
        case 'regular':
          return 'clients-table__category clients-table__category--retail';
        default:
          return 'clients-table__category';
      }
    };

    const categoryLabels: Record<string, string> = {
      corporate: 'Cliente VIP',
      wholesale: 'Mayorista',
      regular: 'Minorista',
    };

    return <span className={getCategoryClass(type)}>{categoryLabels[type] || type}</span>;
  };

  const columns: TableColumn<any>[] = [
    {
      key: 'name',
      header: 'Nombre',
      className: 'clients-table__name-cell',
    },
    {
      key: 'email',
      header: 'Email',
      className: 'clients-table__email-cell',
    },
    {
      key: 'phone',
      header: 'Teléfono',
      className: 'clients-table__phone-cell',
    },
    {
      key: 'nit',
      header: 'NIT/CI',
      className: 'clients-table__nit-cell',
    },
    {
      key: 'type',
      header: 'Categoría',
      render: (value) => renderCategoryTag(value),
      className: 'clients-table__category-cell',
    },
  ];

  const actions: TableAction<any>[] = [
    {
      label: 'Editar',
      onClick: handleEditClient,
      variant: 'primary',
    },
    {
      label: 'Eliminar',
      onClick: handleDeleteClient,
      variant: 'danger',
    },
  ];

  if (loading) {
    return (
      <div className='clients-table'>
        <div className='clients-table__loading'>Cargando clientes...</div>
      </div>
    );
  }

  return (
    <>
      <div className='clients-table'>
        <div className='clients-table__container'>
          {/* Header Section */}
          <div className='clients-table__header'>
            <div className='clients-table__title-section'>
              <div className='clients-table__icon'>
                <svg width='24' height='24' viewBox='0 0 24 24' fill='currentColor'>
                  <path d='M16 4C18.21 4 20 5.79 20 8S18.21 12 16 12 12 10.21 12 8 13.79 4 16 4M16 14C20.42 14 24 15.79 24 18V20H8V18C8 15.79 11.58 14 16 14M6 6H2V4H6V6M6 10H2V8H6V10M6 14H2V12H6V14Z' />
                </svg>
              </div>
              <TitleDescription
                title='Clientes Registrados'
                description='Gestión completa de clientes y categorías'
                titleSize={24}
                descriptionSize={14}
                titleWeight='semibold'
                descriptionWeight='normal'
                titleColor='var(--pri-900)'
                descriptionColor='var(--pri-600)'
                className='clients-table__title-desc'
              />
            </div>

            <div className='clients-table__actions'>
              {/* Management Buttons Group */}
              <div className='clients-table__management-buttons'>
                <Button
                  variant='primary'
                  size='medium'
                  onClick={handleAddNewClient}
                  icon={
                    <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'>
                      <path d='M16 4C18.21 4 20 5.79 20 8S18.21 12 16 12 12 10.21 12 8 13.79 4 16 4M16 14C20.42 14 24 15.79 24 18V20H8V18C8 15.79 11.58 14 16 14M6 6H2V4H6V6M6 10H2V8H6V10M6 14H2V12H6V14Z' />
                    </svg>
                  }
                  iconPosition='left'
                  className='clients-table__management-btn'
                >
                  Gestión de Clientes
                </Button>

                <Button
                  variant='outline'
                  size='medium'
                  onClick={handleManageCategories}
                  icon={
                    <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'>
                      <path d='M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM7.5 18H9.5V16H7.5V18ZM7.5 8H9.5V6H7.5V8ZM7.5 13H9.5V11H7.5V13ZM11.5 18H16V16H11.5V18ZM11.5 8H16V6H11.5V8ZM11.5 13H16V11H11.5V13Z' />
                    </svg>
                  }
                  iconPosition='left'
                  className='clients-table__management-btn'
                >
                  Gestión de Categorías
                </Button>
              </div>

              {/* Quick Action Button */}
              <div className='clients-table__quick-actions'>
                <Button
                  variant='secondary'
                  size='medium'
                  onClick={handleAddNewClient}
                  icon={
                    <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'>
                      <path d='M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z' />
                    </svg>
                  }
                  iconPosition='left'
                  className='clients-table__add-btn'
                >
                  Agregar Cliente
                </Button>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className='clients-table__content'>
            <Table
              data={currentClients}
              columns={columns}
              actions={actions}
              className='clients-table__table'
              emptyMessage='No hay clientes registrados'
            />
          </div>
        </div>
      </div>

      {/* Add Client Modal */}
      <AddClientModal
        isOpen={isAddClientModalOpen}
        onClose={handleCloseAddClientModal}
        onClientAdded={handleClientAdded}
      />

      {/* Categories Management Modal */}
      <Modal
        isOpen={isCategoriesModalOpen}
        onClose={handleCloseCategoriesModal}
        title='Gestión de Categorías'
        message='Funcionalidad de gestión de categorías en desarrollo...'
        modalType='info'
        confirmButtonText='Entendido'
        size='medium'
        showCancelButton={false}
      />
    </>
  );
}

export default ClientsTable;
