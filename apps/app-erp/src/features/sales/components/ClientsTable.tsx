import { useClients } from '../hooks/hooks';
import { ClientModal } from './ClientModal';
import { ManageClientsModal } from './ManageClientsModal';
import { ManageCategoriesModal } from './ManageCategoriesModal';
import Table, { type TableColumn, type TableAction } from '../../../components/common/Table';
import Button from '../../../components/common/Button';
import TitleDescription from '../../../components/common/TitleDescription';
import Modal from '../../../components/common/Modal';
import './ClientsTable.css';
import { useState } from 'react';
import type { Client } from '../types';

interface ClientsTableProps {
  onManageCategories?: () => void;
}

function ClientsTable({ onManageCategories }: ClientsTableProps) {
  const { currentClients, loading, deleteClient } = useClients();

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [isManageClientsModalOpen, setIsManageClientsModalOpen] = useState(false);

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setIsClientModalOpen(true);
  };

  const handleDeleteClick = (client: Client) => {
    setClientToDelete(client);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (clientToDelete) {
      try {
        await deleteClient(clientToDelete.id);
        setIsDeleteModalOpen(false);
        setClientToDelete(null);
      } catch (error) {
        console.error('Error al desactivar cliente:', error);
        alert('Error al desactivar cliente');
      }
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setClientToDelete(null);
  };

  const handleAddNewClient = () => {
    setSelectedClient(null);
    setIsClientModalOpen(true);
  };

  const handleOpenManageClients = () => {
    setIsManageClientsModalOpen(true);
  };

  const handleCloseManageClients = () => {
    setIsManageClientsModalOpen(false);
  };

  const handleManageCategories = () => {
    if (onManageCategories) {
      onManageCategories();
    } else {
      setIsCategoriesModalOpen(true);
    }
  };

  const handleCloseClientModal = () => {
    setIsClientModalOpen(false);
    setSelectedClient(null);
  };

  const handleCloseCategoriesModal = () => {
    setIsCategoriesModalOpen(false);
  };

  const handleClientSuccess = () => {
    handleCloseClientModal();
  };

  const renderCategoryTag = (categoryName: string) => {
    let categoryClass = 'clients-table__category';

    if (categoryName?.toLowerCase().includes('vip')) {
      categoryClass += ' clients-table__category--vip';
    } else if (categoryName?.toLowerCase().includes('mayorista')) {
      categoryClass += ' clients-table__category--wholesale';
    } else {
      categoryClass += ' clients-table__category--retail';
    }

    return <span className={categoryClass}>{categoryName || 'Sin categoría'}</span>;
  };

  const columns: TableColumn<Client>[] = [
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
      key: 'categoryName',
      header: 'Categoría',
      render: (value) => renderCategoryTag(value as string),
      className: 'clients-table__category-cell',
    },
  ];

  const actions: TableAction<Client>[] = [
    {
      label: 'Editar',
      onClick: handleEditClient,
      variant: 'primary',
    },
    {
      label: 'Desactivar',
      onClick: handleDeleteClick,
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
                  onClick={handleOpenManageClients}
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

      {/* Client Modal (Add/Edit) */}
      <ClientModal
        isOpen={isClientModalOpen}
        onClose={handleCloseClientModal}
        client={selectedClient}
        onSuccess={handleClientSuccess}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title='Desactivar Cliente'
        message={`¿Está seguro de desactivar al cliente "${clientToDelete?.name}"? El cliente no se eliminará, solo se marcará como inactivo.`}
        modalType='warning'
        confirmButtonText='Sí, Desactivar'
        cancelButtonText='Cancelar'
        size='medium'
      />

      {/* Manage Clients Modal */}
      <ManageClientsModal
        isOpen={isManageClientsModalOpen}
        onClose={handleCloseManageClients}
        onClientStatusChanged={() => {
          /* Recargar lista de clientes activos */
        }}
      />

      {/* Categories Management Modal */}
      <ManageCategoriesModal
        isOpen={isCategoriesModalOpen}
        onClose={handleCloseCategoriesModal}
        onCategoryChanged={() => {
          /* Recargar si es necesario */
        }}
      />
    </>
  );
}

export default ClientsTable;
