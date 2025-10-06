import React, { useState } from 'react';
import Table, { type TableColumn, type TableAction } from '../../../components/common/Table';
import Button from '../../../components/common/Button';
import TitleDescription from '../../../components/common/TitleDescription';
import './ClientsTable.css';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  nit_ci: string;
  category: 'Mayorista' | 'Cliente VIP' | 'Minorista';
}

interface ClientsTableProps {
  onAddClient?: () => void;
}

// Datos de ejemplo basados en la imagen
const mockClients: Client[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    email: 'juan@email.com',
    phone: '70123456',
    nit_ci: '123456789',
    category: 'Mayorista',
  },
  {
    id: '2',
    name: 'María García',
    email: 'maria@email.com',
    phone: '71234567',
    nit_ci: '987654321',
    category: 'Cliente VIP',
  },
  {
    id: '3',
    name: 'Pedro López',
    email: 'pedro@email.com',
    phone: '72345678',
    nit_ci: '456789123',
    category: 'Minorista',
  },
];

function ClientsTable({ onAddClient }: ClientsTableProps) {
  const [clients, setClients] = useState<Client[]>(mockClients);

  const handleEditClient = (client: Client) => {
    console.log('Editando cliente:', client);
  };

  const handleDeleteClient = (client: Client) => {
    if (window.confirm(`¿Está seguro de eliminar al cliente ${client.name}?`)) {
      setClients(clients.filter((c) => c.id !== client.id));
    }
  };

  const handleAddNewClient = () => {
    if (onAddClient) {
      onAddClient();
    } else {
      console.log('Agregando nuevo cliente');
    }
  };

  const renderCategoryTag = (category: Client['category']) => {
    const getCategoryClass = (cat: string) => {
      switch (cat) {
        case 'Cliente VIP':
          return 'clients-table__category clients-table__category--vip';
        case 'Mayorista':
          return 'clients-table__category clients-table__category--wholesale';
        case 'Minorista':
          return 'clients-table__category clients-table__category--retail';
        default:
          return 'clients-table__category';
      }
    };

    return <span className={getCategoryClass(category)}>{category}</span>;
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
      key: 'nit_ci',
      header: 'NIT/CI',
      className: 'clients-table__nit-cell',
    },
    {
      key: 'category',
      header: 'Categoría',
      render: (value) => renderCategoryTag(value),
      className: 'clients-table__category-cell',
    },
  ];

  const actions: TableAction<Client>[] = [
    {
      label: 'Editar',
      onClick: handleEditClient,
      variant: 'primary',
    },
  ];

  return (
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
              description='Gestión completa de ventas, clientes, cotizaciones y pedidos'
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
            <Button
              variant='primary'
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

        {/* Table Section */}
        <div className='clients-table__content'>
          <Table
            data={clients}
            columns={columns}
            actions={actions}
            className='clients-table__table'
            emptyMessage='No hay clientes registrados'
          />
        </div>
      </div>
    </div>
  );
}

export default ClientsTable;
